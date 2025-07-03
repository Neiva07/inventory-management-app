import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

interface PublicIdDisplayProps {
  publicId?: string;
  variant?: 'form' | 'list';
  showLabel?: boolean;
}

const PublicIdContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.light,
    transform: 'translateY(-1px)',
    boxShadow: 'none',
  },
}));

const PublicIdText = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  userSelect: 'none',
  letterSpacing: '0.5px',
}));

const PublicIdLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

export const PublicIdDisplay: React.FC<PublicIdDisplayProps> = ({ 
  publicId, 
  variant = 'form',
  showLabel = true 
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCopy = async () => {
    if (publicId) {
      try {
        await navigator.clipboard.writeText(publicId);
        setShowCopiedMessage(true);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setShowCopiedMessage(false);
  };

  if (!publicId) {
    return null;
  }

  return (
    <>
      <PublicIdContainer onClick={handleCopy}>
        {showLabel && (
          <PublicIdLabel variant="body2">
            ID:
          </PublicIdLabel>
        )}
        <PublicIdText variant="body2">
          {publicId}
        </PublicIdText>
        <Tooltip title="Copiar ID" arrow>
          <IconButton size="small" sx={{ padding: 0.5, color: 'primary.main' }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </PublicIdContainer>
      
      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="ID copiado para a área de transferência"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}; 