import { Product, Variant } from "model/products";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { OrderFormDataInterface } from "./useOrderForm";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";
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
  
  return <div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
      <div className="md:col-span-3">
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
      </div>
      <div className="md:col-span-3">
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
      </div>
      <div className="md:col-span-3">
        <Field label="Estoque">
          <Input
            disabled
            value={pendingItem.inventory ?? ""}
          />
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
      <div className="md:col-span-2">
        <Field label="Custo Unitário">
          <Input
            disabled
            value={pendingItem.unitCost ?? ""}
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Controller
          name="pendingItem.unitPrice"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Preço">
              <Input
                {...field}
                ref={unitPriceRef}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-2">
        <Controller
          name="pendingItem.descount"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Desconto (%)">
              <Input
                {...field}
                ref={discountRef}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-2">
        <Controller
          name="pendingItem.productComission"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Comissão do Vendedor (%)">
              <Input
                {...field}
                ref={commissionRef}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-2">
        <Controller
          name="pendingItem.itemTotalCost"
          control={formMethods.control}
          render={({ field }) => (
            <Field label="Total do produto">
              <Input
                {...field}
                disabled
                value={field.value ?? ""}
                onFocus={(e) => e.target.select()}
              />
            </Field>
          )}
        />
      </div>
      <div className="md:col-span-2">
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
