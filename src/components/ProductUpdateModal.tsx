import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from 'components/ui';
import { cn } from 'lib/utils';
import { getProduct, Product } from 'model/products';
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

type NumericFieldProps = {
  label: string;
  value: number | string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
};

const NumericField: React.FC<NumericFieldProps> = ({
  label,
  value,
  disabled = false,
  onChange,
  onFocus,
  className,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        disabled={disabled}
        className={className}
      />
    </div>
  );
};

export const ProductUpdateModal: React.FC<ProductUpdateModalProps> = ({
  open,
  onClose,
  onConfirm,
  productID,
  newUnitCost,
  variantUnitID,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [editableVariants, setEditableVariants] = useState<EditableVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && productID) {
      void loadProduct();
    }
  }, [open, productID]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = (await getProduct(productID)) as Product;
      setProduct(productData);

      const variant = productData.variants.find((v) => v.unit.id === variantUnitID);
      const baseNewUnitCost = divide(newUnitCost, variant.conversionRate);

      const variants = productData.variants.map((variantItem) => {
        const isTargetVariant = variantItem.unit.id === variantUnitID;
        const updatedUnitCost = isTargetVariant
          ? newUnitCost
          : baseNewUnitCost * variantItem.conversionRate;

        return {
          unit: {
            name: variantItem.unit.name,
            id: variantItem.unit.id,
          },
          conversionRate: variantItem.conversionRate,
          oldUnitCost: variantItem.unitCost,
          newUnitCost: updatedUnitCost,
          prices: variantItem.prices.map((price) => {
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
      prices: updatedVariants[variantIndex].prices.map((price) => {
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

  const handlePriceChange = (
    variantIndex: number,
    priceIndex: number,
    field: 'newValue' | 'profit',
    value: number
  ) => {
    const updatedVariants = [...editableVariants];
    const variant = updatedVariants[variantIndex];
    const price = variant.prices[priceIndex];

    if (field === 'newValue') {
      const newProfit = divide(multiply(subtract(value, variant.newUnitCost), 100), variant.newUnitCost);
      price.newValue = value;
      price.profit = newProfit;
      price.difference = subtract(value, price.oldValue);
    } else {
      const newValue = divide(multiply(variant.newUnitCost, add(value, 100)), 100);
      price.profit = value;
      price.newValue = newValue;
      price.difference = subtract(newValue, price.oldValue);
    }

    setEditableVariants(updatedVariants);
  };

  const handleConfirm = () => {
    if (!product) {
      return;
    }

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
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onClose();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <p>Carregando produto...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onClose();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-6xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Atualizar Custos e Precos - {product?.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            O custo unitario foi alterado. Atualize os custos e precos conforme necessario.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {editableVariants.map((variant, variantIndex) => (
            <div key={variant.unit.id} className="space-y-3">
              <h3 className="text-base font-semibold">
                Variante: {variant.unit.name}
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <NumericField
                    label="Custo Unitario (Antigo)"
                    value={variant.oldUnitCost}
                    disabled
                  />
                </div>

                <div className="md:col-span-4">
                  <NumericField
                    label="Custo Unitario (Novo)"
                    value={variant.newUnitCost}
                    onChange={(event) => {
                      const value = !isNaN(Number(event.target.value))
                        ? Number(event.target.value)
                        : 0;
                      handleVariantCostChange(variantIndex, value);
                    }}
                    onFocus={(event) => event.target.select()}
                  />
                </div>

                <div className="md:col-span-4">
                  <NumericField
                    label="Taxa de Conversao"
                    value={variant.conversionRate}
                    disabled
                  />
                </div>
              </div>

              <p className="text-sm font-semibold text-muted-foreground">Precos:</p>

              <div className="space-y-2">
                {variant.prices.map((price, priceIndex) => (
                  <div
                    key={price.paymentMethod.id}
                    className="grid grid-cols-1 gap-3 md:grid-cols-12"
                  >
                    <div className="md:col-span-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Metodo de Pagamento
                        </label>
                        <Input value={price.paymentMethod.label} disabled />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <NumericField
                        label="Preco (Antigo)"
                        value={price.oldValue}
                        disabled
                      />
                    </div>

                    <div className="md:col-span-2">
                      <NumericField
                        label="Preco (Novo)"
                        value={price.newValue}
                        onChange={(event) => {
                          const value = !isNaN(Number(event.target.value))
                            ? Number(event.target.value)
                            : 0;
                          handlePriceChange(variantIndex, priceIndex, 'newValue', value);
                        }}
                        onFocus={(event) => event.target.select()}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <NumericField
                        label="Lucro %"
                        value={price.profit}
                        onChange={(event) => {
                          const value = !isNaN(Number(event.target.value))
                            ? Number(event.target.value)
                            : 0;
                          handlePriceChange(variantIndex, priceIndex, 'profit', value);
                        }}
                        onFocus={(event) => event.target.select()}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <NumericField
                        label="Diferenca"
                        value={price.difference}
                        disabled
                        className={cn(
                          'font-medium disabled:opacity-100',
                          price.difference >= 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {variantIndex < editableVariants.length - 1 && (
                <div className="my-3 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar Atualizacoes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
