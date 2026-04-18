import { Product, Variant } from "model/products";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";
import { Autocomplete } from "components/ui/autocomplete";
import { Button, Input } from "components/ui";
import { cn } from "lib/utils";

const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1", className)}>
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
  </div>
);

export const InboundOrderFormLineItemForm = ({ 
  productSelectRef,
  variantRef,
  quantityRef,
  unitCostRef,
  products,
  focusNextField,
  focusPreviousField,
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
  variantRef: React.RefObject<HTMLDivElement>,
  quantityRef: React.RefObject<HTMLInputElement>,
  unitCostRef: React.RefObject<HTMLInputElement>,
  products: Array<Product>,
  focusNextField: (currentRef: React.RefObject<HTMLElement>) => void,
  focusPreviousField: (currentRef: React.RefObject<HTMLElement>) => void,
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
  
  return <div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
      <div className="md:col-span-3">
        <Controller
          name="pendingItem.selectedProduct"
          control={formMethods.control}
          render={({ field }) => (
            <Autocomplete
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
              onNextField={() => focusNextField(productSelectRef)}
              onPreviousField={() => focusPreviousField(productSelectRef)}
              ref={productSelectRef}
            />
          )}
        />
      </div>
      <div className="md:col-span-3">
        <Controller
          name="pendingItem.variant"
          control={formMethods.control}
          render={({ field }) => (
            <Autocomplete
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
              onNextField={() => focusNextField(variantRef)}
              onPreviousField={() => focusPreviousField(variantRef)}
              ref={variantRef}
            />
          )}
        />
      </div>
      <div className="md:col-span-3">
        <Field label="Estoque">
          <Input disabled value={pendingItem.inventory ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-3">
        <Controller
          name="pendingItem.quantity"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Quantidade">
              <Input
                {...field}
                ref={quantityRef}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-3">
        <Controller
          name="pendingItem.unitCost"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Custo Unitário">
              <Input
                {...field}
                ref={unitCostRef}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-3">
        <Field label="Total do produto">
          <Input disabled value={pendingItem.itemTotalCost ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-6">
        <label className="block text-sm font-medium text-transparent">Ação</label>
        <Button 
          onClick={handleAddItem} 
          className="h-9 w-full md:h-[calc(100%-24px)]"
          variant="outline" 
          disabled={!isFormCompleted} 
        > 
          Adicionar Item 
        </Button>
      </div>
    </div>
    
    <DuplicateItemDialog
      open={showDuplicateDialog}
      onClose={handleDialogClose}
      onOverride={handleDialogOverride}
      productName={pendingItem.selectedProduct?.title ?? ''}
      unitName={pendingItem.variant?.unit.name ?? ''}
    />
    </div>
} 
