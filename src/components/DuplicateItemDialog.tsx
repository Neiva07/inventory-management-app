import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

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
      onClose={onClose}
      aria-labelledby="duplicate-item-dialog-title"
      aria-describedby="duplicate-item-dialog-description"
      disableRestoreFocus
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="duplicate-item-dialog-title">
        Item já existe
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography id="duplicate-item-dialog-description" variant="body1">
            O produto <strong>{productName}</strong> na unidade <strong>{unitName}</strong> já foi adicionado.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Você pode sobrescrever o item existente ou cancelar a operação.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
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
        <Button 
          onClick={onOverride} 
          variant="contained"
          color="warning"
        >
          Sobrescrever
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 