import React from 'react';
import { Box, Typography } from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';

interface TotalComissionDisplayProps {
  value: number;
  label?: string;
  size?: 'small' | 'medium';
}

export const TotalComissionDisplay: React.FC<TotalComissionDisplayProps> = ({
  value,
  label = 'Comissão Total',
  size = 'small',
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
      case 'medium':
        return {
          paddingY: 1,
          paddingX: 2.5,
          titleVariant: 'subtitle2' as const,
          valueVariant: 'h6' as const,
          iconSize: 22,
        };
      default: // small
        return {
          paddingY: 0.5,
          paddingX: 2,
          titleVariant: 'subtitle2' as const,
          valueVariant: 'body1' as const,
          iconSize: 18,
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
        gap: 1,
      }}
    >
      <PercentIcon sx={{ fontSize: sizeStyles.iconSize, color: 'warning.main', mr: 0.5 }} />
      <Box sx={{ textAlign: 'left' }}>
        <Typography
          variant={sizeStyles.titleVariant}
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
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
            color: animate ? 'primary.main' : 'warning.main',
          }}
        >
          {formatCurrency(value)}
        </Typography>
      </Box>
    </Box>
  );
}; 