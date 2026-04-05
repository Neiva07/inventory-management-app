import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from 'components/ui';
import type { UpdateInfo } from 'electron-updater';

type NotificationVariant = 'info' | 'success' | 'error';

interface NotificationCardProps {
  variant: NotificationVariant;
  children: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
}

const notificationStyles: Record<NotificationVariant, string> = {
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  error: 'border-destructive/30 bg-destructive/10 text-destructive-foreground',
};

const iconStyles: Record<NotificationVariant, string> = {
  info: 'text-sky-300',
  success: 'text-emerald-300',
  error: 'text-destructive-foreground',
};

const NotificationIcon: React.FC<{ variant: NotificationVariant }> = ({ variant }) => {
  if (variant === 'success') {
    return <CheckCircle2 className="h-4 w-4 shrink-0" />;
  }

  if (variant === 'error') {
    return <AlertCircle className="h-4 w-4 shrink-0" />;
  }

  return <Info className="h-4 w-4 shrink-0" />;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  variant,
  children,
  action,
  onClose,
}) => {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={[
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg backdrop-blur',
        'bg-background/95 text-foreground',
      ].join(' ')}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={[
            'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full',
            notificationStyles[variant],
            iconStyles[variant],
          ].join(' ')}
        >
          <NotificationIcon variant={variant} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm">{children}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClose}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

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
    <div className="pointer-events-none fixed bottom-4 right-4 z-[10010] flex w-[min(100%-2rem,24rem)] flex-col gap-2">
      {!!updateAvailable && !updateDownloaded && (
        <NotificationCard
          variant="info"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void handleDownload();
              }}
            >
              Baixar
            </Button>
          }
        >
          Uma nova versão {updateAvailable?.version} está disponível!
        </NotificationCard>
      )}

      {!!updateDownloaded && (
        <NotificationCard
          variant="success"
          action={
            <Button
              size="sm"
              onClick={() => {
                void handleInstall();
              }}
            >
              Instalar Agora
            </Button>
          }
        >
          Atualização {updateDownloaded?.version} baixada e pronta para instalar!
        </NotificationCard>
      )}

      {!!error && (
        <NotificationCard variant="error" onClose={() => setError(null)}>
          Erro ao verificar atualizações: {error}
        </NotificationCard>
      )}
    </div>
  );
};
