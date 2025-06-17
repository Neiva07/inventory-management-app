import React, { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';

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
    <Tooltip title={tooltipMessage} placement="top">
      <Chip
        icon={isOnline ? <Wifi /> : <WifiOff />}
        label={isOnline ? "Online" : "Offline"}
        color={isOnline ? "success" : "warning"}
        size="small"
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: 'help'
        }}
      />
    </Tooltip>
  );
}; 