'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Image from 'next/image';
import { useNotification } from '@/contexts/NotificationContext';

export default function PagosAdminPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [pagosNotificados, setPagosNotificados] = useState<Set<number>>(new Set());
  const { showNotification } = useNotification();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const verificarPagosPendientes = async (pagos: any[]) => {
    const pagosPendientes = pagos.filter((p: any) => 
      p.estado === 'pendiente' && !pagosNotificados.has(p.id)
    );
    
    if (pagosPendientes.length > 0) {
      // Agregar los nuevos pagos pendientes al conjunto de notificados
      const nuevosIds = new Set(pagosPendientes.map(p => p.id));
      setPagosNotificados(prev => new Set([...prev, ...nuevosIds]));
      // Notificación individual por cada pago pendiente, secuencial
      for (const p of pagosPendientes) {
        await showNotification(
          `Nuevo comprobante de pago pendiente de revisión para el curso "${p.inscripcion?.curso?.nombre ?? ''}" de ${p.inscripcion?.usuario?.nombre ?? ''} ${p.inscripcion?.usuario?.apellido ?? ''}`,
          'info',
          true,
          4000 // 4 segundos de duración
        );
        await delay(1500); // 1.5 segundos de espacio entre sonidos/notificaciones
      }
    }
  };

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        const res = await api.get('/pagos/admin/listar');
        setPagos(res.data);
        // Verificar pagos pendientes al cargar inicialmente
        await verificarPagosPendientes(res.data);
      } catch {
        setMsg('Error al cargar pagos');
      } finally {
        setLoading(false);
      }
    };

    cargarPagos();

    // Configurar polling para nuevos pagos
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/pagos/admin/listar');
        const nuevosPagos = res.data;
        
        // Verificar si hay nuevos pagos pendientes
        await verificarPagosPendientes(nuevosPagos);
        
        setPagos(nuevosPagos);
      } catch (error) {
        console.error('Error al verificar nuevos pagos:', error);
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [showNotification, pagosNotificados]);

  const handleAprobarPago = async (pagoId: number) => {
    try {
      await api.put(`/pagos/${pagoId}/estado`, { estado: 'aprobado' });
      setPagos(pagos.map(p => p.id === pagoId ? { ...p, estado: 'aprobado' } : p));
      showNotification('Pago aprobado exitosamente', 'success');
    } catch {
      setMsg('Error al aprobar el pago');
    }
  };

  const handleRechazarPago = async (pagoId: number) => {
    try {
      await api.put(`/pagos/${pagoId}/estado`, { estado: 'rechazado' });
      setPagos(pagos.map(p => p.id === pagoId ? { ...p, estado: 'rechazado' } : p));
      showNotification('Pago rechazado', 'error');
    } catch {
      setMsg('Error al rechazar el pago');
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
              <th>Acciones</th>
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
                  <span className={`px-2 py-1 rounded text-sm ${
                    p.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                    p.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  {p.estado === 'pendiente' && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleAprobarPago(p.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazarPago(p.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Rechazar
                      </button>
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