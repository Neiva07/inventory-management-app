import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, Box } from '@mui/material';
import type { UpdateInfo } from 'electron-updater';

export const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for update events from the main process
    window.electron.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateAvailable(info);
    });

    window.electron.onUpdateDownloaded((info: UpdateInfo) => {
      setUpdateDownloaded(info);
    });

    window.electron.onUpdateError((err: Error) => {
      setError(err.message);
    });
  }, []);

  const handleDownload = () => {
    window.electron.downloadUpdate();
  };

  const handleInstall = () => {
    window.electron.installUpdate();
  };

  return (
    <>
      <Snackbar
        open={!!updateAvailable && !updateDownloaded}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleDownload}>
              Baixar
            </Button>
          }
        >
          Uma nova versão {updateAvailable?.version} está disponível!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!updateDownloaded}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          action={
            <Button color="inherit" size="small" onClick={handleInstall}>
              Instalar Agora
            </Button>
          }
        >
          Atualização {updateDownloaded?.version} baixada e pronta para instalar!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          Erro ao verificar atualizações: {error}
        </Alert>
      </Snackbar>
    </>
  );
}; 