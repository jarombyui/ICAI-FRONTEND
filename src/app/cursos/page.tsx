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

  useEffect(() => {
    api.get('/cursos')
      .then(res => setCursos(res.data))
      .catch(() => setCursos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Explorar Cursos</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursos.map(curso => (
            <Link key={curso.id} href={`/cursos/${curso.id}`}>
              <div className="border rounded p-4 bg-white shadow hover:shadow-lg cursor-pointer transition">
                {curso.imagen_url && (
                  <img src={curso.imagen_url} alt={curso.nombre} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <h2 className="text-xl font-semibold">{curso.nombre}</h2>
                <p className="text-gray-600">{curso.descripcion}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">S/. {curso.precio}</span>
                  <span className="text-sm text-gray-500">{curso.horas} horas</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 