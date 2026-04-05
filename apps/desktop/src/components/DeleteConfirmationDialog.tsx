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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resourceName: string;
  onDialogClosed?: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  resourceName,
  onDialogClosed,
}) => {
  const isConfirmingRef = React.useRef(false);

  const handleClose = () => {
    onClose();
    if (onDialogClosed) {
      setTimeout(() => {
        onDialogClosed();
      }, 100);
    }
  };

  const handleConfirm = () => {
    isConfirmingRef.current = true;
    onConfirm();
    if (onDialogClosed) {
      setTimeout(() => {
        onDialogClosed();
      }, 100);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (isConfirmingRef.current) {
          isConfirmingRef.current = false;
          return;
        }
        handleClose();
      }}
    >
      <AlertDialogContent onCloseAutoFocus={(event) => event.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle id="delete-confirmation-dialog-title">
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription id="delete-confirmation-dialog-description">
            Você tem certeza que quer deletar o {resourceName}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 
