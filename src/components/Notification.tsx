import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, BellIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  playSound?: boolean;
}

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 5000,
  onClose,
  playSound = false 
}: NotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (playSound) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.15;
      audio.play().catch(console.error);
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, playSound]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg border ${getBgColor()} shadow-lg animate-fade-in`}>
      {getIcon()}
      <span className="text-gray-800">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
} 