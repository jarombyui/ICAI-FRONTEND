import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function SecurityBanner({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  if (!visible) return null;

  return (
    <div className="flex items-center bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 relative" role="alert">
      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-700 mr-2" />
      <div>
        <span className="font-bold">Refuerza tu contraseña:</span>
        <span className="ml-1">
          Si tu navegador te recomienda cambiarla, sigue la sugerencia para mayor seguridad.
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
} 