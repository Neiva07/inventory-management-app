import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FormActionsProps {
  onDelete?: () => void;
  onInactivate?: () => void;
  onActivate?: () => void;
  showDelete?: boolean;
  showInactivate?: boolean;
  showActivate?: boolean;
  absolute?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onDelete,
  onInactivate,
  onActivate,
  showDelete,
  showInactivate,
  showActivate,
  absolute = false,
}) => {
  if (!showDelete && !showInactivate && !showActivate) return null;
  return (
    <Box sx={absolute ? { position: 'absolute', top: 24, right: 24, zIndex: 10 } : { display: 'flex', alignItems: 'center' }}>
      <Stack direction="row" spacing={2}>
        {showDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            sx={{ fontWeight: 600 }}
          >
            Deletar
          </Button>
        )}
        {showInactivate && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<BlockIcon />}
            onClick={onInactivate}
            sx={{ fontWeight: 600 }}
          >
            Inativar
          </Button>
        )}
        {showActivate && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={onActivate}
            sx={{ fontWeight: 600 }}
          >
            Ativar
          </Button>
        )}
      </Stack>
    </Box>
  );
}; 