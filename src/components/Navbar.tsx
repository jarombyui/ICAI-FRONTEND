'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Refresca el usuario y autenticación
  const refreshUser = () => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
    if (token) {
      try {
        setUser(JSON.parse(atob(token.split('.')[1])));
      } catch { setUser(null); }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
    // Escucha cambios en localStorage (login/logout en otras pestañas)
    const onStorage = () => refreshUser();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4">
        {isAuth && user?.rol === 'admin' ? (
          <>
            <Link href="/cursos" className="font-bold hover:underline">Explorar cursos</Link>
            <Link href="/mis-cursos" className="font-bold hover:underline">Mis cursos</Link>
            <Link href="/dashboard/admin/modulos" className="font-bold hover:underline">Módulos</Link>
            <Link href="/dashboard/admin/examenes" className="font-bold hover:underline">Exámenes</Link>
          </>
        ) : (
          <>
            <Link href="/cursos" className="font-bold hover:underline">Explorar cursos</Link>
            {isAuth && <Link href="/mis-cursos" className="hover:underline">Mis cursos</Link>}
          </>
        )}
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