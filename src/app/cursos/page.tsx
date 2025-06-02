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

type Categoria = {
  id: number;
  nombre: string;
};

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    horas: 0,
    categoria_id: '',
    imagen_url: ''
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [msg, setMsg] = useState('');

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
    // Obtener categorías si hay endpoint
    api.get('/categorias').then(res => setCategorias(res.data)).catch(() => setCategorias([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post('/cursos', formData);
      setShowModal(false);
      setMsg('Curso creado');
      setFormData({ nombre: '', descripcion: '', precio: 0, horas: 0, categoria_id: '', imagen_url: '' });
      // Refrescar cursos
      const res = await api.get('/cursos');
      setCursos(res.data);
    } catch {
      setMsg('Error al crear curso');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Explorar Cursos</h1>
      {user?.rol === 'admin' && (
        <button onClick={() => setShowModal(true)} className="mb-6 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Crear Curso</button>
      )}
      {msg && <div className="mb-4 text-green-600">{msg}</div>}
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
      {/* Modal de crear curso */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Crear Curso</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Descripción</label>
                <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" rows={3} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Precio</label>
                <input type="number" value={formData.precio} onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })} className="w-full p-2 border rounded" required min={0} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Horas</label>
                <input type="number" value={formData.horas} onChange={e => setFormData({ ...formData, horas: Number(e.target.value) })} className="w-full p-2 border rounded" required min={1} />
              </div>
              {categorias.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Categoría</label>
                  <select value={formData.categoria_id} onChange={e => setFormData({ ...formData, categoria_id: e.target.value })} className="w-full p-2 border rounded" required>
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Imagen (URL)</label>
                <input type="text" value={formData.imagen_url} onChange={e => setFormData({ ...formData, imagen_url: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 