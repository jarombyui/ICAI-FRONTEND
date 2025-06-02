'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4">
        <Link href="/cursos" className="font-bold hover:underline">Explorar cursos</Link>
        {isAuth && <Link href="/mis-cursos" className="hover:underline">Mis cursos</Link>}
        {isAuth && <Link href="/dashboard/admin/cursos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cursos</Link>}
        {isAuth && <Link href="/dashboard/admin/modulos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Módulos</Link>}
        {isAuth && <Link href="/dashboard/admin/examenes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exámenes</Link>}
      </div>
      <div>
        {isAuth ? (
          <button onClick={handleLogout} className="bg-blue-900 px-3 py-1 rounded hover:bg-blue-800">Cerrar sesión</button>
        ) : (
          <Link href="/auth" className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-200">Login / Registro</Link>
        )}
      </div>
    </nav>
  );
} 