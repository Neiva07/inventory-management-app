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
import { Warning as WarningIcon } from '@mui/icons-material';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">
            Sair da Configuração
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          Você tem certeza que deseja sair da configuração da organização?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Todas as informações que você preencheu serão perdidas e você precisará começar novamente.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Sair e Perder Dados
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 