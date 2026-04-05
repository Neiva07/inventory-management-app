import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'components/ui';
import { Warning as WarningIcon } from 'components/ui/icon-compat';

interface OnboardingExitDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const OnboardingExitDialog: React.FC<OnboardingExitDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <WarningIcon sx={{ color: 'warning.main' }} />
            <span>Sair da Configuração</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Você tem certeza que deseja sair da configuração da organização?</p>
              <p className="text-sm text-muted-foreground">
                Todas as informações que você preencheu serão perdidas e você precisará começar novamente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sair e Perder Dados
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 
