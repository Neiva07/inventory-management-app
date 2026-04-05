import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tooltipMessage = isOnline 
    ? "Aplicação conectada à internet" 
    : "A aplicação não está conectada à internet";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-5 right-5 z-[9999] cursor-help">
            <Badge
              role="status"
              aria-live="polite"
              variant="outline"
              className={
                isOnline
                  ? 'gap-1.5 border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'gap-1.5 border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }
            >
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="text-xs font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 
