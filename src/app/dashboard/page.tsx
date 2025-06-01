'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      if (user.rol === 'admin') router.replace('/dashboard/admin');
      else router.replace('/dashboard/user');
    } else {
      router.replace('/auth');
    }
  }, [router]);

  return <div className="p-8 text-center text-lg">Redirigiendo a tu panel...</div>;
} 