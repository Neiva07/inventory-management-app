import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface GlobalKeyboardHelpProps {
  open: boolean;
  onClose: () => void;
}

const ShortcutItem: React.FC<{ shortcut: string; description: string }> = ({ shortcut, description }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
    <Chip
      label={shortcut}
      size="small"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        fontWeight: 600,
        minWidth: 80,
        mr: 2,
      }}
    />
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

export const GlobalKeyboardHelp: React.FC<GlobalKeyboardHelpProps> = ({
  open,
  onClose,
}) => {
  const globalShortcuts = [
    { shortcut: 'F1', description: 'Mostrar esta ajuda global' },
    { shortcut: 'Ctrl/Cmd + ,', description: 'Ir para Configurações' },
    { shortcut: 'Ctrl/Cmd + H', description: 'Ir para o Painel de Controle' },
  ];

  const navigationShortcuts = [
    { shortcut: 'Ctrl/Cmd + 1', description: 'Lista de Produtos' },
    { shortcut: 'Ctrl/Cmd + 2', description: 'Criar Produto' },
    { shortcut: 'Ctrl/Cmd + 3', description: 'Lista de Vendas' },
    { shortcut: 'Ctrl/Cmd + 4', description: 'Criar Venda' },
    { shortcut: 'Ctrl/Cmd + 5', description: 'Lista de Compras' },
    { shortcut: 'Ctrl/Cmd + 6', description: 'Criar Compra' },
    { shortcut: 'Ctrl/Cmd + 7', description: 'Contas a Pagar' },
    { shortcut: 'Ctrl/Cmd + 8', description: 'Parcelas' },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Atalhos Globais do Teclado
        </Typography>
        <Button onClick={onClose} size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={4}>
          {/* Global Shortcuts */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Atalhos Globais
            </Typography>
            {globalShortcuts.map((item, index) => (
              <ShortcutItem key={index} shortcut={item.shortcut} description={item.description} />
            ))}
          </Grid>

          {/* Navigation Shortcuts */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Navegação Rápida
            </Typography>
            {navigationShortcuts.map((item, index) => (
              <ShortcutItem key={index} shortcut={item.shortcut} description={item.description} />
            ))}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Dica:</strong> Os atalhos globais funcionam de qualquer lugar da aplicação, incluindo quando você está digitando em campos de entrada.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 