'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

type Inscripcion = {
  id: number;
  estado: string;
  curso: {
    id: number;
    nombre: string;
    precio: number;
    horas: number;
  };
};

export default function PagoPage() {
  const { inscripcion_id } = useParams<{ inscripcion_id: string }>();
  const router = useRouter();
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/inscripciones/mis')
      .then(res => {
        const found = res.data.find((i: Inscripcion) => i.id === Number(inscripcion_id));
        setInscripcion(found || null);
      })
      .catch(() => setInscripcion(null))
      .finally(() => setLoading(false));
  }, [inscripcion_id]);

  function getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  }

  const handlePagar = async (metodo: string) => {
    if (!inscripcion) return;
    try {
      await api.post('/pagos', {
        inscripcion_id: inscripcion.id,
        metodo,
        monto: inscripcion.curso.precio,
      });
      setMsg('¡Pago realizado con éxito!');
      api.get('/inscripciones/mis')
        .then(res => {
          const found = res.data.find((i: Inscripcion) => i.id === Number(inscripcion_id));
          setInscripcion(found || null);
        });
      setTimeout(() => router.push(`/mis-cursos/${inscripcion.curso.id}`), 3000);
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error al realizar el pago');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!inscripcion) return <div className="p-8">Inscripción no encontrada</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Pago de Curso</h1>
      <div className="mb-4">
        <strong>Curso:</strong> {inscripcion.curso.nombre}<br />
        <strong>Precio:</strong> S/. {inscripcion.curso.precio}<br />
        <strong>Horas:</strong> {inscripcion.curso.horas}
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          onClick={() => handlePagar('visa')}
        >
          Pagar con Visa
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          onClick={() => handlePagar('yape')}
        >
          Pagar con Yape
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => handlePagar('transferencia')}
        >
          Transferencia Bancaria
        </button>
      </div>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
    </div>
  );
} 