'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function PagosUserPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/inscripciones/mis')
      .then(res => {
        const allPagos: any[] = [];
        const promises = res.data.map((insc: any) =>
          api.get(`/pagos/inscripcion/${insc.id}`).then(r => allPagos.push(...r.data))
        );
        Promise.all(promises).then(() => {
          setPagos(allPagos);
          setLoading(false);
        });
      })
      .catch(() => {
        setMsg('Error al cargar pagos');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mis Pagos</h1>
      {msg && <div className="mb-4 text-red-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
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