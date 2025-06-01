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

type Inscripcion = {
  id: number;
  estado: string;
  curso: Curso;
};

export default function MisCursosPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/inscripciones/mis')
      .then(res => setInscripciones(res.data))
      .catch(() => setInscripciones([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Mis Cursos</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inscripciones.map(insc => (
            <div key={insc.id} className="border rounded p-4 bg-white shadow">
              {insc.estado === 'comprado' ? (
                <Link href={`/mis-cursos/${insc.curso.id}`}>
                  <h2 className="text-xl font-semibold cursor-pointer hover:underline">{insc.curso.nombre}</h2>
                </Link>
              ) : (
                <h2 className="text-xl font-semibold">{insc.curso.nombre}</h2>
              )}
              <p className="text-gray-600">{insc.curso.descripcion}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-bold text-blue-600">S/. {insc.curso.precio}</span>
                <span className="text-sm text-gray-500">{insc.curso.horas} horas</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${insc.estado === 'comprado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{insc.estado}</span>
                {insc.estado === 'pendiente' && (
                  <Link href={`/pago/${insc.id}`}>
                    <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                      Pagar
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 