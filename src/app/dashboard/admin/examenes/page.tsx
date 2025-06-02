'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

type Examen = {
  id: number;
  nombre: string;
  porcentaje_aprob: number;
  modulo_id: number;
  modulo?: string;
  curso?: string;
};

type Modulo = {
  id: number;
  nombre: string;
  curso_id: number;
  curso?: string;
};

type FormData = {
  nombre: string;
  porcentaje_aprob: number;
  modulo_id: number | '';
};

export default function ExamenesAdminPage() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [examenActual, setExamenActual] = useState<Examen | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    porcentaje_aprob: 60,
    modulo_id: ''
  });
  const [showPreguntas, setShowPreguntas] = useState<null | number>(null);
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [modulosRes, cursosRes] = await Promise.all([
        api.get('/modulos'),
        api.get('/cursos')
      ]);
      const modulos: Modulo[] = modulosRes.data.map((m: any) => ({
        ...m,
        curso: cursosRes.data.find((c: any) => c.id === m.curso_id)?.nombre || ''
      }));
      setModulos(modulos);
      // Obtener exámenes de todos los módulos
      const examenes: Examen[] = [];
      for (const modulo of modulos) {
        const res = await api.get(`/examenes/modulos/${modulo.id}/examenes`);
        res.data.forEach((ex: any) => {
          examenes.push({ ...ex, modulo: modulo.nombre, curso: modulo.curso });
        });
      }
      setExamenes(examenes);
      setMsg('');
    } catch {
      setMsg('Error al cargar exámenes');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (examenActual) {
        await api.put(`/examenes/examenes/${examenActual.id}`, formData);
        setMsg('Examen actualizado');
      } else {
        await api.post('/examenes', formData);
        setMsg('Examen creado');
      }
      setShowModal(false);
      cargarDatos();
      resetForm();
    } catch {
      setMsg('Error al guardar el examen');
    }
  };

  const handleEdit = (examen: Examen) => {
    setExamenActual(examen);
    setFormData({
      nombre: examen.nombre,
      porcentaje_aprob: examen.porcentaje_aprob,
      modulo_id: examen.modulo_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este examen?')) return;
    setLoading(true);
    setMsg('');
    try {
      await api.delete(`/examenes/examenes/${id}`);
      setExamenes(examenes.filter(e => e.id !== id));
      setMsg('Examen eliminado');
    } catch {
      setMsg('Error al eliminar examen');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setExamenActual(null);
    setFormData({ nombre: '', porcentaje_aprob: 60, modulo_id: '' });
  };

  // Gestión de preguntas
  const handlePreguntas = (examen: Examen) => {
    setShowPreguntas(examen.id);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Exámenes</h1>
      <button onClick={() => { resetForm(); setShowModal(true); }} className="mb-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Crear Examen</button>
      {msg && <div className="mb-4 text-red-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Módulo</th>
              <th>Curso</th>
              <th>% Aprob.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {examenes.map(e => (
              <tr key={e.id} className="text-center">
                <td>{e.id}</td>
                <td>{e.nombre}</td>
                <td>{e.modulo}</td>
                <td>{e.curso}</td>
                <td>{e.porcentaje_aprob}%</td>
                <td>
                  <button onClick={() => handleDelete(e.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800 mr-2">Eliminar</button>
                  <button onClick={() => handleEdit(e)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Editar</button>
                  <button onClick={() => handlePreguntas(e)} className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800">Preguntas</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal de crear/editar examen */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{examenActual ? 'Editar Examen' : 'Crear Examen'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Módulo</label>
                <select
                  value={formData.modulo_id}
                  onChange={e => setFormData({ ...formData, modulo_id: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione un módulo</option>
                  {modulos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} ({m.curso})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">% Aprobación</label>
                <input
                  type="number"
                  value={formData.porcentaje_aprob}
                  onChange={e => setFormData({ ...formData, porcentaje_aprob: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                  min={1}
                  max={100}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{examenActual ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Gestión de preguntas */}
      {showPreguntas && (
        <PreguntasModal examenId={showPreguntas} onClose={() => setShowPreguntas(null)} />
      )}
    </div>
  );
}

// Componente para gestionar preguntas de un examen
function PreguntasModal({ examenId, onClose }: { examenId: number, onClose: () => void }) {
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState<any>(null);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/preguntas?examen_id=${examenId}`);
      setPreguntas(res.data);
      setMsg('');
    } catch {
      setMsg('Error al cargar preguntas');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (preguntaActual) {
        await api.put(`/preguntas/${preguntaActual.id}`, { texto });
        setMsg('Pregunta actualizada');
      } else {
        await api.post('/preguntas', { examen_id: examenId, texto });
        setMsg('Pregunta creada');
      }
      setShowModal(false);
      setTexto('');
      setPreguntaActual(null);
      cargarPreguntas();
    } catch {
      setMsg('Error al guardar la pregunta');
    }
  };

  const handleEdit = (pregunta: any) => {
    setPreguntaActual(pregunta);
    setTexto(pregunta.texto);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
    setLoading(true);
    setMsg('');
    try {
      await api.delete(`/preguntas/${id}`);
      setPreguntas(preguntas.filter(p => p.id !== id));
      setMsg('Pregunta eliminada');
    } catch {
      setMsg('Error al eliminar pregunta');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Preguntas del Examen</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">✕</button>
        <button onClick={() => { setShowModal(true); setPreguntaActual(null); setTexto(''); }} className="mb-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Crear Pregunta</button>
        {msg && <div className="mb-4 text-red-500">{msg}</div>}
        {loading ? <div>Cargando...</div> : (
          <table className="w-full bg-white text-black rounded shadow">
            <thead>
              <tr>
                <th>ID</th>
                <th>Texto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map(p => (
                <tr key={p.id} className="text-center">
                  <td>{p.id}</td>
                  <td>{p.texto}</td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal de crear/editar pregunta */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">{preguntaActual ? 'Editar Pregunta' : 'Crear Pregunta'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Texto</label>
                  <textarea
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{preguntaActual ? 'Actualizar' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 