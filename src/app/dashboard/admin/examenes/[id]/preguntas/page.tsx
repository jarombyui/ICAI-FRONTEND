"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";

interface Pregunta {
  id: number;
  texto: string;
}
interface Respuesta {
  id: number;
  texto: string;
  es_correcta: boolean;
}

export default function PreguntasPage() {
  const { id } = useParams<{ id: string }>(); // id del examen
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editPregunta, setEditPregunta] = useState<Partial<Pregunta>>({ texto: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [preguntaId, setPreguntaId] = useState<number | null>(null);
  const [showRespModal, setShowRespModal] = useState(false);
  const [editResp, setEditResp] = useState<Partial<Respuesta>>({ texto: "", es_correcta: false });
  const [editRespId, setEditRespId] = useState<number | null>(null);

  useEffect(() => {
    cargarPreguntas();
  }, [id]);

  const cargarPreguntas = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/preguntas?examen_id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setPreguntas(res.data);
    console.log('Preguntas:', res.data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editId) {
        await api.put(`/preguntas/${editId}`, editPregunta, { headers: { Authorization: `Bearer ${token}` } });
        setMsg("Pregunta actualizada");
      } else {
        await api.post(`/preguntas`, { ...editPregunta, examen_id: id }, { headers: { Authorization: `Bearer ${token}` } });
        setMsg("Pregunta creada");
      }
      setShowModal(false);
      setEditPregunta({ texto: "" });
      setEditId(null);
      cargarPreguntas();
    } catch {
      setMsg("Error al guardar pregunta");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/preguntas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      cargarPreguntas();
    } catch {
      setMsg("Error al eliminar pregunta");
    }
  };

  // --- RESPUESTAS ---
  const cargarRespuestas = async (preguntaId: number) => {
    setPreguntaId(preguntaId);
    setShowRespModal(true);
    const token = localStorage.getItem("token");
    const res = await api.get(`/respuestas?pregunta_id=${preguntaId}`, { headers: { Authorization: `Bearer ${token}` } });
    setRespuestas(res.data);
  };

  const handleSaveResp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editRespId) {
        await api.put(`/respuestas/${editRespId}`, editResp, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post(`/respuestas`, { ...editResp, pregunta_id: preguntaId }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setEditResp({ texto: "", es_correcta: false });
      setEditRespId(null);
      cargarRespuestas(preguntaId!);
    } catch {
      alert("Error al guardar respuesta");
    }
  };

  const handleDeleteResp = async (id: number) => {
    if (!window.confirm("¿Eliminar esta respuesta?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/respuestas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      cargarRespuestas(preguntaId!);
    } catch {
      alert("Error al eliminar respuesta");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Preguntas del Examen</h1>
      <button className="mb-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => { setShowModal(true); setEditId(null); setEditPregunta({ texto: "" }); }}>Agregar Pregunta</button>
      <table className="min-w-full bg-white border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left text-xs font-medium text-[#111] uppercase">ID</th>
            <th className="px-4 py-2 border-b text-left text-xs font-medium text-[#111] uppercase">Texto</th>
            <th className="px-4 py-2 border-b text-left text-xs font-medium text-[#111] uppercase w-56">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {preguntas.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-[#111]">{p.id}</td>
              <td className="px-4 py-2 border-b text-[#111]">{p.texto}</td>
              <td className="px-4 py-2 border-b text-[#111]">
                <div className="flex flex-row gap-1">
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setEditId(p.id); setEditPregunta(p); setShowModal(true); }}>EDITAR-PRUEBA</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDelete(p.id)}>Eliminar</button>
                  <button className="bg-green-700 text-white px-2 py-1 rounded text-xs" style={{ border: '2px solid black' }} onClick={() => cargarRespuestas(p.id)}>Respuestas</button>
                </div>
              </td>
            </tr>
          ))}
          {preguntas.length === 0 && (
            <tr><td colSpan={3} className="text-gray-500 px-4 py-2">No hay preguntas.</td></tr>
          )}
        </tbody>
      </table>
      <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => router.back()}>Volver</button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
      {/* Modal Pregunta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editId ? "Editar" : "Agregar"} Pregunta</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block mb-1">Texto</label>
                <input type="text" value={editPregunta.texto} onChange={e => setEditPregunta({ ...editPregunta, texto: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editId ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Respuestas */}
      {showRespModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[32rem]">
            <h2 className="text-xl font-bold mb-4">Respuestas</h2>
            <button className="mb-2 bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800" onClick={() => { setEditRespId(null); setEditResp({ texto: "", es_correcta: false }); }}>Agregar Respuesta</button>
            <ul className="mb-4">
              {respuestas.map(r => (
                <li key={r.id} className="mb-2 flex items-center gap-2">
                  <span>{r.texto} {r.es_correcta && <span className="text-green-700 font-bold">(Correcta)</span>}</span>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setEditRespId(r.id); setEditResp(r); }}>Editar</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDeleteResp(r.id)}>Eliminar</button>
                </li>
              ))}
              {respuestas.length === 0 && <li className="text-gray-500">No hay respuestas.</li>}
            </ul>
            {/* Formulario respuesta */}
            <form onSubmit={handleSaveResp} className="mb-4">
              <div className="mb-2">
                <label className="block mb-1">Texto</label>
                <input type="text" value={editResp.texto} onChange={e => setEditResp({ ...editResp, texto: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <input type="checkbox" checked={!!editResp.es_correcta} onChange={e => setEditResp({ ...editResp, es_correcta: e.target.checked })} id="es_correcta" />
                <label htmlFor="es_correcta">¿Es la respuesta correcta?</label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setEditRespId(null); setEditResp({ texto: "", es_correcta: false }); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editRespId ? "Guardar" : "Crear"}</button>
              </div>
            </form>
            <button className="mt-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowRespModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
      <h2 className="text-red-600 font-bold">PRUEBA BOTÓN RESPUESTAS</h2>
    </div>
  );
} 