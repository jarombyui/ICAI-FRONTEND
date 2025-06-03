"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";

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
      if (res.data.aprobado) setAprobado(true);
    } catch {
      setMsg("No se pudo enviar el examen");
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (msg) return <div className="p-8 text-red-600">{msg}</div>;
  if (!examen) return <div className="p-8">Examen no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{examen.nombre}</h1>
      <HistorialIntentos examenId={examen_id as string} />
      {resultado ? (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="font-semibold">Resultado:</p>
          <p>Correctas: {resultado.correctas} de {resultado.total}</p>
          <p>Porcentaje: {resultado.porcentaje}%</p>
          <p className={resultado.aprobado ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
            {resultado.aprobado ? "¡Aprobado! Ya puedes descargar tu certificado si tu curso lo permite." : "No aprobado"}
          </p>
          {/* Feedback detallado por pregunta */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Detalle de tus respuestas:</h3>
            <ul className="space-y-2">
              {resultado.detalle?.map((d: any, idx: number) => (
                <li key={idx} className="border rounded p-2 bg-white">
                  <div className="font-semibold">{d.texto}</div>
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
        </div>
      ) : aprobado ? (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="font-semibold text-green-700">Ya aprobaste este examen. Puedes descargar tu certificado si tu curso lo permite.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {examen.preguntas.map((pregunta: any) => (
            <div key={pregunta.id} className="mb-4">
              <p className="font-semibold mb-2">{pregunta.texto}</p>
              <div className="space-y-1">
                {pregunta.respuestas.map((respuesta: any) => (
                  <label key={respuesta.id} className="block">
                    <input
                      type="radio"
                      name={`pregunta_${pregunta.id}`}
                      value={respuesta.id}
                      checked={respuestas[pregunta.id] === respuesta.id}
                      onChange={() => handleChange(pregunta.id, respuesta.id)}
                      className="mr-2"
                      required
                    />
                    {respuesta.texto}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Enviar examen</button>
        </form>
      )}
    </div>
  );
} 