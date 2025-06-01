'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url?: string;
};

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/cursos')
      .then(res => setCursos(res.data))
      .catch(() => setCursos([]))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Explorar Cursos</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursos.map(curso => (
            <div key={curso.id} className="border rounded p-4 bg-white shadow hover:shadow-lg cursor-pointer transition relative">
              <Link href={`/cursos/${curso.id}`}>
                {curso.imagen_url && (
                  <img src={curso.imagen_url} alt={curso.nombre} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <h2 className="text-xl font-semibold">{curso.nombre}</h2>
                <p className="text-gray-600">{curso.descripcion}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">S/. {curso.precio}</span>
                  <span className="text-sm text-gray-500">{curso.horas} horas</span>
                </div>
              </Link>
              {user?.rol === 'admin' && (
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button onClick={async () => {
                    if (!window.confirm('¿Eliminar este curso?')) return;
                    try {
                      await api.delete(`/cursos/${curso.id}`);
                      setCursos(cursos.filter(c => c.id !== curso.id));
                    } catch {
                      alert('Error al eliminar curso');
                    }
                  }} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-800">Eliminar</button>
                  <Link href={`/cursos/${curso.id}?edit=1`} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 text-center">Editar</Link>
                  <Link href={`/cursos/${curso.id}?tab=materiales`} className="bg-blue-700 text-white px-2 py-1 rounded text-xs hover:bg-blue-800 text-center">Materiales</Link>
                  <Link href={`/cursos/${curso.id}?tab=examenes`} className="bg-green-700 text-white px-2 py-1 rounded text-xs hover:bg-green-800 text-center">Exámenes</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 