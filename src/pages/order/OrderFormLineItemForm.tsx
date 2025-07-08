import { Box, Button, Grid, TextField } from "@mui/material";
import { Product, Variant } from "model/products";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { OrderFormDataInterface } from "./useOrderForm";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";


export const OrderFormLineItemForm = ({ 
  productSelectRef,
  variantRef,
  quantityRef,
  unitPriceRef,
  discountRef,
  commissionRef,
  products,
  // Form methods and business logic
  handleSelectProduct,
  handleSelectVariant,
  handleAddItem,
  // Dialog handlers
  showDuplicateDialog,
  handleDialogOverride,
  handleDialogClose,
  focusNextField,
  focusPreviousField,
}: { 
  productSelectRef: React.RefObject<HTMLDivElement>,
  variantRef: React.RefObject<HTMLDivElement>,
  quantityRef: React.RefObject<HTMLInputElement>,
  unitPriceRef: React.RefObject<HTMLInputElement>,
  discountRef: React.RefObject<HTMLInputElement>,
  commissionRef: React.RefObject<HTMLInputElement>,
  products: Array<Product>,
  // Form methods and business logic
  handleSelectProduct: (event: React.SyntheticEvent<Element, Event>, value: Product) => void,
  handleSelectVariant: (event: React.SyntheticEvent<Element, Event>, value: Variant) => void,
  handleAddItem: () => void,
  // Dialog handlers
  showDuplicateDialog: boolean,
  handleDialogOverride: () => void,
  handleDialogClose: () => void,
  focusNextField: (currentRef: React.RefObject<HTMLElement>) => void,
  focusPreviousField: (currentRef: React.RefObject<HTMLElement>) => void,
}) => {
  const formMethods = useFormContext<OrderFormDataInterface>();

  // Get pendingItem from form data
  const pendingItem = formMethods.watch('pendingItem');

  const isFormCompleted = formMethods.watch('pendingItem.isFormCompleted')
  
  return <Box>
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <Controller
          name="pendingItem.selectedProduct"
          control={formMethods.control}
          render={({ field }) => (
            <EnhancedAutocomplete
              {...field}
              id="product-select"
              options={products}
              getOptionLabel={(option: Product) => option.title}
              label="Produto"
              isOptionEqualToValue={(option: Product, value: Product) =>
                option.id === value.id
              }
              onChange={(event: React.SyntheticEvent<Element, Event>, value: Product) => {
                field.onChange(value);
                handleSelectProduct(event, value);
              }}
              ref={productSelectRef}
              onNextField={() => focusNextField(productSelectRef)}
              onPreviousField={() => focusPreviousField(productSelectRef)}
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <Controller
          name="pendingItem.variant"
          control={formMethods.control}
          render={({ field }) => (
            <EnhancedAutocomplete
              {...field}
              id="unit-select"
              options={pendingItem.selectedProduct?.variants ?? []}
              getOptionLabel={(option: Variant) => option.unit.name}
              label="Unidade"
              isOptionEqualToValue={(option: Variant, value: Variant) =>
                option.unit.id === value.unit.id
              }
              disabled={!pendingItem.selectedProduct}
              onChange={(event: React.SyntheticEvent<Element, Event>, value: Variant) => {
                field.onChange(value);
                handleSelectVariant(event, value);
              }}
              ref={variantRef}
              onNextField={() => focusNextField(variantRef)}
              onPreviousField={() => focusPreviousField(variantRef)}
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Estoque"
          fullWidth
          variant="outlined"
          disabled
          value={pendingItem.inventory}
        />
      </Grid>
      <Grid item xs={3}>
        <Controller
          name="pendingItem.quantity"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              ref={quantityRef}
              label="Quantidade"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Custo Unitário"
          fullWidth
          variant="outlined"
          disabled
          value={pendingItem.unitCost}
        />
      </Grid>
      <Grid item xs={2}>
        <Controller
          name="pendingItem.unitPrice"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              ref={unitPriceRef}
              label="Preço"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={2}>
        <Controller
          name="pendingItem.descount"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              ref={discountRef}
              label="Desconto (%)"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={2}>
        <Controller
          name="pendingItem.productComission"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              ref={commissionRef}
              label="Comissão do Vendedor (%)"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={2}>
        <Controller
          name="pendingItem.itemTotalCost"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Total do produto"
              fullWidth
              variant="outlined"
              disabled
              value={field.value}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={2}>
        <Button 
          onClick={handleAddItem} 
          fullWidth 
          style={{ height: "100%" }} 
          variant="outlined" 
          disabled={!isFormCompleted} 
        > 
          Adicionar Item 
        </Button>
      </Grid>
    </Grid>
    
    <DuplicateItemDialog
      open={showDuplicateDialog}
      onClose={handleDialogClose}
      onOverride={handleDialogOverride}
      productName={pendingItem.selectedProduct?.title ?? ''}
      unitName={pendingItem.variant?.unit.name ?? ''}
    />
    </Box>
}
