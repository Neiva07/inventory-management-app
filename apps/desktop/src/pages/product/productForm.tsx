import React, { useEffect, useState, useRef, useCallback } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { SelectField, useProductCreateForm, INITIAL_PRODUCT_FORM_STATE } from "./useProductCreateForm";
import { Variants } from "./Variants";
import { getProductCategories, ProductCategory } from "../../model/productCategories";
import { Supplier, getSuppliers } from "model/suppliers";
import { getUnits, Unit } from "model/units";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { useFormWrapper } from 'hooks/forms/useFormWrapper';
import { Autocomplete } from 'components/ui/autocomplete';
import { KeyboardShortcutsHelp } from 'components/KeyboardFormShortcutsHelp';
import { DevFillButton } from '../../dev/useDevFill';
import { makeProductFormValuesFull } from '../../dev/formValues';
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { Input } from 'components/ui/input';
import { Separator } from 'components/ui/separator';
import { modKey } from 'lib/platform';
import { Button } from 'components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip';

interface ProductFormProps {
  productID?: string;
  onProductUpdated?: () => void;
  isModal?: boolean;
}

export const ProductForm = ({ productID: propProductID, onProductUpdated, isModal = false }: ProductFormProps = {}) => {
  const { user, organization } = useAuth();

  const { productID: paramProductID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Use prop productID if provided (for modal), otherwise use param (for page)
  const productID = propProductID ?? paramProductID;
  
  const formMethods = useProductCreateForm(productID);
  const { register, product, onFormSubmit, onFormUpdate, onDeactiveProduct, onActivateProduct, onDelete } = formMethods; 
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);
  const [units, setUnits] = useState<Array<Unit>>([]);

  useEffect(() => {
    getProductCategories(user.id, "", organization?.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [organization?.id, user]);

  useEffect(() => {
    getSuppliers({ pageSize: 1000, userID: user.id, organizationId: organization?.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [organization?.id, user]);

  useEffect(() => {
    getUnits(user.id, "", organization?.id).then(queryResult => setUnits(queryResult.docs.map(qr => qr.data() as Unit)))
  }, [organization?.id, user]);

  const handleSubmit = async () => {
    try {
      if (productID) {
        // Edit mode
        await onFormUpdate();
        if (isModal) {
          onProductUpdated?.();
        } else {
          navigate('/products');
        }
      } else {
        // Create mode
        await onFormSubmit();
        if (isModal) {
          onProductUpdated?.();
        } else if (isCreateMode) {
          // Reset form for new record
          setTimeout(() => {
            formMethods.reset(INITIAL_PRODUCT_FORM_STATE);
            titleRef.current?.focus();
          }, 100);
        } else {
          // Redirect to listing
          navigate('/products');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    onDelete(() => {
      if (isModal) {
        onProductUpdated?.();
      } else {
        navigate('/products');
      }
    });
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  const handleCancel = () => {
    if (isModal) {
      onProductUpdated?.();
    } else {
      navigate('/products');
    }
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar o formulário? Todas as alterações serão perdidas.')) {
      formMethods.reset();
    }
  }

  const handleAddVariant = () => {
    // This will be handled by the Variants component
    // We'll pass this function down to trigger variant addition
  }

  const handleAddPrice = () => {
    // This will be handled by the Variants component
    // We'll pass this function down to trigger price addition
  }

  const handleToggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  }

  // Field navigation refs
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const commissionRef = useRef<HTMLInputElement>(null);
  const suppliersRef = useRef<HTMLDivElement>(null);
  const baseUnitRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLInputElement>(null);
  const minInventoryRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);


  // Centralized ref registry for dynamic variants using array for better performance
  const [variantRefs, setVariantRefs] = useState<React.RefObject<HTMLElement>[]>([]);

  const registerVariantRef = useCallback((ref: React.RefObject<HTMLElement>) => {
    setVariantRefs(prev => [...prev, ref]);
  }, []);

  const unregisterVariantRef = useCallback((ref: React.RefObject<HTMLElement>) => {
    setVariantRefs(prev => prev.filter(r => r !== ref));
  }, []);

  // Create a memoized version of allFieldRefs that updates when variantRefs changes
  const allFieldRefs = React.useMemo(() => {
    const baseRefs = [titleRef, categoryRef, descriptionRef, commissionRef, suppliersRef, baseUnitRef, inventoryRef, minInventoryRef, costRef, weightRef];
    return [...baseRefs, ...variantRefs];
  }, [variantRefs]);

  // Form wrapper with keyboard shortcuts and field navigation
  const {
    showHelp,
    closeHelp,
    formRef,
    firstFieldRef,
    focusNextField,
    focusPreviousField,
  } = useFormWrapper({
    onSubmit: handleSubmit,
    onCancel: () => navigate('/products'),
    onDelete: productID ? handleDelete : undefined,
    onInactivate: product && product.status === 'active' ? onDeactiveProduct : undefined,
    onActivate: product && product.status === 'inactive' ? onActivateProduct : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    onBack: () => navigate(-1),
    autoFocusField: 'title',
    helpTitle: 'Atalhos do Teclado - Produto',
    fieldRefs: allFieldRefs,
  });

  return (
    <FormProvider register={register} {...formMethods}>
      <form ref={formRef} className="relative pt-16" onSubmit={(e) => e.preventDefault()}>
        <FormActions
          showDelete={!!productID}
          showInactivate={!!product && product.status === 'active'}
          showActivate={!!product && product.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactiveProduct}
          onActivate={onActivateProduct}
          onBack={() => navigate(-1)}
          onShowHelp={() => {
            // Trigger F1 key programmatically to show help
            const f1Event = new KeyboardEvent('keydown', {
              key: 'F1',
              code: 'F1',
              keyCode: 112,
              which: 112,
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(f1Event);
          }}
          absolute={true}
        />
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12">
            <div className="flex items-center gap-4 flex-wrap mb-6">
              <PageTitle>
                {productID ? "Editar Produto" : "Cadastro de Produto"}
              </PageTitle>
              {product?.publicId && (
                <PublicIdDisplay publicId={product.publicId} recordType="produto" />
              )}
              {!productID && (
                <DevFillButton
                  onFill={() =>
                    formMethods.reset(
                      makeProductFormValuesFull({ categories, suppliers, units }),
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Informações gerais</p>
        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
          <div className="col-span-7">
            <Controller
              control={formMethods.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nome do produto</FieldLabel>
                    <Input
                      {...field}
                      ref={titleRef}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="title"
            />
          </div>
          <div className="col-span-5">
            <Controller
              control={formMethods.control}
              render={({ field: { value: productCategory, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField | null
                ) => {
                  props.onChange(value);
                };

                return (
                  <Autocomplete
                    value={productCategory}
                    {...props}
                    id="product-category"
                    options={categories.map((c) => {
                      return {
                        label: c.name,
                        value: c.id,
                      } as SelectField;
                    })}
                    getOptionLabel={(option) => (option as SelectField)?.label ?? ''}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value?.value
                    }
                    onChange={handleChange}
                    label="Categoria"
                    error={!!formMethods.formState.errors.productCategory}
                    helperText={formMethods.formState.errors.productCategory?.label?.message}
                    onNextField={() => focusNextField(categoryRef)}
                    onPreviousField={() => focusPreviousField(categoryRef)}
                    ref={categoryRef}
                  />
                );
              }}
              name="productCategory"
            />
          </div>

          <div className="col-span-12">
            <Controller
              control={formMethods.control}
              render={({ field: { value: description, onChange }, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Descrição</FieldLabel>
                    <Input
                      ref={descriptionRef}
                      className="w-full"
                      value={description}
                      onChange={onChange}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="description"
            />
          </div>

          <div className="col-span-3">
            <Controller
              control={formMethods.control}
              render={({ field: { ...props }, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Comissão do vendedor</FieldLabel>
                    <div className="relative">
                      <Input
                        {...props}
                        ref={commissionRef}
                        aria-invalid={fieldState.invalid}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="sailsmanComission"
            />
          </div>
          <div className="col-span-9">
            <Controller
              control={formMethods.control}
              render={({ field: { value: suppliersSelected, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField[]
                ) => {
                  props.onChange(value);
                };
                return (
                  <Autocomplete
                    multiple
                    id="suppliers"
                    {...props}
                    options={suppliers.map(
                      (s) => ({ label: s.tradeName, value: s.id } as SelectField)
                    )}
                    getOptionLabel={(option: SelectField) => option.label}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value?.value
                    }
                    value={suppliersSelected}
                    label="Fornecedores"
                    onNextField={() => focusNextField(suppliersRef)}
                    onPreviousField={() => focusPreviousField(suppliersRef)}
                    onChange={handleChange}
                    ref={suppliersRef}
                    renderTags={(list: SelectField[]) => {
                      const displayList = list
                        .map((item) => item.label)
                        .join(", ");

                      return <span>{displayList}</span>;
                    }}
                  />
                );
              }}
              name="suppliers"
            />
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Unidade base</p>
        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
          <div className="col-span-4">
            <Controller
              control={formMethods.control}
              render={({ field: { value: baseUnit, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField | null
                ) => {
                  props.onChange(value);
                };
                return (
                  <Autocomplete
                    {...props}
                    id="base-unit"
                    value={baseUnit}
                    options={units.map((c) => {
                      return {
                        label: c.description ? `${c.name} (${c.description})` : c.name,
                        value: c.id,
                      } as SelectField;
                    })}
                    getOptionLabel={(option: SelectField) => option.label}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value?.value
                    }
                    onChange={handleChange}
                    label="Unidade base"
                    error={!!formMethods.formState.errors.baseUnit}
                    helperText={formMethods.formState.errors.baseUnit?.label?.message}
                    onNextField={() => focusNextField(baseUnitRef)}
                    onPreviousField={() => focusPreviousField(baseUnitRef)}
                    ref={baseUnitRef}
                  />
                );
              }}
              name="baseUnit"
            />
          </div>
          <div className="col-span-4">
            <Controller
              control={formMethods.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Estoque (unidades base)</FieldLabel>
                    <Input
                      {...field}
                      ref={inventoryRef}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="inventory"
            />
          </div>
          <div className="col-span-4">
            <Controller
              control={formMethods.control}
              render={({ field: { ...props }, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Estoque Mínimo</FieldLabel>
                    <Input
                      {...props}
                      ref={minInventoryRef}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="minInventory"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={formMethods.control}
              render={({ field: { ...props }, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Custo de compra</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">R$</span>
                      <Input
                        {...props}
                        ref={costRef}
                        className="pl-9"
                        aria-invalid={fieldState.invalid}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="cost"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={formMethods.control}
              render={({ field: { ...props }, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Peso</FieldLabel>
                    <div className="relative">
                      <Input
                        {...props}
                        ref={weightRef}
                        aria-invalid={fieldState.invalid}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">kg</span>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
              name="weight"
            />
          </div>
        </div>
        <Separator className="my-4" />
        <Variants 
          {...formMethods}
          focusNextField={focusNextField}
          focusPreviousField={focusPreviousField}
          registerVariantRef={registerVariantRef}
          unregisterVariantRef={unregisterVariantRef}
        />
        <div className="flex items-center gap-4 mt-5">
          {!productID && (
            <div className="mr-auto">
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de produtos"
                createText="Criar mais produtos"
              />
            </div>
          )}
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSubmit} className="gap-2">
                    {productID ? "Atualizar Produto" : "Criar produto"}
                    <kbd className="text-[10px] opacity-50 bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono">{modKey}+Enter</kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{modKey} + Enter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          resourceName="produto"
        />
        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={closeHelp}
          title="Atalhos do Teclado - Produto"
          showVariants={true}
        />
      </form>
    </FormProvider>
  );
};
