import React from 'react';
import { Box, Typography, SxProps } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';

interface TotalCostDisplayProps {
  value: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps;
}

export const TotalCostDisplay: React.FC<TotalCostDisplayProps> = ({
  value,
  label = 'Total da Nota',
  size = 'medium',
  sx = {},
}) => {
  const [animate, setAnimate] = React.useState(false);
  const prevValue = React.useRef(value);

  React.useEffect(() => {
    if (prevValue.current !== value) {
      setAnimate(true);
      prevValue.current = value;
      const timeout = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingY: 0.75,
          paddingX: 2.5,
          titleVariant: 'subtitle1' as const,
          valueVariant: 'h5' as const,
          iconSize: 22,
        };
      case 'large':
        return {
          paddingY: 2,
          paddingX: 5,
          titleVariant: 'h5' as const,
          valueVariant: 'h3' as const,
          iconSize: 36,
        };
      default: // medium
        return {
          paddingY: 1.5,
          paddingX: 4,
          titleVariant: 'subtitle1' as const,
          valueVariant: 'h4' as const,
          iconSize: 28,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        px: sizeStyles.paddingX,
        py: sizeStyles.paddingY,
        boxShadow: 'none',
        border: 'none',
        minWidth: 0,
        gap: 1.5,
        ...sx,
      }}
    >
      <AttachMoney sx={{ fontSize: sizeStyles.iconSize, color: 'success.main', mr: 0.5 }} />
      <Box sx={{ textAlign: 'left' }}>
        <Typography
          variant={sizeStyles.titleVariant}
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.2,
            letterSpacing: 0,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant={sizeStyles.valueVariant}
          sx={{
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: 0,
            transition: 'transform 0.3s cubic-bezier(.4,1.3,.5,1), color 0.3s',
            transform: animate ? 'scale(1.15)' : 'scale(1)',
            color: animate ? 'primary.main' : 'success.main',
          }}
        >
          {formatCurrency(value)}
        </Typography>
      </Box>
    </Box>
  );
}; 