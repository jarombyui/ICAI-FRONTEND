'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/usuario')
      .then(res => setUsuarios(res.data))
      .catch(() => setMsg('Error al cargar usuarios (verifica conexión y permisos)'))
      .finally(() => setLoading(false));
  }, []);

  const cambiarRol = async (id: number, nuevoRol: string) => {
    try {
      await api.put(`/usuarios/${id}`, { rol: nuevoRol });
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
      setMsg('Rol actualizado');
    } catch {
      setMsg('Error al actualizar rol');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
      {msg && <div className="mb-4 text-green-500">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        <table className="w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="text-center">
                <td>{u.id}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>
                  <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)} className="border rounded px-2 py-1">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 