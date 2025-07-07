import { Box, Button, Grid, TextField } from "@mui/material";
import { Product, Variant } from "model/products";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";

export const InboundOrderFormLineItemForm = ({ 
  productSelectRef,
  products,
  // Form methods and business logic
  handleSelectProduct,
  handleSelectVariant,
  handleAddItem,
  // Dialog handlers
  showDuplicateDialog,
  handleDialogOverride,
  handleDialogClose,
}: { 
  productSelectRef: React.RefObject<HTMLDivElement>,
  products: Array<Product>,
  // Form methods and business logic
  handleSelectProduct: (event: React.SyntheticEvent<Element, Event>, value: Product) => void,
  handleSelectVariant: (event: React.SyntheticEvent<Element, Event>, value: Variant) => void,
  handleAddItem: () => void,
  // Dialog handlers
  showDuplicateDialog: boolean,
  handleDialogOverride: () => void,
  handleDialogClose: () => void,
}) => {
  const formMethods = useFormContext<InboundOrderFormDataInterface>();

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
              label="Quantidade"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <Controller
          name="pendingItem.unitCost"
          control={formMethods.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Custo Unitário"
              fullWidth
              variant="outlined"
              onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
            />
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Total do produto"
          fullWidth
          variant="outlined"
          disabled
          value={pendingItem.itemTotalCost}
        />
      </Grid>
      <Grid item xs={6}>
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