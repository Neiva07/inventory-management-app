import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { MaskedInput } from 'components/ui/masked-input';
import { Separator } from 'components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from 'components/ui/tooltip';
import { useSupplierCreateForm, INITIAL_SUPPLIER_FORM_STATE } from './useSupplierCreateForm';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { states } from '../../model/region';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { useFormWrapper } from '../../hooks/forms/useFormWrapper';
import { useCreateModePreference } from '../../hooks/forms/useCreateModePreference';
import { KeyboardShortcutsHelp } from 'components/KeyboardFormShortcutsHelp';
import { Autocomplete } from 'components/ui/autocomplete';
import { modKey } from 'lib/platform';
import { DevFillButton } from '../../dev/useDevFill';
import { makeSupplierFormValues } from '../../dev/formValues';
import { pickSome, randInt } from '../../dev/factories';

export const SupplierForm = () => {
  const { user, organization } = useAuth();
  const { supplierID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useCreateModePreference('supplier');
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { form, supplier, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, availableCities } = useSupplierCreateForm(supplierID);

  // Field navigation refs
  const tradeNameRef = useRef<HTMLInputElement>(null);
  const legalNameRef = useRef<HTMLInputElement>(null);
  const entityIDRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactPhoneRef = useRef<HTMLInputElement>(null);
  const creditTermRef = useRef<HTMLInputElement>(null);
  const productCategoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProductCategories(user.id, "", organization?.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [organization?.id, user]);

  const handleSubmit = async () => {
    try {
      if (supplierID) {
        await onFormUpdate();
        navigate('/suppliers');
      } else {
        await onFormSubmit();
        if (isCreateMode) {
          setTimeout(() => {
            form.reset(INITIAL_SUPPLIER_FORM_STATE);
            tradeNameRef.current?.focus();
          }, 100);
        } else {
          navigate('/suppliers');
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
    onDelete(() => navigate('/suppliers'));
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar o formulário? Todas as alterações serão perdidas.')) {
      form.reset();
      if (!supplierID) {
        setTimeout(() => {
          tradeNameRef.current?.focus();
        }, 100);
      }
    }
  }

  const handleToggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  }

  const {
    showHelp,
    closeHelp,
    formRef,
    firstFieldRef,
    focusNextField,
    focusPreviousField,
  } = useFormWrapper({
    onSubmit: handleSubmit,
    onCancel: () => navigate('/suppliers'),
    onDelete: supplierID ? handleDelete : undefined,
    onInactivate: supplier && supplier.status === 'active' ? onDeactivate : undefined,
    onActivate: supplier && supplier.status === 'inactive' ? onActivate : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    onBack: () => navigate(-1),
    autoFocusField: 'tradeName',
    helpTitle: 'Atalhos do Teclado - Fornecedor',
    fieldRefs: [tradeNameRef, legalNameRef, entityIDRef, streetRef, postalCodeRef, regionRef, cityRef, companyPhoneRef, contactPhoneRef, contactNameRef, productCategoriesRef, creditTermRef],
  });

  return (
    <FormProvider {...form}>
      <form className="relative pt-16" ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <FormActions
          showDelete={!!supplierID}
          showInactivate={!!supplier && supplier.status === 'active'}
          showActivate={!!supplier && supplier.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactivate}
          onActivate={onActivate}
          onBack={() => navigate(-1)}
          onShowHelp={() => {
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
          absolute
        />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <PageTitle>
                {supplierID ? "Editar Fornecedor" : "Cadastro de Fornecedor"}
              </PageTitle>
              {supplier?.publicId && (
                <PublicIdDisplay publicId={supplier.publicId} recordType="fornecedor" />
              )}
              {!supplierID && (
                <DevFillButton
                  onFill={() => {
                    const pickedCategories = categories.length
                      ? pickSome(categories, randInt(1, Math.min(3, categories.length))).map(
                          (c) => ({ label: c.name, value: c.id } as SelectField),
                        )
                      : [];
                    form.reset({
                      ...makeSupplierFormValues(),
                      productCategories: pickedCategories,
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Controller
              control={form.control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nome Fantasia</FieldLabel>
                  <Input {...field} ref={tradeNameRef} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="tradeName"
            />
          </div>
          <div className="col-span-12">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Razão Social</FieldLabel>
                  <Input {...field} ref={legalNameRef} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="legalName"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>CNPJ</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={entityIDRef}
                    mask="99.999.999/9999-99"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="entityID"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Endereço</FieldLabel>
                  <Input
                    {...field}
                    ref={streetRef}
                    aria-invalid={fieldState.invalid}
                    onFocus={(e) => e.target.select()}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="address.street"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>CEP</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={postalCodeRef}
                    mask="99.999-999"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="address.postalCode"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field: { value: region, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField | null
                ) => {
                  props.onChange(value);
                };

                return (
                  <Autocomplete
                    {...props}
                    id="regions"
                    options={states.map((s) => ({
                      label: s.name,
                      value: s.code,
                    } as SelectField))}
                    getOptionLabel={(option: SelectField) => option.label}
                    label="Estado"
                    error={!!(form.formState.errors.address?.region)}
                    helperText={form.formState.errors.address?.region?.message}
                    value={region}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value.value
                    }
                    onChange={handleChange}
                    onNextField={() => focusNextField(regionRef)}
                    onPreviousField={() => focusPreviousField(regionRef)}
                    ref={regionRef}
                  />
                );
              }}
              name="address.region"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field: { value: city, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField | null
                ) => {
                  props.onChange(value);
                };

                return (
                  <Autocomplete
                    {...props}
                    id="cities"
                    options={availableCities || []}
                    getOptionLabel={(option: SelectField) => option.label}
                    label="Cidade"
                    error={!!(form.formState.errors.address?.city)}
                    helperText={form.formState.errors.address?.city?.message}
                    value={city}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value.value
                    }
                    onChange={handleChange}
                    disabled={!availableCities || availableCities.length === 0}
                    onNextField={() => focusNextField(cityRef)}
                    onPreviousField={() => focusPreviousField(cityRef)}
                    ref={cityRef}
                  />
                );
              }}
              name="address.city"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Telefone da Empresa</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={companyPhoneRef}
                    mask="(99) 9999-99999"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="companyPhone"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Telefone do Contato</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={contactPhoneRef}
                    mask="(99) 9999-99999"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="contactPhone"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nome do contato</FieldLabel>
                  <Input {...field} ref={contactNameRef} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="contactName"
            />
          </div>
          <div className="col-span-8">
            <Controller
              control={form.control}
              render={({ field: { value, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField[]
                ) => {
                  props.onChange(value);
                };
                return (
                  <Autocomplete
                    multiple
                    id="productCategories"
                    {...props}
                    options={categories.map(
                      (s) => ({ label: s.name, value: s.id } as SelectField)
                    )}
                    getOptionLabel={(option: SelectField) => option.label}
                    label="Categorias de Produto"
                    error={!!form.formState.errors.productCategories}
                    helperText={form.formState.errors.productCategories?.message}
                    value={value}
                    onChange={handleChange}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                      option.value === value.value
                    }
                    onNextField={() => focusNextField(productCategoriesRef)}
                    onPreviousField={() => focusPreviousField(productCategoriesRef)}
                    ref={productCategoriesRef}
                  />
                );
              }}
              name="productCategories"
            />
          </div>
          <div className="col-span-4">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Prazo de crédito</FieldLabel>
                  <Input
                    {...field}
                    ref={creditTermRef}
                    aria-invalid={fieldState.invalid}
                    onFocus={(e) => e.target.select()}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="daysToPay"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          {!supplierID && (
            <div className="mr-auto">
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de fornecedores"
                createText="Criar mais fornecedores"
              />
            </div>
          )}
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSubmit} className="gap-2">
                    {supplierID ? 'Editar Fornecedor' : 'Criar Fornecedor'}
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
          resourceName="fornecedor"
        />

        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={closeHelp}
          title="Atalhos do Teclado - Fornecedor"
          showVariants={false}
        />
      </form>
    </FormProvider>
  );
};
