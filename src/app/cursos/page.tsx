'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url?: string;
  categoria?: {
    id: number;
    nombre: string;
  };
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
  const [search, setSearch] = useState('');
  // Filtros visuales (puedes conectar a backend si lo deseas)
  const [filtros, setFiltros] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    api.get('/cursos')
      .then(res => setCursos(res.data))
      .catch(() => setMsg('Error al cargar cursos'))
      .finally(() => setLoading(false));
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setUser(JSON.parse(atob(token.split('.')[1])));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
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

  // Filtrado por búsqueda
  const cursosFiltrados = cursos.filter(curso => {
    const texto = `${curso.nombre} ${curso.descripcion} ${curso.categoria?.nombre || ''}`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtros laterales (solo visual) */}
          <aside className="w-full md:w-64 mb-6 md:mb-0">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-bold mb-2">Filtrar por</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-700" disabled /> Modalidad: auto-instructivo
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-700" disabled /> Tipo: curso de capacitación
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-700" disabled /> Área: administración
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-700" disabled /> Área: derecho
                </label>
                {/* Agrega más filtros visuales si lo deseas */}
              </div>
            </div>
          </aside>
          {/* Contenido principal */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold">Explorar Cursos</h1>
              <div className="relative w-full sm:w-96">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Encuentra cursos, certificaciones y más"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {user?.rol === 'admin' && (
                <button onClick={() => setShowModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Crear Curso</button>
              )}
            </div>
            {msg && <div className="mb-4 text-red-600">{msg}</div>}
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursosFiltrados.map((curso, idx) => {
                  // Asignar una imagen de las 8 disponibles
                  const imagenes = [
                    '/imagenes/curso_1.jpg',
                    '/imagenes/curso_2.jpg',
                    '/imagenes/curso_3.jpg',
                    '/imagenes/curso_4.jpg',
                    '/imagenes/curso_5.jpg',
                    '/imagenes/curso_6.jpg',
                    '/imagenes/curso_7.jpg',
                    '/imagenes/curso_8.jpg',
                  ];
                  let imgSrc = imagenes[(curso.id - 1) % imagenes.length];
                  if (curso.imagen_url && curso.imagen_url.trim() !== '') {
                    if (
                      curso.imagen_url.startsWith('/imagenes/') ||
                      curso.imagen_url.startsWith('http')
                    ) {
                      imgSrc = curso.imagen_url;
                    }
                  }
                  return (
                    <div key={curso.id} className="border rounded-lg bg-white shadow hover:shadow-lg cursor-pointer transition relative flex flex-col">
                      <Link href={`/cursos/${curso.id}`} className="flex-1 flex flex-col">
                        <img
                          src={imgSrc}
                          alt={curso.nombre}
                          className="w-full h-40 object-cover rounded-t mb-2"
                          onError={e => {
                            if (!e.currentTarget.src.endsWith('/imagenes/curso_1.jpg')) {
                              e.currentTarget.src = '/imagenes/curso_1.jpg';
                            }
                          }}
                        />
                        <div className="flex-1 flex flex-col p-3">
                          <h2 className="text-lg font-semibold mb-1 line-clamp-2">{curso.nombre}</h2>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-3">{curso.descripcion}</p>
                          <div className="mt-auto flex flex-col gap-1">
                            <span className="font-bold text-blue-600">S/. {curso.precio}</span>
                            <span className="text-xs text-gray-500">{curso.horas} horas</span>
                            {curso.categoria?.nombre && <span className="text-xs text-gray-400">{curso.categoria.nombre}</span>}
                          </div>
                        </div>
                      </Link>
                      {user?.rol === 'admin' && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
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
                  );
                })}
                {cursosFiltrados.length === 0 && (
                  <div className="col-span-full text-gray-500 text-center py-12">No se encontraron cursos.</div>
                )}
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
          </main>
        </div>
      </div>
    </div>
  );
} 