'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function InscripcionesAdminPage() {
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  useEffect(() => {
    api.get('/inscripciones/admin/listar')
      .then(res => setInscripciones(res.data))
      .catch(() => setMsg('Error al cargar inscripciones'))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar inscripción?')) return;
    try {
      await api.delete(`/inscripciones/${id}`);
      setInscripciones(inscripciones.filter(i => i.id !== id));
    } catch {
      setMsg('No se pudo eliminar la inscripción');
    }
  };

  const handleRevertir = async (id: number) => {
    if (!window.confirm('¿Revertir estado de inscripción?')) return;
    try {
      const res = await api.patch(`/inscripciones/admin/revertir/${id}`);
      setInscripciones(inscripciones.map(i => i.id === id ? { ...i, estado: res.data.estado } : i));
    } catch {
      setMsg('No se pudo revertir el estado');
    }
  };

  const inscripcionesFiltradas = inscripciones.filter(i => {
    const nombreCompleto = `${i.usuario?.nombre || ''} ${i.usuario?.apellido || ''}`.toLowerCase();
    return nombreCompleto.includes(filtroUsuario.toLowerCase());
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Todas las Inscripciones</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <label className="font-semibold text-black">Filtrar por usuario:</label>
        <input
          type="text"
          value={filtroUsuario}
          onChange={e => setFiltroUsuario(e.target.value)}
          placeholder="Nombre o apellido"
          className="border px-2 py-1 rounded"
        />
      </div>
      {msg && <div className="mb-4 text-red-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Curso</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripcionesFiltradas.map((i, idx) => (
              <tr key={i.id} className={`text-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                <td>{i.id}</td>
                <td>{i.usuario?.nombre} {i.usuario?.apellido}</td>
                <td>{i.curso?.nombre}</td>
                <td>{i.estado}</td>
                <td>{new Date(i.fecha).toLocaleString()}</td>
                <td className="py-2 px-4">
                  <div className="flex flex-row gap-2 justify-center items-center">
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-800"
                      onClick={() => handleEliminar(i.id)}
                    >
                      Eliminar registro
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                      onClick={() => handleRevertir(i.id)}
                    >
                      Revertir registro
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 