import React from 'react';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';

interface FormActionsProps {
  onDelete?: () => void;
  onInactivate?: () => void;
  onActivate?: () => void;
  onShowHelp?: () => void;
  onBack?: () => void;
  showDelete?: boolean;
  showInactivate?: boolean;
  showActivate?: boolean;
  showHelp?: boolean;
  showBack?: boolean;
  absolute?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onDelete,
  onInactivate,
  onActivate,
  onShowHelp,
  onBack,
  showDelete,
  showInactivate,
  showActivate,
  showHelp = true,
  showBack = true,
  absolute = false,
}) => {
  if (!showDelete && !showInactivate && !showActivate && !showHelp && !showBack) return null;

  const containerStyle: React.CSSProperties = absolute
    ? { position: 'absolute', top: 24, right: 24, zIndex: 10 }
    : { display: 'flex', alignItems: 'center' };

  return (
    <div style={containerStyle}>
      <TooltipProvider>
        <div className="flex flex-row gap-4">
          {showBack && onBack && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-primary"
                  aria-label="Voltar"
                >
                  <ArrowLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Voltar (Ctrl/Cmd + ←)</TooltipContent>
            </Tooltip>
          )}
          {showDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onDelete}
                  className="font-semibold border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 />
                  Deletar
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Ctrl/Cmd + D</TooltipContent>
            </Tooltip>
          )}
          {showInactivate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onInactivate}
                  className="font-semibold border-amber-400/60 text-amber-700 hover:bg-amber-500 hover:text-white dark:text-amber-300"
                >
                  <Ban />
                  Inativar
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Ctrl/Cmd + I</TooltipContent>
            </Tooltip>
          )}
          {showActivate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onActivate}
                  className="font-semibold border-emerald-400/60 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-300"
                >
                  <CheckCircle2 />
                  Ativar
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Ctrl/Cmd + I</TooltipContent>
            </Tooltip>
          )}
          {showHelp && onShowHelp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onShowHelp}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-primary"
                  aria-label="Ajuda"
                >
                  <HelpCircle />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">F1 - Ajuda</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}; 
