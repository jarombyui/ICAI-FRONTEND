"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [show, setShow] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
    // Ocultar en login y rutas de admin
    if (pathname.startsWith('/auth') || pathname.startsWith('/dashboard/admin')) {
      setShow(false);
      return;
    }
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol === 'admin') setShow(false);
        else setShow(true);
      } catch {
        setShow(true);
      }
    } else {
      setShow(true);
    }
  }, [pathname]);

  if (!hydrated || !show) return null;

  return (
    <footer className="bg-[#003366] text-white mt-16 w-full">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between gap-8">
        <div>
          <img src="/imagenes/logo/logo-icai.jpeg" alt="Logo ICAI" className="h-10 mb-2" />
          <div className="text-sm mb-2">CETPRO Instituto de Ciencias Emresariales e Ingeniería Aplicada</div>
          <div className="text-xs mb-1">Amderson Cooworking, Miraflores, Lima Perú</div>
          <div className="text-xs mb-1">📞 +51 947726382</div>
          <div className="text-xs mb-1">✉️ contacto@icai.com</div>
          <div className="text-xs">Versión 2.2.040924.009</div>
        </div>
        <div className="flex flex-col justify-end items-start md:items-end">
          <div className="text-xs mb-2">Esta tienda está autorizada por Visa para realizar transacciones electrónicas</div>
          <div className="flex gap-2">
            <img src="/imagenes/visa/visa.jpeg" alt="Visa" className="h-8" />
            <img src="/imagenes/visa/verifiedbyvisa.png" alt="Verified by Visa" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
} 