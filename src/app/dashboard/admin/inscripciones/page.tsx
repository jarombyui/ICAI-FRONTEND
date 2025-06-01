'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function InscripcionesAdminPage() {
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/inscripciones/admin/listar')
      .then(res => setInscripciones(res.data))
      .catch(() => setMsg('Error al cargar inscripciones'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Todas las Inscripciones</h1>
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
            </tr>
          </thead>
          <tbody>
            {inscripciones.map(i => (
              <tr key={i.id} className="text-center">
                <td>{i.id}</td>
                <td>{i.usuario?.nombre} {i.usuario?.apellido}</td>
                <td>{i.curso?.nombre}</td>
                <td>{i.estado}</td>
                <td>{new Date(i.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 