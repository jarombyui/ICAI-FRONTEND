'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Image from 'next/image';

export default function PagosAdminPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    api.get('/pagos/admin/listar')
      .then(res => setPagos(res.data))
      .catch(() => setMsg('Error al cargar pagos (verifica conexión y permisos)'))
      .finally(() => setLoading(false));
  }, []);

  const handleAprobar = async (id: number) => {
    setMsg('');
    try {
      await api.put(`/pagos/${id}/estado`, { estado: 'aprobado' });
      setPagos(pagos => pagos.map(p => p.id === id ? { ...p, estado: 'aprobado' } : p));
      setMsg('Pago aprobado');
    } catch {
      setMsg('Error al aprobar pago');
    }
  };

  const handleRechazar = async (id: number) => {
    setMsg('');
    try {
      await api.put(`/pagos/${id}/estado`, { estado: 'rechazado' });
      setPagos(pagos => pagos.map(p => p.id === id ? { ...p, estado: 'rechazado' } : p));
      setMsg('Pago rechazado');
    } catch {
      setMsg('Error al rechazar pago');
    }
  };

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
              <th>Comprobante</th>
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
                <td>
                  {p.comprobante_url ? (
                    (() => {
                      let url = p.comprobante_url;
                      if (!url.startsWith('http')) {
                        if (url.startsWith('/uploads')) {
                          url = `${API_URL.replace(/\/api$/, '')}${url}`;
                        } else {
                          url = `${API_URL}${url}`;
                        }
                      }
                      if (url.endsWith('.pdf')) {
                        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver PDF</a>;
                      } else {
                        return (
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="Comprobante" className="w-16 h-16 object-contain border rounded mx-auto" />
                          </a>
                        );
                      }
                    })()
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${p.estado === 'aprobado' ? 'bg-green-200 text-green-800' : p.estado === 'rechazado' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{p.estado}</span>
                  {p.estado === 'pendiente' && (
                    <div className="flex flex-col gap-1 mt-2">
                      <button onClick={() => handleAprobar(p.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Aprobar</button>
                      <button onClick={() => handleRechazar(p.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 