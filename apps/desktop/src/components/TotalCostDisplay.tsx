import React from 'react';
import { DollarSign } from 'lucide-react';

type LegacySxProps = Record<string, string | number | undefined>;

interface TotalCostDisplayProps {
  value: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  sx?: LegacySxProps;
}

const SPACING_UNIT = 8;

function toSpacing(value: string | number | undefined, allowNegative: boolean) {
  if (typeof value === 'number') {
    if (!allowNegative && value < 0) return 0;
    return `${value * SPACING_UNIT}px`;
  }
  return value;
}

function sxToInlineStyle(sx: LegacySxProps | undefined): React.CSSProperties {
  if (!sx) return {};

  const style: React.CSSProperties = {};

  if (sx.ml !== undefined) style.marginLeft = toSpacing(sx.ml, true);
  if (sx.mr !== undefined) style.marginRight = toSpacing(sx.mr, true);
  if (sx.mt !== undefined) style.marginTop = toSpacing(sx.mt, true);
  if (sx.mb !== undefined) style.marginBottom = toSpacing(sx.mb, true);
  if (sx.pl !== undefined) style.paddingLeft = toSpacing(sx.pl, false);
  if (sx.pr !== undefined) style.paddingRight = toSpacing(sx.pr, false);
  if (sx.pt !== undefined) style.paddingTop = toSpacing(sx.pt, false);
  if (sx.pb !== undefined) style.paddingBottom = toSpacing(sx.pb, false);

  return style;
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
    <div
      className="flex min-w-0 items-center gap-1.5 rounded-md bg-card"
      style={{
        paddingInline: `${sizeStyles.paddingX * SPACING_UNIT}px`,
        paddingBlock: `${sizeStyles.paddingY * SPACING_UNIT}px`,
        ...sxToInlineStyle(sx),
      }}
    >
      <DollarSign
        className="shrink-0 text-emerald-600"
        style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}
        aria-hidden="true"
      />
      <div className="text-left">
        <div
          className="font-semibold leading-tight text-foreground"
          style={{
            fontSize:
              sizeStyles.titleVariant === 'h5'
                ? '1.25rem'
                : sizeStyles.titleVariant === 'subtitle1'
                  ? '1rem'
                  : '1rem',
          }}
        >
          {label}
        </div>
        <div
          className="font-bold leading-tight transition-[transform,color] duration-300"
          style={{
            fontSize:
              sizeStyles.valueVariant === 'h3'
                ? '1.875rem'
                : sizeStyles.valueVariant === 'h4'
                  ? '1.5rem'
                  : '1.25rem',
            transform: animate ? 'scale(1.15)' : 'scale(1)',
            color: animate ? 'var(--color-primary)' : '#059669',
          }}
        >
          {formatCurrency(value)}
        </div>
      </div>
    </div>
  );
}; 
