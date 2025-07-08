import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ShortcutItem {
  shortcut: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  showVariants?: boolean;
  customShortcuts?: ShortcutItem[];
}

const ShortcutItem = ({ shortcut, description }: { shortcut: string; description: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <Chip 
      label={shortcut} 
      size="small" 
      sx={{ 
        mr: 2, 
        fontFamily: 'monospace',
        backgroundColor: 'primary.main',
        color: 'white',
        fontWeight: 'bold'
      }} 
    />
    <Typography variant="body2">{description}</Typography>
  </Box>
);

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
  title = "Atalhos do Teclado",
  showVariants = false,
  customShortcuts = [],
}) => {
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
        {title}
        <Button onClick={onClose} size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Ações do Formulário
            </Typography>
            <ShortcutItem shortcut="Ctrl/Cmd + Enter" description="Enviar formulário" />
            <ShortcutItem shortcut="Ctrl/Cmd + D" description="Deletar (modo edição)" />
            <ShortcutItem shortcut="Ctrl/Cmd + I" description="Inativar/Ativar" />
            <ShortcutItem shortcut="Ctrl/Cmd + R" description="Resetar formulário" />
            <ShortcutItem shortcut="Ctrl/Cmd + T" description="Alternar modo de criação" />
          </Grid>
          
          {showVariants && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Variantes
              </Typography>
              <ShortcutItem shortcut="Ctrl/Cmd + O" description="Adicionar nova variante" />
              <ShortcutItem shortcut="Ctrl/Cmd + P" description="Adicionar novo preço" />
            </Grid>
          )}
          
          {customShortcuts.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Ações Específicas
              </Typography>
              {customShortcuts.map((item, index) => (
                <ShortcutItem key={index} shortcut={item.shortcut} description={item.description} />
              ))}
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Navegação
            </Typography>
            <ShortcutItem shortcut="Ctrl/Cmd + ←" description="Voltar à página anterior" />
            <ShortcutItem shortcut="Tab" description="Próximo campo / Selecionar opção no dropdown" />
            <ShortcutItem shortcut="Shift + Tab" description="Campo anterior" />
            <ShortcutItem shortcut="Setas" description="Navegar opções do dropdown" />
            <ShortcutItem shortcut="Enter/Espaço" description="Selecionar opção do dropdown" />
            <ShortcutItem shortcut="Escape" description="Fechar dropdown" />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Ajuda
            </Typography>
            <ShortcutItem shortcut="F1" description="Mostrar esta ajuda" />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'bold', mt: 2 }}>
              Atalhos Globais
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ShortcutItem shortcut="F1" description="Mostrar ajuda global" />
                <ShortcutItem shortcut="Ctrl/Cmd + ," description="Ir para Configurações" />
                <ShortcutItem shortcut="Ctrl/Cmd + H" description="Ir para o Painel de Controle" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ShortcutItem shortcut="Ctrl/Cmd + 1" description="Lista de Produtos" />
                <ShortcutItem shortcut="Ctrl/Cmd + 2" description="Criar Produto" />
                <ShortcutItem shortcut="Ctrl/Cmd + 3" description="Lista de Vendas" />
                <ShortcutItem shortcut="Ctrl/Cmd + 4" description="Criar Venda" />
                <ShortcutItem shortcut="Ctrl/Cmd + 5" description="Lista de Compras" />
                <ShortcutItem shortcut="Ctrl/Cmd + 6" description="Criar Compra" />
                <ShortcutItem shortcut="Ctrl/Cmd + 7" description="Contas a Pagar" />
                <ShortcutItem shortcut="Ctrl/Cmd + 8" description="Parcelas" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Dica:</strong> Todos os atalhos funcionam de qualquer lugar, incluindo quando você está digitando em campos de entrada.
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