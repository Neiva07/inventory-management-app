import React from 'react';
import { Percent } from 'lucide-react';

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
    <div
      className="flex min-w-0 items-center gap-1 rounded-md bg-card"
      style={{
        paddingInline: `${sizeStyles.paddingX * 8}px`,
        paddingBlock: `${sizeStyles.paddingY * 8}px`,
      }}
    >
      <Percent
        className="shrink-0 text-amber-600"
        style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}
        aria-hidden="true"
      />
      <div className="text-left">
        <div
          className="font-semibold leading-tight text-muted-foreground"
          style={{
            fontSize: sizeStyles.titleVariant === 'subtitle2' ? '0.875rem' : '1rem',
          }}
        >
          {label}
        </div>
        <div
          className="font-bold leading-tight transition-[transform,color] duration-300"
          style={{
            fontSize: sizeStyles.valueVariant === 'h6' ? '1.25rem' : '1rem',
            transform: animate ? 'scale(1.15)' : 'scale(1)',
            color: animate ? 'var(--color-primary)' : '#d97706',
          }}
        >
          {formatCurrency(value)}
        </div>
      </div>
    </div>
  );
}; 
