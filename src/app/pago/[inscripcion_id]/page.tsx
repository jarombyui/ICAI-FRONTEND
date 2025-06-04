'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Image from 'next/image';

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
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  const handleEnviarComprobante = async () => {
    if (!comprobante || !inscripcion) return;
    setEnviando(true);
    setMsg('');
    try {
      // Buscar el pago pendiente o crear uno si no existe
      const pagosRes = await api.get(`/pagos/inscripcion/${inscripcion.id}`);
      let pago = pagosRes.data.find((p: any) => p.metodo !== 'visa' && p.estado === 'pendiente');
      if (!pago) {
        // Crear pago pendiente
        const nuevoPago = await api.post('/pagos', {
          inscripcion_id: inscripcion.id,
          metodo: 'manual',
          monto: inscripcion.curso.precio,
        });
        pago = nuevoPago.data;
      }
      // Subir comprobante
      const formData = new FormData();
      formData.append('file', comprobante);
      formData.append('pago_id', pago.id);
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/pagos/comprobante`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      setMsg('Constancia enviada para validación.');
    } catch (err) {
      setMsg('Error al enviar constancia');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!inscripcion) return <div className="p-8">Inscripción no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-8">
        <button onClick={() => router.back()} className="mb-4 text-blue-700 hover:underline flex items-center gap-2">← Completar compra</button>
        <h1 className="text-xl font-bold mb-6">Completar compra</h1>
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Resumen</h2>
          <table className="w-full mb-4 border">
            <tbody>
              <tr><td className="font-semibold">Programa</td><td>{inscripcion.curso.nombre}</td></tr>
              <tr><td className="font-semibold">Fecha inicio</td><td>{new Date().toLocaleDateString()}</td></tr>
              <tr><td className="font-semibold">Item</td><td>Curso premium x 1</td></tr>
              <tr><td className="font-semibold">TOTAL</td><td>S/. {inscripcion.curso.precio}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Tramitar pago</h2>
          <div className="border rounded mb-4">
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label className="font-semibold">Pago manual: Envío de constancia de depósito</label>
                <div className="mt-2 text-sm text-gray-600">Puedes pagar con Yape, Plin, transferencia bancaria, etc. Sube la imagen del comprobante.</div>
                <div className="flex gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <Image src="/imagenes/qr/qr-yape.png" alt="QR Yape" width={100} height={100} className="rounded" />
                    <span className="text-xs mt-1">Yape</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/imagenes/qr/qr-plin.png" alt="QR Plin" width={100} height={100} className="rounded" />
                    <span className="text-xs mt-1">Plin</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <label className="border-dashed border-2 border-gray-400 rounded p-4 cursor-pointer w-40 h-40 flex flex-col items-center justify-center text-gray-500 hover:border-blue-600">
                  +Cargar imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setComprobante(e.target.files?.[0] || null)}
                  />
                </label>
                {comprobante && <span className="text-xs text-green-700">{comprobante.name}</span>}
                <button
                  className="bg-gray-700 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
                  disabled={!comprobante || enviando}
                  onClick={handleEnviarComprobante}
                >
                  ENVIAR CONSTANCIA
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Al hacer clic en "ENVIAR CONSTANCIA" aceptas nuestros Términos y condiciones
          </div>
        </div>
        {msg && <div className="mt-4 text-green-700 font-semibold">{msg}</div>}
      </div>
    </div>
  );
} 