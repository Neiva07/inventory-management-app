import React from 'react';
import { Box, Button, Stack, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  return (
    <Box sx={absolute ? { position: 'absolute', top: 24, right: 24, zIndex: 10 } : { display: 'flex', alignItems: 'center' }}>
      <Stack direction="row" spacing={2}>
        {showBack && onBack && (
          <Tooltip title="Voltar (Ctrl/Cmd + ←)" placement="top">
            <IconButton onClick={onBack} color="primary" size="large">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        {showDelete && (
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
              sx={{ fontWeight: 600 }}
            >
              Deletar
            </Button>
          </Tooltip>
        )}
        {showInactivate && (
          <Tooltip title="Ctrl/Cmd + I" placement="top">
            <Button
              variant="outlined"
              color="warning"
              startIcon={<BlockIcon />}
              onClick={onInactivate}
              sx={{ fontWeight: 600 }}
            >
              Inativar
            </Button>
          </Tooltip>
        )}
        {showActivate && (
          <Tooltip title="Ctrl/Cmd + I" placement="top">
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={onActivate}
              sx={{ fontWeight: 600 }}
            >
              Ativar
            </Button>
          </Tooltip>
        )}
        {showHelp && onShowHelp && (
          <Tooltip title="F1 - Ajuda" placement="top">
            <IconButton onClick={onShowHelp} color="primary" size="large">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}; 