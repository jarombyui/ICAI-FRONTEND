'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

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
    // Limpiar token y posibles datos de sesión
    localStorage.removeItem('token');
    // Si tienes otros datos de sesión, agrégalos aquí:
    // localStorage.removeItem('user');
    setShowMenu(false); // Cierra el menú inmediatamente
    setIsAuth(false);
    setUser(null);
    // Forzar refresco de la UI
    setTimeout(() => {
      router.replace('/auth');
    }, 100);
  };

  // --- LOGO CLICK HANDLER ---
  const handleLogoClick = () => {
    if (isAuth && user?.rol === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/mis-cursos');
    }
  };

  return (
    <nav className="bg-white text-[#023474] px-6 py-4 min-h-[90px] flex justify-between items-center border-b border-gray-200 shadow-sm">
      <div className="flex gap-6 items-center h-full">
        <button
          onClick={handleLogoClick}
          className="focus:outline-none flex items-center h-full"
          type="button"
        >
          <Image src="/imagenes/logo/logo-icai.jpeg" alt="Logo" width={72} height={72} className="mr-2" priority style={{ height: '72px', width: 'auto' }} />
        </button>
        {isAuth && user?.rol === 'admin' ? (
          <>
            <Link href="/cursos" className="font-bold hover:underline">Explorar cursos</Link>
            <Link href="/mis-cursos" className="font-bold hover:underline">Mis cursos</Link>
            <Link href="/dashboard/admin" className="font-bold hover:underline">Panel de Administrador</Link>
            <Link href="/dashboard/admin/modulos" className="font-bold hover:underline">Módulos</Link>
            <Link href="/dashboard/admin/examenes" className="font-bold hover:underline">Exámenes</Link>
          </>
        ) : (
          <>
            <Link href="/cursos" className="font-bold hover:underline">Explorar cursos</Link>
            {isAuth && <Link href="/mis-cursos" className="font-bold hover:underline">Mis cursos</Link>}
          </>
        )}
      </div>
      <div>
        {isAuth ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-[#023474] text-white px-3 py-1 rounded hover:bg-[#23386f] focus:outline-none"
              onClick={() => setShowMenu(v => !v)}
              onBlur={() => setTimeout(() => setShowMenu(false), 150)}
            >
              <UserIcon className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded shadow-lg z-50 p-4 flex flex-col gap-2 animate-fade-in">
                {user && (
                  <div className="font-bold uppercase text-xs text-gray-500">{`${(user?.nombre || '').toUpperCase()} ${(user?.apellido || '').toUpperCase()}`.trim()}</div>
                )}
                <div className="text-sm text-gray-700 mb-2">{user?.email}</div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:underline text-sm mt-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth" className="bg-[#023474] text-white px-3 py-1 rounded hover:bg-[#23386f]">Login / Registro</Link>
        )}
      </div>
    </nav>
  );
} 