'use client';
import { useEffect, useState, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';

type Material = {
  id: number;
  tipo: string;
  url: string;
  descripcion?: string;
};

type Subtema = {
  id: number;
  nombre: string;
  materiales: Material[];
};

type Modulo = {
  id: number;
  nombre: string;
  subtemas: Subtema[];
  examenes?: any[];
};

type Curso = {
  id: number;
  nombre: string;
  modulos: Modulo[];
};

function ExamenesModulo({ moduloId, cursoId }: { moduloId: number, cursoId: number }) {
  const [examenes, setExamenes] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/examenes/modulos/${moduloId}/examenes`).then(res => setExamenes(res.data));
  }, [moduloId]);
  if (!examenes.length) return null;
  return (
    <div className="mt-2">
      <h3 className="font-semibold">Exámenes:</h3>
      <ul>
        {examenes.map(examen => (
          <li key={examen.id} className="mb-1">
            {examen.nombre}{" "}
            <Link href={`/mis-cursos/${cursoId}/examenes/${examen.id}`}>
              <button className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 ml-2">
                Rendir examen
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MaterialesCursoPage() {
  const { curso_id } = useParams<{ curso_id: string }>();
  const router = useRouter();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState<{ moduloId: number; subtemaId: number; materialId: number } | null>(null);
  const [showEvaluaciones, setShowEvaluaciones] = useState(false);
  const [showDiscusion, setShowDiscusion] = useState(false);

  useEffect(() => {
    // Verifica si el usuario tiene acceso (estado comprado)
    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Debes iniciar sesión.');
      router.push('/auth');
      return;
    }
    api.get('/inscripciones/mis')
      .then(res => {
        const insc = res.data.find((i: any) => i.curso.id === Number(curso_id));
        if (!insc || insc.estado !== 'comprado') {
          setMsg('Tu pago está pendiente de aprobación por el administrador. Cuando sea aprobado, tendrás acceso al curso.');
          setLoading(false);
          return;
        }
        // Obtener materiales del curso
        api.get(`/cursos/${curso_id}`) // Suponiendo que el backend retorna módulos, subtemas y materiales
          .then(res2 => setCurso(res2.data))
          .catch(() => setCurso(null))
          .finally(() => setLoading(false));
      });
  }, [curso_id, router]);

  // Encuentra el material seleccionado
  let selectedMaterial: Material | null = null;
  let selectedTitulo = '';
  if (curso && selected) {
    const modulo = curso.modulos.find(m => m.id === selected.moduloId);
    const subtema = modulo?.subtemas.find(s => s.id === selected.subtemaId);
    selectedMaterial = subtema?.materiales.find(mat => mat.id === selected.materialId) || null;
    selectedTitulo = modulo?.nombre + ' / ' + subtema?.nombre;
  }

  if (loading) return <div className="p-8">Cargando...</div>;
  if (msg) {
    if (msg === 'No tienes acceso a este curso.') {
      return <div className="p-8 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded">Tu pago está pendiente de aprobación por el administrador. Cuando sea aprobado, tendrás acceso al curso.</div>;
    }
    return <div className="p-8 text-red-600">{msg}</div>;
  }
  if (!curso) return <div className="p-8">Curso no encontrado</div>;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Menú lateral */}
      <aside className="w-80 bg-[#f7fafc] border-r border-gray-200 p-4 overflow-y-auto h-[calc(100vh-40px)]">
        <h2 className="text-lg font-bold mb-4 text-[#023474]">{curso.nombre}</h2>
        <nav>
          <ul>
            {curso.modulos.map(modulo => (
              <li key={modulo.id} className="mb-2">
                <div className="font-semibold text-[#023474] mb-1">{modulo.nombre}</div>
                <ul className="ml-3">
                  {modulo.subtemas.map(subtema => (
                    <li key={subtema.id} className="mb-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">{subtema.nombre}</div>
                      <ul className="ml-2">
                        {subtema.materiales.map(material => (
                          <li key={material.id}>
                            <button
                              className={`text-xs px-2 py-1 rounded transition w-full text-left ${selected && selected.materialId === material.id ? 'bg-[#e6eef7] text-[#023474] font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                              onClick={() => setSelected({ moduloId: modulo.id, subtemaId: subtema.id, materialId: material.id })}
                            >
                              {material.tipo === 'video' ? '🎬' : '📄'} {material.descripcion || material.tipo.toUpperCase()}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Panel de contenido */}
      <main className="flex-1 p-8 bg-white min-h-screen">
        {selectedMaterial ? (
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2 text-[#023474]">{selectedTitulo}</h1>
            <div className="mb-4">
              {selectedMaterial.tipo === 'video' ? (
                <iframe
                  width="560"
                  height="315"
                  src={selectedMaterial.url}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded shadow"
                ></iframe>
              ) : (
                <a
                  href={selectedMaterial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline text-lg"
                >
                  {selectedMaterial.tipo.toUpperCase()} - {selectedMaterial.descripcion || 'Ver material'}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic mb-6">Selecciona un material del menú izquierdo para visualizarlo aquí.</div>
        )}
        {/* Acordeón Evaluaciones */}
        <div className="mb-4 border rounded">
          <button
            className="w-full text-left px-4 py-2 bg-[#e6eef7] text-[#023474] font-semibold rounded-t focus:outline-none"
            onClick={() => setShowEvaluaciones(v => !v)}
          >
            Evaluaciones {showEvaluaciones ? '▲' : '▼'}
          </button>
          {showEvaluaciones && (
            <div className="p-4 bg-white border-t">
              {curso.modulos.map(modulo => (
                <Fragment key={modulo.id}>
                  <div className="font-semibold text-[#023474] mb-1">{modulo.nombre}</div>
                  {modulo.examenes && modulo.examenes.length > 0 ? (
                    <ul className="mb-2 ml-2">
                      {modulo.examenes.map((examen: any) => (
                        <li key={examen.id} className="mb-1">
                          {examen.nombre}{' '}
                          <Link href={`/mis-cursos/${curso.id}/examenes/${examen.id}`}>
                            <button className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 ml-2 text-xs">
                              Rendir examen
                            </button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="ml-2 text-gray-500 text-xs mb-2">No hay exámenes en este módulo.</div>
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </div>
        {/* Acordeón Discusión */}
        <div className="mb-4 border rounded">
          <button
            className="w-full text-left px-4 py-2 bg-[#e6eef7] text-[#023474] font-semibold rounded-t focus:outline-none"
            onClick={() => setShowDiscusion(v => !v)}
          >
            Discusión {showDiscusion ? '▲' : '▼'}
          </button>
          {showDiscusion && (
            <div className="p-4 bg-white border-t text-gray-500 italic">Próximamente: foro de discusión para este curso.</div>
          )}
        </div>
      </main>
    </div>
  );
} 