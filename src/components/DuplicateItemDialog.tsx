import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'components/ui';

interface DuplicateItemDialogProps {
  open: boolean;
  onClose: () => void;
  onOverride: () => void;
  productName: string;
  unitName: string;
}

export const DuplicateItemDialog: React.FC<DuplicateItemDialogProps> = ({
  open,
  onClose,
  onOverride,
  productName,
  unitName,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle id="duplicate-item-dialog-title">Item já existe</DialogTitle>
          <DialogDescription
            id="duplicate-item-dialog-description"
            className="text-sm text-foreground"
          >
            O produto <strong>{productName}</strong> na unidade{' '}
            <strong>{unitName}</strong> já foi adicionado.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Você pode sobrescrever o item existente ou cancelar a operação.
        </p>
        <DialogFooter className="pt-2">
          <Button onClick={onClose} autoFocus variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={onOverride}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Sobrescrever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
