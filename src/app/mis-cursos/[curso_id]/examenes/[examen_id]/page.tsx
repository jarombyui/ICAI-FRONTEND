"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';

function getUserId() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

function HistorialIntentos({ examenId }: { examenId: string }) {
  const [intentos, setIntentos] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/examenes/examenes/${examenId}/mis-intentos`).then(res => setIntentos(res.data));
  }, [examenId]);
  if (!intentos.length) return null;
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Historial de intentos</h2>
      <table className="w-full text-sm bg-gray-900 rounded">
        <thead>
          <tr>
            <th className="py-1">Fecha</th>
            <th className="py-1">Puntaje</th>
            <th className="py-1">Aprobado</th>
          </tr>
        </thead>
        <tbody>
          {intentos.map((intento, idx) => (
            <tr key={idx} className="text-center">
              <td>{new Date(intento.fecha).toLocaleString()}</td>
              <td>{intento.puntaje}%</td>
              <td className={intento.aprobado ? "text-green-500" : "text-red-500"}>{intento.aprobado ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExamenPage() {
  const { examen_id } = useParams<{ examen_id: string }>();
  const [examen, setExamen] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: number]: number }>({});
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [aprobado, setAprobado] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [certMsg, setCertMsg] = useState("");

  useEffect(() => {
    api.get(`/examenes/examenes/${examen_id}`)
      .then(res => setExamen(res.data))
      .catch(() => setMsg("No se pudo cargar el examen"))
      .finally(() => setLoading(false));
  }, [examen_id]);

  useEffect(() => {
    // Si ya hay un intento aprobado, bloquear reintentos
    api.get(`/examenes/examenes/${examen_id}/mis-intentos`).then(res => {
      if (res.data.some((i: any) => i.aprobado)) setAprobado(true);
    });
  }, [examen_id, resultado]);

  const handleChange = (preguntaId: number, respuestaId: number) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: respuestaId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    setPendingSubmit(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    setPendingSubmit(false);
    if (!examen) return;
    const body = {
      respuestas: Object.entries(respuestas).map(([pregunta_id, respuesta_id]) => ({
        pregunta_id: Number(pregunta_id),
        respuesta_id: Number(respuesta_id)
      }))
    };
    try {
      const res = await api.post(`/examenes/examenes/${examen_id}/responder`, body);
      setResultado(res.data);
      if (res.data.aprobado) {
        setAprobado(true);
        // Emitir certificado automáticamente
        try {
          // Obtener curso_id desde el examen
          const examenDetalle = examen;
          let cursoId = null;
          if (examenDetalle && examenDetalle.modulo_id) {
            // Obtener el curso_id del módulo
            const moduloRes = await api.get(`/modulos/${examenDetalle.modulo_id}`);
            cursoId = moduloRes.data.curso_id;
          }
          if (cursoId) {
            const token = localStorage.getItem('token');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              await api.post('/certificados/emitir', { usuario_id: payload.id, curso_id: cursoId });
              setCertMsg('¡Certificado generado! Ahora puedes descargarlo desde Mis Cursos.');
            }
          }
        } catch (err) {
          setCertMsg('No se pudo emitir el certificado automáticamente, pero puedes intentar descargarlo desde Mis Cursos.');
        }
      }
    } catch {
      setMsg("No se pudo enviar el examen");
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (msg) return <div className="p-8 text-red-600">{msg}</div>;
  if (!examen) return <div className="p-8">Examen no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircleIcon className="h-8 w-8 text-blue-700" />
        <h1 className="text-2xl font-bold">{examen.nombre}</h1>
      </div>
      <HistorialIntentos examenId={examen_id as string} />
      {resultado ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            {resultado.aprobado ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600" />
            )}
            <span className={resultado.aprobado ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
              {resultado.aprobado ? "¡Aprobado! Ya puedes descargar tu certificado si tu curso lo permite." : "No aprobado"}
            </span>
          </div>
          <p>Correctas: <span className="font-semibold">{resultado.correctas}</span> de {resultado.total}</p>
          <p>Porcentaje: <span className="font-semibold">{resultado.porcentaje}%</span></p>
          {/* Feedback detallado por pregunta */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Detalle de tus respuestas:</h3>
            <ul className="space-y-2">
              {resultado.detalle?.map((d: any, idx: number) => (
                <li key={idx} className="border rounded p-2 bg-white flex flex-col gap-1">
                  <div className="font-semibold flex items-center gap-2">
                    {d.es_correcta ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                    {d.texto}
                  </div>
                  <div>
                    Tu respuesta: <span className={d.es_correcta ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{d.respuesta_seleccionada || "Sin respuesta"}</span>
                  </div>
                  {!d.es_correcta && (
                    <div>Respuesta correcta: <span className="text-green-700 font-bold">{d.respuesta_correcta}</span></div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Mensaje de certificado */}
          {resultado.aprobado && certMsg && (
            <div className="mt-2 text-blue-700 font-semibold">{certMsg}</div>
          )}
        </div>
      ) : aprobado ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-4 shadow flex items-center gap-2">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <p className="font-semibold text-green-700">Ya aprobaste este examen. Puedes descargar tu certificado si tu curso lo permite.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow border">
          {examen.preguntas.map((pregunta: any, idx: number) => (
            <div key={pregunta.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-bold">{idx + 1}</span>
                <p className="font-semibold">{pregunta.texto}</p>
              </div>
              <div className="space-y-1 ml-6">
                {pregunta.respuestas.map((respuesta: any) => (
                  <label key={respuesta.id} className="block cursor-pointer hover:bg-blue-50 rounded px-2 py-1">
                    <input
                      type="radio"
                      name={`pregunta_${pregunta.id}`}
                      value={respuesta.id}
                      checked={respuestas[pregunta.id] === respuesta.id}
                      onChange={() => handleChange(pregunta.id, respuesta.id)}
                      className="mr-2 accent-blue-700"
                      required
                    />
                    {respuesta.texto}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 font-semibold flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-white" /> Enviar examen
          </button>
        </form>
      )}
      {/* Modal de confirmación al enviar examen */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-2">¿Enviar examen?</Dialog.Title>
            <Dialog.Description className="mb-4">¿Estás seguro de que quieres enviar tus respuestas? No podrás cambiarlas después.</Dialog.Description>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
              <button onClick={confirmSubmit} disabled={!pendingSubmit} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Enviar</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 