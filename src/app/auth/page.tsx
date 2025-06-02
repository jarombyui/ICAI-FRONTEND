'use client';
import { useState } from 'react';
import api from '@/utils/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', dni: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: form.email, password: form.password });
        setSuccess('Login exitoso');
        localStorage.setItem('token', res.data.token);
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        if (payload.rol === 'admin') {
          window.location.href = '/dashboard/admin';
        } else {
          window.location.href = '/dashboard/user';
        }
      } else {
        await api.post('/auth/register', form);
        // Login automático tras registro
        const res = await api.post('/auth/login', { email: form.email, password: form.password });
        setSuccess('Registro y login exitosos');
        localStorage.setItem('token', res.data.token);
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        if (payload.rol === 'admin') {
          window.location.href = '/dashboard/admin';
        } else {
          window.location.href = '/dashboard/user';
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <input
              type="text"
              name="nombre"
              placeholder="Nombres"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellidos"
              value={form.apellido}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={form.dni}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          className="text-blue-600 underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {success && <div className="mt-2 text-green-600">{success}</div>}
    </div>
  );
} 