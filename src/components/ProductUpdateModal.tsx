import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import { getProduct, Product } from 'model/products';
import { useAuth } from 'context/auth';
import { add, divide, multiply, subtract } from 'lib/math';
import { PaymentMethod } from 'model/paymentMethods';

interface ProductUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updatedProduct: Product) => void;
  productID: string;
  newUnitCost: number;
  variantUnitID: string;
}

interface EditableVariant {
  unit: {
    name: string;
    id: string;
  };
  conversionRate: number;
  oldUnitCost: number;
  newUnitCost: number;
  prices: Array<{
    paymentMethod: PaymentMethod;
    oldValue: number;
    newValue: number;
    profit: number;
    difference: number;
  }>;
}

export const ProductUpdateModal: React.FC<ProductUpdateModalProps> = ({
  open,
  onClose,
  onConfirm,
  productID,
  newUnitCost,
  variantUnitID,
}) => {
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [editableVariants, setEditableVariants] = useState<EditableVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && productID) {
      loadProduct();
    }
  }, [open, productID]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProduct(productID) as Product;
      setProduct(productData);

      const variant = productData.variants.find(v => v.unit.id === variantUnitID)
      
      const baseNewUnitCost = divide(newUnitCost, variant.conversionRate);
     
      // Prepare editable variants with old and new costs
      const variants = productData.variants.map(variant => {
        const isTargetVariant = variant.unit.id === variantUnitID;
        const updatedUnitCost = isTargetVariant ? newUnitCost : baseNewUnitCost * variant.conversionRate;
        
        return {
          unit: {
            name: variant.unit.name,
            id: variant.unit.id,
          },
          conversionRate: variant.conversionRate,
          oldUnitCost: variant.unitCost,
          newUnitCost: updatedUnitCost,
          prices: variant.prices.map(price => {
            const newValue = divide(multiply(updatedUnitCost, add(price.profit, 100)), 100);
            return {
              paymentMethod: price.paymentMethod,
              oldValue: price.value,
              newValue,
              profit: price.profit,
              difference: subtract(newValue, price.value),
            };
          }),
        };
      });

      setEditableVariants(variants);
    } catch (err) {
      setError('Erro ao carregar o produto');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantCostChange = (variantIndex: number, newCost: number) => {
    const updatedVariants = [...editableVariants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      newUnitCost: newCost,
      prices: updatedVariants[variantIndex].prices.map(price => {
        const newValue = divide(multiply(newCost, add(price.profit, 100)), 100);
        return {
          ...price,
          newValue,
          difference: subtract(newValue, price.oldValue),
        };
      }),
    };
    setEditableVariants(updatedVariants);
  };

  const handlePriceChange = (variantIndex: number, priceIndex: number, field: 'newValue' | 'profit', value: number) => {
    const updatedVariants = [...editableVariants];
    const variant = updatedVariants[variantIndex];
    const price = variant.prices[priceIndex];

    if (field === 'newValue') {
      // Calculate new profit based on new value
      const newProfit = divide(multiply(subtract(value, variant.newUnitCost), 100), variant.newUnitCost);
      price.newValue = value;
      price.profit = newProfit;
      price.difference = subtract(value, price.oldValue);
    } else {
      // Calculate new value based on new profit
      const newValue = divide(multiply(variant.newUnitCost, add(value, 100)), 100);
      price.profit = value;
      price.newValue = newValue;
      price.difference = subtract(newValue, price.oldValue);
    }

    setEditableVariants(updatedVariants);
  };

  const handleConfirm = () => {
    if (!product) return;

    // Create updated product with new costs and prices
    const updatedProduct: Product = {
      ...product,
      variants: product.variants.map((variant, index) => {
        const editableVariant = editableVariants[index];
        return {
          ...variant,
          unitCost: editableVariant.newUnitCost,
          prices: variant.prices.map((price, priceIndex) => ({
            ...price,
            value: editableVariant.prices[priceIndex].newValue,
            profit: editableVariant.prices[priceIndex].profit,
          })),
        };
      }),
    };

    onConfirm(updatedProduct);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>Carregando produto...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Atualizar Custos e Preços - {product?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O custo unitário foi alterado. Atualize os custos e preços conforme necessário.
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {editableVariants.map((variant, variantIndex) => (
            <Box key={variant.unit.id} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Variante: {variant.unit.name}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    label="Custo Unitário (Antigo)"
                    value={variant.oldUnitCost}
                    fullWidth
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Custo Unitário (Novo)"
                    value={variant.newUnitCost}
                    onChange={(e) => {
                      const value = !isNaN(Number(e.target.value)) ? Number(e.target.value) : 0;
                      handleVariantCostChange(variantIndex, value);
                    }}
                    fullWidth
                    variant="outlined"
                    onFocus={(e) => e.target.select()}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Taxa de Conversão"
                    value={variant.conversionRate}
                    fullWidth
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Preços:
              </Typography>
              
              {variant.prices.map((price, priceIndex) => (
                <Grid container spacing={2} key={price.paymentMethod.id} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <TextField
                      label="Método de Pagamento"
                      value={price.paymentMethod.label}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Preço (Antigo)"
                      value={price.oldValue}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Preço (Novo)"
                      value={price.newValue}
                      onChange={(e) => {
                        const value = !isNaN(Number(e.target.value)) ? Number(e.target.value) : 0;
                        handlePriceChange(variantIndex, priceIndex, 'newValue', value);
                      }}
                      fullWidth
                      variant="outlined"
                      onFocus={(e) => e.target.select()}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Lucro %"
                      value={price.profit}
                      onChange={(e) => {
                        const value = !isNaN(Number(e.target.value)) ? Number(e.target.value) : 0;
                        handlePriceChange(variantIndex, priceIndex, 'profit', value);
                      }}
                      fullWidth
                      variant="outlined"
                      onFocus={(e) => e.target.select()}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Diferença"
                      value={price.difference}
                      fullWidth
                      disabled
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-input': {
                          color: price.difference >= 0 ? 'success.main' : 'error.main',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              
              {variantIndex < editableVariants.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirmar Atualizações
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 