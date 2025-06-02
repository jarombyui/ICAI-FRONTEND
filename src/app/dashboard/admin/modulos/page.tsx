'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

type Curso = {
  id: number;
  nombre: string;
};

type Modulo = {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  curso_id: number;
};

type Subtema = {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  modulo_id: number;
};

type FormData = {
  nombre: string;
  descripcion: string;
  orden: number;
  curso_id: number | '';
};

export default function ModulosAdmin() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [moduloActual, setModuloActual] = useState<Modulo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    orden: 1,
    curso_id: ''
  });

  const [showSubtemas, setShowSubtemas] = useState<Modulo | null>(null);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [subtemaForm, setSubtemaForm] = useState<{nombre: string, descripcion: string, orden: number}>({nombre: '', descripcion: '', orden: 1});
  const [subtemaEditId, setSubtemaEditId] = useState<number | null>(null);
  const [subtemaMsg, setSubtemaMsg] = useState('');

  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [modulosRes, cursosRes] = await Promise.all([
        api.get('/modulos'),
        api.get('/cursos')
      ]);
      setModulos(modulosRes.data);
      setCursos(cursosRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (moduloActual) {
        await api.put(`/modulos/${moduloActual.id}`, formData);
      } else {
        await api.post('/modulos', formData);
      }
      setShowModal(false);
      cargarDatos();
      resetForm();
    } catch (err) {
      setError('Error al guardar el módulo');
    }
  };

  const handleEdit = (modulo: Modulo) => {
    setModuloActual(modulo);
    setFormData({
      nombre: modulo.nombre,
      descripcion: modulo.descripcion || '',
      orden: modulo.orden,
      curso_id: modulo.curso_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este módulo?')) {
      try {
        await api.delete(`/modulos/${id}`);
        cargarDatos();
      } catch (err) {
        setError('Error al eliminar el módulo');
      }
    }
  };

  const resetForm = () => {
    setModuloActual(null);
    setFormData({
      nombre: '',
      descripcion: '',
      orden: 1,
      curso_id: ''
    });
  };

  const cargarSubtemas = async (moduloId: number) => {
    const res = await api.get(`/subtema/modulo/${moduloId}`);
    setSubtemas(res.data);
  };

  const handleOpenSubtemas = async (modulo: Modulo) => {
    setShowSubtemas(modulo);
    setSubtemaEditId(null);
    setSubtemaForm({nombre: '', descripcion: '', orden: 1});
    setSubtemaMsg('');
    await cargarSubtemas(modulo.id);
  };

  const handleSubtemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (subtemaEditId) {
        await api.put(`/subtema/${subtemaEditId}`, {...subtemaForm, modulo_id: showSubtemas?.id});
        setSubtemaMsg('Subtema actualizado');
      } else {
        await api.post('/subtema', {...subtemaForm, modulo_id: showSubtemas?.id});
        setSubtemaMsg('Subtema creado');
      }
      setSubtemaForm({nombre: '', descripcion: '', orden: 1});
      setSubtemaEditId(null);
      await cargarSubtemas(showSubtemas!.id);
    } catch {
      setSubtemaMsg('Error al guardar subtema');
    }
  };

  const handleSubtemaEdit = (subtema: Subtema) => {
    setSubtemaEditId(subtema.id);
    setSubtemaForm({nombre: subtema.nombre, descripcion: subtema.descripcion || '', orden: subtema.orden});
  };

  const handleSubtemaDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este subtema?')) return;
    try {
      await api.delete(`/subtema/${id}`);
      await cargarSubtemas(showSubtemas!.id);
    } catch {
      setSubtemaMsg('Error al eliminar subtema');
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Módulos</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Módulo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-[#111] uppercase bg-gray-100">ID</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-[#111] uppercase bg-gray-100">Nombre</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-[#111] uppercase bg-gray-100">Curso</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-[#111] uppercase bg-gray-100">Orden</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-[#111] uppercase bg-gray-100">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((modulo) => (
              <tr key={modulo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b text-[#111]">{modulo.id}</td>
                <td className="px-6 py-4 border-b text-[#111]">{modulo.nombre}</td>
                <td className="px-6 py-4 border-b text-[#111]">
                  {cursos.find(c => c.id === modulo.curso_id)?.nombre || 'N/A'}
                </td>
                <td className="px-6 py-4 border-b text-[#111]">{modulo.orden}</td>
                <td className="px-6 py-4 border-b text-[#111]">
                  <button
                    onClick={() => handleEdit(modulo)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(modulo.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/admin/examenes?modulo_id=${modulo.id}`)}
                    className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 ml-2"
                  >
                    Ver Exámenes
                  </button>
                  <button
                    onClick={() => handleOpenSubtemas(modulo)}
                    className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 ml-2"
                  >
                    Subtemas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {moduloActual ? 'Editar Módulo' : 'Crear Módulo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Curso</label>
                <select
                  value={formData.curso_id}
                  onChange={(e) => setFormData({ ...formData, curso_id: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione un curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Orden</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                  min={1}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {moduloActual ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubtemas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[420px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Subtemas de {showSubtemas.nombre}</h2>
            <form onSubmit={handleSubtemaSubmit} className="mb-4 space-y-2">
              <input type="text" placeholder="Nombre" value={subtemaForm.nombre} onChange={e => setSubtemaForm({...subtemaForm, nombre: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="text" placeholder="Descripción" value={subtemaForm.descripcion} onChange={e => setSubtemaForm({...subtemaForm, descripcion: e.target.value})} className="w-full border p-2 rounded" />
              <input type="number" placeholder="Orden" value={subtemaForm.orden} onChange={e => setSubtemaForm({...subtemaForm, orden: Number(e.target.value)})} className="w-full border p-2 rounded" min={1} required />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowSubtemas(null); setSubtemaEditId(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cerrar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{subtemaEditId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
            {subtemaMsg && <div className="mb-2 text-green-700">{subtemaMsg}</div>}
            <ul>
              {subtemas.map(s => (
                <li key={s.id} className="mb-2 flex items-center gap-2 border-b pb-1">
                  <span className="font-semibold">{s.nombre}</span> <span className="text-gray-500">({s.descripcion})</span> <span className="text-xs text-gray-400">Orden: {s.orden}</span>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => handleSubtemaEdit(s)}>Editar</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleSubtemaDelete(s.id)}>Eliminar</button>
                </li>
              ))}
              {subtemas.length === 0 && <li className="text-gray-500">No hay subtemas.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 