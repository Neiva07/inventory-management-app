import React, { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';

interface PublicIdDisplayProps {
  publicId?: string;
  recordType?: string;
  variant?: 'form' | 'list';
  showLabel?: boolean;
}

const COPY_TOAST_MS = 2000;

export const PublicIdDisplay: React.FC<PublicIdDisplayProps> = ({
  publicId,
  recordType,
  variant = 'form',
  showLabel = true,
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (!showCopiedMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowCopiedMessage(false);
    }, COPY_TOAST_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [showCopiedMessage]);

  const handleCopy = async () => {
    if (!publicId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicId);
      setShowCopiedMessage(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!publicId) {
    return null;
  }

  const sizeClass =
    variant === 'list'
      ? 'gap-2 px-2.5 py-1.5'
      : 'gap-2.5 px-3 py-2';

  const tooltipLabel = recordType
    ? `Identificador único deste ${recordType}`
    : 'Identificador único deste registro';

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                void handleCopy();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  void handleCopy();
                }
              }}
              className={[
                'group inline-flex cursor-pointer items-center rounded-md border bg-muted/30 transition',
                'hover:-translate-y-px hover:border-primary/40 hover:bg-muted/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                sizeClass,
              ].join(' ')}
            >
              {showLabel && (
                <span className="text-xs font-semibold uppercase tracking-[0.5px] text-muted-foreground">
                  ID:
                </span>
              )}

              <span className="select-none font-mono text-sm font-medium tracking-[0.5px] text-foreground">
                {publicId}
              </span>

              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-primary transition hover:bg-primary/10"
                aria-label="Copiar ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltipLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showCopiedMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-[10000] -translate-x-1/2 rounded-md border bg-background px-3 py-2 text-sm shadow-lg"
        >
          ID copiado para a area de transferencia
        </div>
      )}
    </>
  );
};
