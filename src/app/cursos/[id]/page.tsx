'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  horas: number;
  imagen_url?: string;
  modulos?: Modulo[];
};

// Tipos para materiales y exámenes
interface Modulo {
  id: number;
  nombre: string;
  subtemas?: Subtema[];
}
interface Subtema {
  id: number;
  nombre: string;
}
interface Material {
  id: number;
  tipo: string;
  url: string;
  descripcion?: string;
}
interface Examen {
  id: number;
  nombre: string;
  porcentaje_aprob: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const backendUrl = apiUrl.replace(/\/api$/, '');

export default function CursoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ nombre: '', descripcion: '', precio: 0, horas: 0, imagen_url: '' });
  const [saving, setSaving] = useState(false);
  const [inscrito, setInscrito] = useState(false);
  // Estado acordeón módulos (debe estar aquí, no dentro de un if)
  const [openModulos, setOpenModulos] = useState<number[]>([]);
  const toggleModulo = (id: number) => {
    setOpenModulos((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    api.get(`/cursos/${id}`)
      .then(res => setCurso(res.data))
      .catch(() => setCurso(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setUser(JSON.parse(atob(token.split('.')[1])));
        } catch {}
      }
    }
    // Verificar si el usuario ya está inscrito en el curso
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/inscripciones/mis').then(res => {
        if (res.data.some((i: any) => i.curso.id === Number(id) && i.estado === 'comprado')) {
          setInscrito(true);
        }
      });
    }
  }, [id]);

  // Detectar query params para mostrar edición, materiales o exámenes
  useEffect(() => {
    if (searchParams.get('edit') === '1' && curso) {
      setEditData({
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        precio: curso.precio,
        horas: curso.horas,
        imagen_url: curso.imagen_url || ''
      });
      setShowEdit(true);
    } else {
      setShowEdit(false);
    }
  }, [searchParams, curso]);

  const handleInscribirse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Debes iniciar sesión para inscribirte.');
      router.push('/auth');
      return;
    }
    try {
      await api.post('/inscripciones', { curso_id: curso?.id });
      setMsg('¡Inscripción exitosa! Revisa "Mis cursos".');
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error al inscribirse');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/cursos/${id}`, editData);
      setMsg('Curso actualizado');
      setShowEdit(false);
      // Refrescar datos
      const res = await api.get(`/cursos/${id}`);
      setCurso(res.data);
      router.replace(`/cursos/${id}`); // Quitar query param
    } catch {
      setMsg('Error al actualizar curso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!curso) return <div className="p-8">Curso no encontrado</div>;

  // Mostrar gestión de materiales
  if (searchParams.get('tab') === 'materiales') {
    return <GestionMateriales cursoId={curso.id} router={router} />;
  }
  // Mostrar gestión de exámenes
  if (searchParams.get('tab') === 'examenes') {
    return <GestionExamenes cursoId={curso.id} router={router} />;
  }

  // Lógica para la imagen (coloca esto antes del return principal, después de obtener el curso)
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

  // --- NUEVO DISEÑO PARA USUARIO ---
  if (user?.rol !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow flex flex-col md:flex-row gap-8">
        {/* Columna izquierda */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{curso.nombre}</h1>
          <p className="mb-4 text-black">{curso.descripcion}</p>
          <h2 className="font-semibold mb-2">Contenido</h2>
          <div className="mb-6">
            {curso.modulos && curso.modulos.length > 0 ? (
              <ul className="text-black">
                {curso.modulos.map((modulo) => (
                  <li key={modulo.id} className="mb-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-bold focus:outline-none hover:underline"
                      onClick={() => toggleModulo(modulo.id)}
                    >
                      <span>{openModulos.includes(modulo.id) ? '▼' : '▶'}</span>
                      {modulo.nombre}
                    </button>
                    {openModulos.includes(modulo.id) && modulo.subtemas && modulo.subtemas.length > 0 && (
                      <ul className="ml-6 list-none text-black mt-1">
                        {modulo.subtemas.map((subtema) => (
                          <li key={subtema.id} className="mb-1 flex items-center">
                            <span className="mr-2">📄</span>{subtema.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-black">No hay módulos registrados.</div>
            )}
          </div>
          <button
            className={`w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 ${inscrito ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={inscrito}
            onClick={async () => {
              if (inscrito) {
                setMsg('Ya estás inscrito en este curso.');
                return;
              }
              await handleInscribirse();
            }}
          >
            {inscrito ? 'Ya inscrito' : `Inscríbete por S/. ${curso.precio}`}
          </button>
          {msg && <div className="mt-4 text-green-700">{msg}</div>}
        </div>
        {/* Columna derecha */}
        <div className="w-full md:w-80 flex flex-col items-center">
          <img
            src={imgSrc}
            alt={curso.nombre}
            className="w-80 h-44 object-cover rounded mb-4"
            onError={e => {
              if (!e.currentTarget.src.endsWith('/imagenes/curso_1.jpg')) {
                e.currentTarget.src = '/imagenes/curso_1.jpg';
              }
            }}
          />
          <table className="w-full text-sm border">
            <tbody>
              <tr>
                <td className="font-semibold border px-2 py-2">Certificación por</td>
                <td className="border px-2 py-2">{curso.horas} horas</td>
              </tr>
              <tr>
                <td className="font-semibold border px-2 py-2">Precio</td>
                <td className="border px-2 py-2">S/. {curso.precio}</td>
              </tr>
              <tr>
                <td className="font-semibold border px-2 py-2">Próximo inicio</td>
                <td className="border px-2 py-2">Inicia y termina cuando quieras</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- VISTA PARA ADMIN ---
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {curso.imagen_url && (
        <img
          src={imgSrc}
          alt={curso.nombre}
          className="w-full h-56 object-cover rounded mb-4"
          onError={e => {
            if (!e.currentTarget.src.endsWith('/imagenes/curso_1.jpg')) {
              e.currentTarget.src = '/imagenes/curso_1.jpg';
            }
          }}
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{curso.nombre}</h1>
      <p className="mb-4 text-black">{curso.descripcion}</p>
      <div className="mb-4 flex gap-4">
        <span className="font-bold text-blue-600">S/. {curso.precio}</span>
        <span className="text-sm text-gray-500">{curso.horas} horas</span>
      </div>
      {user?.rol === 'admin' && (
        <div className="mb-4 flex gap-2">
          <button onClick={async () => {
            if (!window.confirm('¿Eliminar este curso?')) return;
            try {
              await api.delete(`/cursos/${curso.id}`);
              router.push('/cursos');
            } catch {
              alert('Error al eliminar curso');
            }
          }} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800">Eliminar</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?edit=1`)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?tab=materiales`)} className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800">Materiales</button>
          <button onClick={() => router.push(`/cursos/${curso.id}?tab=examenes`)} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">Exámenes</button>
        </div>
      )}
      <button
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${inscrito ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={async () => {
          if (inscrito) {
            setMsg('Ya estás inscrito en este curso.');
            return;
          }
          await handleInscribirse();
        }}
        disabled={inscrito}
      >
        {inscrito ? 'Ya inscrito' : 'Inscribirse'}
      </button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}

      {/* Modal de edición */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Editar Curso</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input type="text" value={editData.nombre} onChange={e => setEditData({ ...editData, nombre: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Descripción</label>
                <textarea value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full p-2 border rounded" rows={3} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Precio</label>
                <input type="number" value={editData.precio} onChange={e => setEditData({ ...editData, precio: Number(e.target.value) })} className="w-full p-2 border rounded" required min={0} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Horas</label>
                <input type="number" value={editData.horas} onChange={e => setEditData({ ...editData, horas: Number(e.target.value) })} className="w-full p-2 border rounded" required min={1} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Imagen (URL)</label>
                <input
                  type="text"
                  value={editData.imagen_url}
                  onChange={e => setEditData({ ...editData, imagen_url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ej: /imagenes/mi-curso.png"
                />
                {editData.imagen_url && (
                  <div className="mt-2"><img src={editData.imagen_url} alt="Vista previa" className="max-h-32 rounded" /></div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowEdit(false); router.replace(`/cursos/${id}`); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE GESTIÓN DE MATERIALES ---
function GestionMateriales({ cursoId, router }: { cursoId: number, router: any }) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [subtemaId, setSubtemaId] = useState<number | null>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Material>>({ tipo: '', url: '', descripcion: '' });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/modulos/curso/${cursoId}`).then(res => setModulos(res.data));
  }, [cursoId]);

  useEffect(() => {
    if (moduloId) {
      api.get(`/subtema/modulo/${moduloId}`).then(res => setSubtemas(res.data));
    } else {
      setSubtemas([]);
      setSubtemaId(null);
    }
  }, [moduloId]);

  useEffect(() => {
    if (subtemaId) {
      api.get(`/material/subtema/${subtemaId}`).then(res => setMateriales(res.data));
    } else {
      setMateriales([]);
    }
  }, [subtemaId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/material/${editId}`, { ...editData, subtema_id: subtemaId });
        setMsg('Material actualizado');
      } else {
        await api.post('/material', { ...editData, subtema_id: subtemaId });
        setMsg('Material creado');
      }
      setShowModal(false);
      setEditData({ tipo: '', url: '', descripcion: '' });
      setEditId(null);
      const res = await api.get(`/material/subtema/${subtemaId}`);
      setMateriales(res.data);
    } catch {
      setMsg('Error al guardar material');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este material?')) return;
    try {
      await api.delete(`/material/${id}`);
      setMateriales(materiales.filter(m => m.id !== id));
    } catch {
      setMsg('Error al eliminar material');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Materiales del Curso</h1>
      <div className="mb-4">
        <label className="block mb-1">Módulo</label>
        <select value={moduloId ?? ''} onChange={e => setModuloId(Number(e.target.value) || null)} className="w-full p-2 border rounded">
          <option value="">Seleccione un módulo</option>
          {modulos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>
      {moduloId && (
        <div className="mb-4">
          <label className="block mb-1">Subtema</label>
          <select value={subtemaId ?? ''} onChange={e => setSubtemaId(Number(e.target.value) || null)} className="w-full p-2 border rounded">
            <option value="">Seleccione un subtema</option>
            {subtemas.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      )}
      {subtemaId && (
        <>
          <button className="mb-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => { setShowModal(true); setEditId(null); setEditData({ tipo: '', url: '', descripcion: '' }); }}>Agregar Material</button>
          <ul className="mb-4">
            {materiales.map(m => {
              const url = m.url.startsWith('http') ? m.url : `${apiUrl}${m.url}`;
              return (
                <li key={m.id} className="mb-2 flex items-center gap-2">
                  <span>{m.tipo.toUpperCase()} - {m.descripcion} (<a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver</a>)</span>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setEditId(m.id); setEditData(m); setShowModal(true); }}>Editar</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDelete(m.id)}>Eliminar</button>
                </li>
              );
            })}
            {materiales.length === 0 && <li className="text-gray-500">No hay materiales.</li>}
          </ul>
        </>
      )}
      <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => router.replace(`/cursos/${cursoId}`)}>Volver</button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar' : 'Agregar'} Material</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block mb-1">Tipo</label>
                <select value={editData.tipo} onChange={e => setEditData({ ...editData, tipo: e.target.value, url: '' })} className="w-full p-2 border rounded" required>
                  <option value="">Seleccione tipo</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="ppt">PPT</option>
                </select>
              </div>
              {(editData.tipo === 'pdf' || editData.tipo === 'ppt') ? (
                <div className="mb-4">
                  <label className="block mb-1">Archivo ({editData.tipo.toUpperCase()})</label>
                  <input type="file" accept={editData.tipo === 'pdf' ? 'application/pdf' : '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'}
                    onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        const formData = new FormData();
                        formData.append('file', e.target.files[0]);
                        setEditData({ ...editData, url: 'subiendo...' });
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${apiUrl}/api/material/upload`, {
                            method: 'POST',
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                            body: formData
                          });
                          const data = await res.json();
                          if (res.ok && data.url) {
                            setEditData({ ...editData, url: data.url });
                          } else {
                            setEditData({ ...editData, url: '' });
                            alert(data.error || 'Error al subir archivo');
                          }
                        } catch (err) {
                          setEditData({ ...editData, url: '' });
                          alert('Error de red al subir archivo');
                        }
                      }
                    }}
                  />
                  {editData.url && editData.url !== 'subiendo...' && (
                    <div className="text-green-700 text-xs mt-1">Archivo subido: <a href={editData.url} target="_blank" rel="noopener noreferrer" className="underline">Ver archivo</a></div>
                  )}
                  {editData.url === 'subiendo...' && <div className="text-blue-700 text-xs mt-1">Subiendo archivo...</div>}
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block mb-1">URL</label>
                  <input type="text" value={editData.url} onChange={e => setEditData({ ...editData, url: e.target.value })} className="w-full p-2 border rounded" required />
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-1">Descripción</label>
                <input type="text" value={editData.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE GESTIÓN DE EXÁMENES ---
function GestionExamenes({ cursoId, router }: { cursoId: number, router: any }) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Examen>>({ nombre: '', porcentaje_aprob: 60 });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/modulos/curso/${cursoId}`).then(res => setModulos(res.data));
  }, [cursoId]);

  useEffect(() => {
    if (moduloId) {
      api.get(`/examenes/modulos/${moduloId}/examenes`).then(res => setExamenes(res.data));
    } else {
      setExamenes([]);
    }
  }, [moduloId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/examenes/${editId}`, { ...editData, modulo_id: moduloId });
        setMsg('Examen actualizado');
      } else {
        await api.post('/examenes', { ...editData, modulo_id: moduloId });
        setMsg('Examen creado');
      }
      setShowModal(false);
      setEditData({ nombre: '', porcentaje_aprob: 60 });
      setEditId(null);
      const res = await api.get(`/examenes/modulos/${moduloId}/examenes`);
      setExamenes(res.data);
    } catch {
      setMsg('Error al guardar examen');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este examen?')) return;
    try {
      await api.delete(`/examenes/${id}`);
      setExamenes(examenes.filter(e => e.id !== id));
    } catch {
      setMsg('Error al eliminar examen');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Exámenes del Curso</h1>
      <div className="mb-4">
        <label className="block mb-1">Módulo</label>
        <select value={moduloId ?? ''} onChange={e => setModuloId(Number(e.target.value) || null)} className="w-full p-2 border rounded">
          <option value="">Seleccione un módulo</option>
          {modulos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>
      {moduloId && (
        <>
          <button className="mb-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => { setShowModal(true); setEditId(null); setEditData({ nombre: '', porcentaje_aprob: 60 }); }}>Agregar Examen</button>
          <ul className="mb-4">
            {examenes.map(e => (
              <li key={e.id} className="mb-2 flex items-center gap-2">
                <span>{e.nombre} (Aprob: {e.porcentaje_aprob}%)</span>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setEditId(e.id); setEditData(e); setShowModal(true); }}>Editar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDelete(e.id)}>Eliminar</button>
                <button className="bg-green-700 text-white px-2 py-1 rounded text-xs" onClick={() => router.push(`/dashboard/admin/examenes/${e.id}/preguntas`)}>Preguntas</button>
              </li>
            ))}
            {examenes.length === 0 && <li className="text-gray-500">No hay exámenes.</li>}
          </ul>
        </>
      )}
      <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => router.replace(`/cursos/${cursoId}`)}>Volver</button>
      {msg && <div className="mt-4 text-green-700">{msg}</div>}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar' : 'Agregar'} Examen</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block mb-1">Nombre</label>
                <input type="text" value={editData.nombre} onChange={e => setEditData({ ...editData, nombre: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block mb-1">% Aprobación</label>
                <input type="number" value={editData.porcentaje_aprob} onChange={e => setEditData({ ...editData, porcentaje_aprob: Number(e.target.value) })} className="w-full p-2 border rounded" required min={1} max={100} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 