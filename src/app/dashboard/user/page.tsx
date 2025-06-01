import Link from 'next/link';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-500 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Mi Panel de Usuario</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/mis-cursos">
          <div className="bg-green-700 rounded-lg p-6 shadow-lg hover:bg-green-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Mis Cursos</h2>
            <p>Ver y acceder a tus cursos inscritos.</p>
          </div>
        </Link>
        <Link href="/dashboard/user/pagos">
          <div className="bg-green-700 rounded-lg p-6 shadow-lg hover:bg-green-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Pagos</h2>
            <p>Ver historial de pagos realizados.</p>
          </div>
        </Link>
        <Link href="/dashboard/user/certificados">
          <div className="bg-green-700 rounded-lg p-6 shadow-lg hover:bg-green-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Certificados</h2>
            <p>Descargar y validar tus certificados.</p>
          </div>
        </Link>
        <Link href="/dashboard/user/perfil">
          <div className="bg-green-700 rounded-lg p-6 shadow-lg hover:bg-green-800 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Mi Perfil</h2>
            <p>Ver y editar tus datos personales.</p>
          </div>
        </Link>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Resumen rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-800 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold">--</div>
            <div>Cursos inscritos</div>
          </div>
          <div className="bg-green-800 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold">--</div>
            <div>Pagos realizados</div>
          </div>
        </div>
      </div>
    </div>
  );
} 