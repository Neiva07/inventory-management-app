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

interface ShortcutItem {
  shortcut: string;
  description: string;
}

interface KeyboardListPageKeyboardHelpProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  customShortcuts?: ShortcutItem[];
  showInactivate?: boolean;
}

const ShortcutItem: React.FC<{ shortcut: string; description: string }> = ({ shortcut, description }) => (
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

export const KeyboardListPageKeyboardHelp: React.FC<KeyboardListPageKeyboardHelpProps> = ({
  open,
  onClose,
  title = "Atalhos do Teclado - Listagem",
  customShortcuts = [],
  showInactivate = false,
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
              Busca e Navegação
            </Typography>
            <ShortcutItem shortcut="Ctrl/Cmd + F" description="Focar campo de busca" />
            <ShortcutItem shortcut="Tab" description="Próximo campo / botão" />
            <ShortcutItem shortcut="Shift + Tab" description="Campo anterior" />
            <ShortcutItem shortcut="Ctrl/Cmd + Escape" description="Limpar filtros e focar busca" />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Ações Rápidas
            </Typography>
            <ShortcutItem shortcut="Ctrl/Cmd + N" description="Criar novo item" />
            <ShortcutItem shortcut="Ctrl/Cmd + E" description="Editar item selecionado" />
            <ShortcutItem shortcut="Ctrl/Cmd + D" description="Deletar item selecionado" />
            {showInactivate && (
              <ShortcutItem shortcut="Ctrl/Cmd + I" description="Alternar status (ativar/inativar) do item selecionado" />
            )}
            <ShortcutItem shortcut="Ctrl/Cmd + R" description="Atualizar dados" />
            <ShortcutItem shortcut="Ctrl/Cmd + T" description="Focar primeira linha da tabela" />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Navegação na Tabela
            </Typography>
            <ShortcutItem shortcut="Setas" description="Navegar entre linhas" />
            <ShortcutItem shortcut="Enter" description="Editar linha selecionada" />
            <ShortcutItem shortcut="Delete" description="Deletar linha selecionada" />
            <ShortcutItem shortcut="Espaço" description="Selecionar/desselecionar linha" />
            <ShortcutItem shortcut="Home/End" description="Primeira/última linha" />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Paginação
            </Typography>
            <ShortcutItem shortcut="Ctrl/Cmd + ←" description="Página anterior" />
            <ShortcutItem shortcut="Ctrl/Cmd + →" description="Próxima página" />
          </Grid>
          
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