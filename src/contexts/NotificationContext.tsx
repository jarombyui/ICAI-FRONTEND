import { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '@/components/Notification';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info', playSound?: boolean, duration?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    playSound: boolean;
    duration?: number;
    resolve?: () => void;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', playSound = false, duration = 4000) => {
    return new Promise<void>(resolve => {
      setNotification({ message, type, playSound, duration, resolve });
    });
  };

  const handleClose = () => {
    if (notification?.resolve) notification.resolve();
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          playSound={notification.playSound}
          duration={notification.duration}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 