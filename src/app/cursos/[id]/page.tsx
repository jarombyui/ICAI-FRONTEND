'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url?: string;
};

export default function CursoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get(`/cursos/${id}`)
      .then(res => setCurso(res.data))
      .catch(() => setCurso(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setUser(JSON.parse(atob(token.split('.')[1])));
        } catch {}
      }
    }
  }, []);

  const handleInscribirse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Debes iniciar sesión para inscribirte.');
      router.push('/auth');
      return;
    }
    try {
      await api.post('/inscripciones', { curso_id: curso?.id });
      setMsg('¡Inscripción exitosa! Revisa "Mis cursos".');
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error al inscribirse');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!curso) return <div className="p-8">Curso no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {curso.imagen_url && (
        <img src={curso.imagen_url} alt={curso.nombre} className="w-full h-56 object-cover rounded mb-4" />
      )}
      <h1 className="text-3xl font-bold mb-2">{curso.nombre}</h1>
      <p className="mb-4">{curso.descripcion}</p>
      <div className="mb-4 flex gap-4">
        <span className="font-bold text-blue-600">S/. {curso.precio}</span>
        <span className="text-sm text-gray-500">{curso.horas} horas</span>
      </div>
      {user?.rol === 'admin' && (
        <div className="mb-4 flex gap-2">
          <button onClick={async () => {
            if (!window.confirm('¿Eliminar este curso?')) return;
            try {
              await api.delete(`/cursos/${curso.id}`);
              router.push('/cursos');
            } catch {
              alert('Error al eliminar curso');
            }
          }} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800">Eliminar</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?edit=1`)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?tab=materiales`)} className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800">Materiales</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?tab=examenes`)} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">Exámenes</button>
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleInscribirse}
      >
        Inscribirse
      </button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
    </div>
  );
} 