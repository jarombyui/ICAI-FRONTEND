'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function PagosAdminPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/pagos/admin/listar')
      .then(res => setPagos(res.data))
      .catch(() => setMsg('Error al cargar pagos (verifica conexión y permisos)'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pagos de Cursos</h1>
      {msg && <div className="mb-4 text-red-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Curso</th>
              <th>Inscripción</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map(p => (
              <tr key={p.id} className="text-center">
                <td>{p.id}</td>
                <td>{p.inscripcion?.usuario?.nombre} {p.inscripcion?.usuario?.apellido}</td>
                <td>{p.inscripcion?.curso?.nombre}</td>
                <td>{p.inscripcion_id}</td>
                <td>{p.metodo}</td>
                <td>S/. {p.monto}</td>
                <td>{new Date(p.fecha).toLocaleString()}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 