import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { MaskedInput } from 'components/ui/masked-input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from 'components/ui/tooltip';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerCreateForm, INITIAL_CUSTOMER_VALUES } from './useCustomerForm';
import { states } from '../../model/region';
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { useState, useRef } from 'react';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { useFormWrapper } from '../../hooks/forms/useFormWrapper';
import { KeyboardShortcutsHelp } from 'components/KeyboardFormShortcutsHelp';
import { Autocomplete } from 'components/ui/autocomplete';
import { useAuth } from 'context/auth';
import { modKey } from 'lib/platform';
import { DevFillButton } from '../../dev/useDevFill';
import { makeCustomerFormValues } from '../../dev/formValues';

export const CustomerForm = () => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { form, customer, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, availableCities } = useCustomerCreateForm(customerID);

  const nameRef = useRef<HTMLInputElement>(null);
  const cpfRef = useRef<HTMLInputElement>(null);
  const rgRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactPhoneRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    try {
      if (customerID) {
        await onFormUpdate();
        navigate('/customers');
      } else {
        await onFormSubmit();
        if (isCreateMode) {
          setTimeout(() => {
            form.reset(INITIAL_CUSTOMER_VALUES);
            nameRef.current?.focus();
          }, 100);
        } else {
          navigate('/customers');
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
    onDelete(() => navigate('/customers'));
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar o formulário? Todas as alterações serão perdidas.')) {
      form.reset();
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
    onCancel: () => navigate('/customers'),
    onDelete: customerID ? handleDelete : undefined,
    onInactivate: customer && customer.status === 'active' ? onDeactivate : undefined,
    onActivate: customer && customer.status === 'inactive' ? onActivate : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    onBack: () => navigate(-1),
    autoFocusField: 'name',
    helpTitle: 'Atalhos do Teclado - Cliente',
    fieldRefs: [nameRef, cpfRef, rgRef, streetRef, postalCodeRef, regionRef, cityRef, companyPhoneRef, contactNameRef, contactPhoneRef],
  });

  return (
    <FormProvider {...form}>
      <form className="relative pt-16" ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <FormActions
          showDelete={!!customerID}
          showInactivate={!!customer && customer.status === 'active'}
          showActivate={!!customer && customer.status === 'inactive'}
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
                {customerID ? "Editar Cliente" : "Cadastro de Cliente"}
              </PageTitle>
              {customer?.publicId && (
                <PublicIdDisplay publicId={customer.publicId} recordType="cliente" />
              )}
              {!customerID && (
                <DevFillButton onFill={() => form.reset(makeCustomerFormValues())} />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nome</FieldLabel>
                  <Input
                    {...field}
                    ref={nameRef}
                    aria-invalid={fieldState.invalid}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="name"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>CPF</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={cpfRef}
                    mask="999.999.999-99"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="cpf"
            />
          </div>
          <div className="col-span-6">
            <Controller
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>RG(Identidade)</FieldLabel>
                  <MaskedInput
                    {...field}
                    ref={rgRef}
                    mask="999999-9"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="rg"
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
                    options={states.map((c) => ({
                      label: c.name,
                      value: c.code,
                    } as SelectField))}
                    getOptionLabel={(option: SelectField) => option.label}
                    label="Estado"
                    error={!!(form.formState.errors.address?.region)}
                    helperText={form.formState.errors.address?.region?.message}
                    value={region}
                    isOptionEqualToValue={(option: SelectField, value: SelectField) => option.value === value.value}
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
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nome do contato</FieldLabel>
                  <Input
                    {...field}
                    ref={contactNameRef}
                    aria-invalid={fieldState.invalid}
                    onFocus={(e) => e.target.select()}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
              name="contactName"
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
        </div>
        <div className="mt-3 flex items-center gap-4">
          {!customerID && (
            <div className="mr-auto">
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de clientes"
                createText="Criar mais clientes"
              />
            </div>
          )}
          <div className="ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSubmit} className="gap-2">
                    {customerID ? 'Editar Cliente' : 'Criar Cliente'}
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
          resourceName="cliente"
        />

        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={closeHelp}
          title="Atalhos do Teclado - Cliente"
          showVariants={false}
        />
      </form>
    </FormProvider>
  );
};
