'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function ExamenesAdminPage() {
  const [examenes, setExamenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/cursos')
      .then(res => {
        const allExams: any[] = [];
        res.data.forEach((curso: any) => {
          curso.modulos?.forEach((modulo: any) => {
            modulo.examenes?.forEach((examen: any) => {
              allExams.push({
                ...examen,
                modulo: modulo.nombre,
                curso: curso.nombre,
                moduloId: modulo.id,
                cursoId: curso.id
              });
            });
          });
        });
        setExamenes(allExams);
      })
      .catch(() => setMsg('Error al cargar exámenes'))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number) => {
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

  // Botón para crear examen
  const handleCrearExamen = () => {
    alert('Funcionalidad de crear examen (prototipo)');
    // Aquí puedes abrir un modal o redirigir a una página de creación
  };
  const handleEditar = (examen: any) => {
    alert(`Editar examen: ${examen.nombre} (prototipo)`);
    // Aquí puedes abrir un modal o redirigir a una página de edición
  };
  const handlePreguntas = (examen: any) => {
    alert(`Gestionar preguntas de: ${examen.nombre} (prototipo)`);
    // Aquí puedes abrir un modal o redirigir a la gestión de preguntas
  };
  const handleModulo = (moduloId: number) => {
    alert(`Gestionar módulo ID: ${moduloId} (prototipo)`);
    // Aquí puedes abrir un modal o redirigir a la gestión de módulos
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Exámenes</h1>
      <button onClick={handleCrearExamen} className="mb-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">Crear Examen</button>
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
                  <button onClick={() => handleEliminar(e.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800 mr-2">Eliminar</button>
                  <button onClick={() => handleEditar(e)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Editar</button>
                  <button onClick={() => handlePreguntas(e)} className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 mr-2">Preguntas</button>
                  <button onClick={() => handleModulo(e.moduloId)} className="bg-purple-700 text-white px-2 py-1 rounded hover:bg-purple-800">Módulo</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 