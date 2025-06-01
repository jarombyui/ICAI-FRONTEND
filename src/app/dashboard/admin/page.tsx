import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/cursos">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Gestión de Cursos</h2>
            <p>Crear, editar y eliminar cursos.</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/usuarios">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
            <p>Ver y gestionar usuarios y roles.</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/inscripciones">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Inscripciones</h2>
            <p>Ver todas las inscripciones.</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/pagos">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Pagos</h2>
            <p>Ver y gestionar pagos de cursos.</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/certificados">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Certificados</h2>
            <p>Ver y validar certificados emitidos.</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/examenes">
          <div className="bg-blue-700 rounded-lg p-6 shadow-lg hover:bg-blue-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Exámenes</h2>
            <p>Gestionar exámenes y preguntas.</p>
          </div>
        </Link>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Estadísticas rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-800 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold">--</div>
            <div>Cursos</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold">--</div>
            <div>Usuarios</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold">--</div>
            <div>Pagos</div>
          </div>
        </div>
      </div>
    </div>
  );
} 