'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';

type Material = {
  id: number;
  tipo: string;
  url: string;
  descripcion?: string;
};

type Subtema = {
  id: number;
  nombre: string;
  materiales: Material[];
};

type Modulo = {
  id: number;
  nombre: string;
  subtemas: Subtema[];
};

type Curso = {
  id: number;
  nombre: string;
  modulos: Modulo[];
};

export default function MaterialesCursoPage() {
  const { curso_id } = useParams<{ curso_id: string }>();
  const router = useRouter();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Verifica si el usuario tiene acceso (estado comprado)
    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Debes iniciar sesión.');
      router.push('/auth');
      return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    api.get(`/inscripciones/usuario/${payload.id}`)
      .then(res => {
        const insc = res.data.find((i: any) => i.curso.id === Number(curso_id));
        if (!insc || insc.estado !== 'comprado') {
          setMsg('No tienes acceso a este curso.');
          setLoading(false);
          return;
        }
        // Obtener materiales del curso
        api.get(`/cursos/${curso_id}`) // Suponiendo que el backend retorna módulos, subtemas y materiales
          .then(res2 => setCurso(res2.data))
          .catch(() => setCurso(null))
          .finally(() => setLoading(false));
      });
  }, [curso_id, router]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (msg) return <div className="p-8 text-red-600">{msg}</div>;
  if (!curso) return <div className="p-8">Curso no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{curso.nombre} - Materiales</h1>
      {curso.modulos.map(modulo => (
        <div key={modulo.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{modulo.nombre}</h2>
          {modulo.subtemas.map(subtema => (
            <div key={subtema.id} className="ml-4 mb-2">
              <h3 className="font-semibold">{subtema.nombre}</h3>
              <ul className="ml-4">
                {subtema.materiales.map(material => (
                  <li key={material.id} className="mb-1">
                    {material.tipo === 'video' ? (
                      <iframe
                        width="320"
                        height="180"
                        src={material.url}
                        title="Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="mb-2"
                      ></iframe>
                    ) : (
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {material.tipo.toUpperCase()} - {material.descripcion || 'Ver material'}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 