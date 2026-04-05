import React from 'react';
import { Switch } from 'components/ui';

interface ProductUpdateToggleProps {
  shouldUpdateProduct: boolean;
  onToggle: (shouldUpdateProduct: boolean) => void;
}

export const ProductUpdateToggle: React.FC<ProductUpdateToggleProps> = ({
  shouldUpdateProduct,
  onToggle,
}) => {
  return (
    <div className="mt-4 flex min-w-fit items-center gap-2">
      <Switch
        checked={shouldUpdateProduct}
        onCheckedChange={onToggle}
        aria-label="Alternar atualização do produto"
      />
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {shouldUpdateProduct ? 'atualizar produto ao mudar o custo' : 'manter o produto original'}
      </span>
    </div>
  );
}; 
