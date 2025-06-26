import React from 'react';
import { FormControlLabel, Switch, Typography, Box } from '@mui/material';

interface ProductUpdateToggleProps {
  shouldUpdateProduct: boolean;
  onToggle: (shouldUpdateProduct: boolean) => void;
}

export const ProductUpdateToggle: React.FC<ProductUpdateToggleProps> = ({
  shouldUpdateProduct,
  onToggle,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'fit-content', mt: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={shouldUpdateProduct}
            onChange={(e) => onToggle(e.target.checked)}
            size="medium"
          />
        }
        label=""
      />
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {shouldUpdateProduct ? 'atualizar produto ao mudar o custo' : 'manter o produto original'}
      </Typography>
    </Box>
  );
}; 