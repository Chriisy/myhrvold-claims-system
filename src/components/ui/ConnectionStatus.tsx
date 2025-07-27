import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline alert after some time when back online
    if (isOnline && showOfflineAlert) {
      const timer = setTimeout(() => setShowOfflineAlert(false), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, showOfflineAlert]);

  if (!isOnline || showOfflineAlert) {
    return (
      <Alert className="fixed top-4 right-4 z-50 w-auto max-w-sm">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription>
            {isOnline ? 'Tilkoblet igjen' : 'Ingen internettforbindelse'}
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return null;
};