'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function CertificadosAdminPage() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/certificados/admin/listar')
      .then(res => setCertificados(res.data))
      .catch(() => setMsg('Error al cargar certificados'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Certificados Emitidos</h1>
      {msg && <div className="mb-4 text-red-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Curso</th>
              <th>Fecha</th>
              <th>Horas</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map(c => (
              <tr key={c.id} className="text-center">
                <td>{c.id}</td>
                <td>{c.usuario?.nombre} {c.usuario?.apellido}</td>
                <td>{c.curso?.nombre}</td>
                <td>{new Date(c.fecha_emision).toLocaleDateString()}</td>
                <td>{c.horas}</td>
1                <td><a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || 'http://localhost:4000'}${c.url_pdf}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 