'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import SecurityBanner from '../../components/SecurityBanner';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url: string;
};

type Inscripcion = {
  id: number;
  estado: string;
  curso: Curso;
  pagos?: Array<{
    id: number;
    estado: string;
    comprobante_url: string | null;
  }>;
};

export default function MisCursosPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [certificados, setCertificados] = useState<{ curso_id: number; url_pdf: string }[]>([]);
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Cargar inscripciones con sus pagos
    api.get('/inscripciones/mis')
      .then(async res => {
        const inscripcionesConPagos = await Promise.all(
          res.data.map(async (insc: Inscripcion) => {
            try {
              const pagosRes = await api.get(`/pagos/inscripcion/${insc.id}`);
              return { ...insc, pagos: pagosRes.data };
            } catch {
              return insc;
            }
          })
        );
        setInscripciones(inscripcionesConPagos);
      })
      .catch(() => setInscripciones([]))
      .finally(() => setLoading(false));

    // Obtener certificados del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      api.get(`/certificados/usuario/${payload.id}`)
        .then(res => setCertificados(res.data))
        .catch(() => setCertificados([]));
    } catch {}

    // Detectar si el usuario acaba de iniciar sesión por query param
    if (searchParams.get('justLoggedIn') === 'true') {
      setShowBanner(true);
      // Limpiar el query param para que no se repita al refrescar
      const params = new URLSearchParams(window.location.search);
      params.delete('justLoggedIn');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleDescargarCertificado = async (curso_id: number) => {
    setMsg('');
    try {
      // 1. Emitir certificado (por si no existe)
      const token = localStorage.getItem('token');
      if (!token) {
        setMsg('Debes iniciar sesión.');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      await api.post('/certificados/emitir', { usuario_id: payload.id, curso_id });
      // 2. Descargar certificado
      const res = await api.get(`/certificados/descargar/${curso_id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado_${curso_id}.pdf`;
      a.click();
      setMsg('Certificado generado y descargado correctamente.');
    } catch (err: any) {
      setMsg(err?.response?.data?.error || 'No se pudo generar o descargar el certificado');
    }
  };

  const handleEliminarInscripcion = async (inscripcion_id: number) => {
    if (!window.confirm('¿Eliminar inscripción?')) return;
    try {
      await api.delete(`/inscripciones/${inscripcion_id}`);
      setInscripciones(inscripciones.filter(i => i.id !== inscripcion_id));
    } catch {
      setMsg('No se pudo eliminar la inscripción');
    }
  };

  const tienePagoPendiente = (inscripcion: Inscripcion) => {
    return inscripcion.pagos?.some(p => p.estado === 'pendiente');
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-6 text-black">Mis Cursos</h1>
          {showBanner && <SecurityBanner show={true} />}
          {msg && <div className="mb-4 text-green-700 font-semibold">{msg}</div>}
          {loading ? (
            <div className="text-black">Cargando...</div>
          ) : (
            <div className="bg-white rounded shadow p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-black font-bold">Curso</th>
                    <th className="text-left py-2 px-4 text-black font-bold">Descripción</th>
                    <th className="text-left py-2 px-4 text-black font-bold">Estado</th>
                    <th className="text-left py-2 px-4 text-black font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map(insc => (
                    <tr key={insc.id} className="border-b">
                      <td className="py-2 px-4">
                        {insc.estado === 'comprado' ? (
                          <Link href={`/mis-cursos/${insc.curso.id}`} className="font-semibold hover:opacity-80" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>
                            {insc.curso.nombre}
                          </Link>
                        ) : (
                          <span className="text-black font-semibold">{insc.curso.nombre}</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-black">{insc.curso.descripcion}</td>
                      <td className="py-2 px-4">
                        {insc.estado === 'comprado' ? (
                          <span className="text-green-600 font-semibold">Comprado</span>
                        ) : tienePagoPendiente(insc) ? (
                          <span className="text-yellow-600 font-semibold">Pago pendiente de revisión</span>
                        ) : (
                          <span className="text-gray-600 font-semibold">Pendiente de pago</span>
                        )}
                      </td>
                      <td className="py-2 px-4 flex gap-2 items-center">
                        {insc.estado !== 'comprado' && !tienePagoPendiente(insc) && (
                          <Link
                            href={`/pago/${insc.id}`}
                            className="bg-[#023474] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#23386f]"
                          >
                            Pagar
                          </Link>
                        )}
                        {tienePagoPendiente(insc) && (
                          <span className="text-xs text-yellow-600 italic">Comprobante enviado, esperando revisión</span>
                        )}
                        {/* Descargar certificado si existe */}
                        {insc.estado === 'comprado' && certificados.some(c => c.curso_id === insc.curso.id) ? (
                          <button
                            className="bg-[#023474] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#23386f]"
                            onClick={() => handleDescargarCertificado(insc.curso.id)}
                          >
                            Descargar Certificado
                          </button>
                        ) : (
                          insc.estado === 'comprado' && (
                            <span className="text-xs text-gray-500 italic">Debes aprobar todos los exámenes para descargar el certificado</span>
                          )
                        )}
                        <button
                          className="bg-gray-200 text-[#023474] px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300 border border-gray-300"
                          onClick={() => handleEliminarInscripcion(insc.id)}
                        >
                          Eliminar inscripción
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 