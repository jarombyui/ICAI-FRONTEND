'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import Footer from '../../components/Footer';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url?: string;
  examen_id?: number;
};

type Inscripcion = {
  id: number;
  estado: string;
  curso: Curso;
};

export default function MisCursosPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [certificados, setCertificados] = useState<{ curso_id: number; url_pdf: string }[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/inscripciones/mis')
      .then(res => setInscripciones(res.data))
      .catch(() => setInscripciones([]))
      .finally(() => setLoading(false));
    // Obtener certificados del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      api.get(`/certificados/usuario/${payload.id}`)
        .then(res => setCertificados(res.data))
        .catch(() => setCertificados([]));
    } catch {}
  }, []);

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

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-6 text-black">Mis Cursos</h1>
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
                    <tr key={insc.id} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-4 font-semibold text-black">
                        <Link href={`/mis-cursos/${insc.curso.id}`}
                          className="block transition rounded px-1 py-1 focus:outline-none"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <span className="block rounded px-1 py-1 cursor-pointer hover:bg-[#e6eef7] transition">
                            {insc.curso.nombre}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2 px-4 text-gray-700">{insc.curso.descripcion}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${insc.estado === 'comprado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{insc.estado}</span>
                      </td>
                      <td className="py-2 px-4 flex gap-2 items-center">
                        {insc.estado !== 'comprado' && (
                          <Link
                            href={`/pago/${insc.id}`}
                            className="bg-[#023474] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#23386f]"
                          >
                            Pagar
                          </Link>
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