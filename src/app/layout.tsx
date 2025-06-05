'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PUBLIC_ROUTES = ["/landing", "/auth", "/auth/login", "/auth/registro", "/cursos", "/favicon.ico"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const hideNavbar = pathname.startsWith("/landing");

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // Si no está autenticado y no es ruta pública, redirigir a landing
    if (!token && !PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"))) {
      router.replace("/landing");
    }
    // Si está autenticado y está en login, registro o landing, redirigir a dashboard
    if (token && (pathname === "/landing" || pathname.startsWith("/auth"))) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol === 'admin') router.replace("/dashboard/admin");
        else router.replace("/dashboard/user");
      } catch {
        router.replace("/dashboard/user");
      }
    }
    // Controlar el botón atrás después de logout
    const onPopState = () => {
      const tokenNow = localStorage.getItem('token');
      if (!tokenNow && !PUBLIC_ROUTES.some(r => window.location.pathname === r || window.location.pathname.startsWith(r + "/"))) {
        router.replace("/landing");
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [pathname, router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {!hideNavbar && <Navbar />}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
