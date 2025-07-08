import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

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
  const handleClose = () => {
    onClose();
    if (onDialogClosed) {
      setTimeout(() => {
        onDialogClosed();
      }, 100);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    if (onDialogClosed) {
      setTimeout(() => {
        onDialogClosed();
      }, 100);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-confirmation-dialog-title"
      aria-describedby="delete-confirmation-dialog-description"
      disableRestoreFocus
    >
      <DialogTitle id="delete-confirmation-dialog-title">
        Confirmar exclusão
      </DialogTitle>
      <DialogContent>
        <Typography id="delete-confirmation-dialog-description">
          Você tem certeza que quer deletar o {resourceName}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          autoFocus
          variant="outlined"
          sx={{
            '&:focus': {
              outline: '2px solid #1976d2',
              outlineOffset: '2px',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
            },
            '&:focus-visible': {
              outline: '2px solid #1976d2',
              outlineOffset: '2px',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
            }
          }}
        >
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Deletar
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 