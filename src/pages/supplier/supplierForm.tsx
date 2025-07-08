import { Button, FormControl, Grid, TextField, Typography, Box, Tooltip } from '@mui/material';
import { useSupplierCreateForm } from './useSupplierCreateForm';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
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
import { KeyboardShortcutsHelp } from 'components/KeyboardFormShortcutsHelp';
import { EnhancedAutocomplete } from '../../components/EnhancedAutocomplete';

export const SupplierForm = () => {
  const { user } = useAuth();
  const { supplierID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
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
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user]);

  const handleSubmit = async () => {
    if (supplierID) {
      // Edit mode - always redirect to listing
      await onFormUpdate();
      navigate('/suppliers');
    } else {
      // Create mode
      await onFormSubmit();
      if (isCreateMode) {
        // Reset form for new record
        form.reset();
      } else {
        // Redirect to listing
        navigate('/suppliers');
      }
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
        // Auto-focus first field after reset for new suppliers
        setTimeout(() => {
          tradeNameRef.current?.focus();
        }, 100);
      }
    }
  }

  const handleToggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  }

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
    onCancel: () => navigate('/suppliers'),
    onDelete: supplierID ? handleDelete : undefined,
    onInactivate: supplier && supplier.status === 'active' ? onDeactivate : undefined,
    onActivate: supplier && supplier.status === 'inactive' ? onActivate : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    autoFocusField: 'tradeName',
    helpTitle: 'Atalhos do Teclado - Fornecedor',
    fieldRefs: [tradeNameRef, legalNameRef, entityIDRef, streetRef, postalCodeRef, regionRef, cityRef, companyPhoneRef, contactNameRef, contactPhoneRef, creditTermRef, productCategoriesRef],
  });

  return (
    <FormProvider {...form}>
      <Box sx={{ position: 'relative', pt: 8 }} component="form" ref={formRef}>
        <FormActions
          showDelete={!!supplierID}
          showInactivate={!!supplier && supplier.status === 'active'}
          showActivate={!!supplier && supplier.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactivate}
          onActivate={onActivate}
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
          absolute
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <PageTitle>
                {supplierID ? "Editar Fornecedor" : "Cadastro de Fornecedor"}
              </PageTitle>
              {supplier?.publicId && (
                <PublicIdDisplay 
                  publicId={supplier.publicId} 
                />
              )}
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                //FIX: https://github.com/react-hook-form/react-hook-form/issues/9126#issuecomment-1370843816 related to ref
                render={({ field: { ref, ...field } }) => {
                  return (
                    <TextField
                      {...field}
                      ref={tradeNameRef}
                      variant="outlined"
                      label="Nome Fantasia"
                      error={!!form.formState.errors.tradeName}
                      helperText={form.formState.errors.tradeName?.message}
                    />
                  );
                }}
                name="tradeName"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      ref={legalNameRef}
                      variant="outlined"
                      label="Razão Social"
                      error={!!form.formState.errors.legalName}
                      helperText={form.formState.errors.legalName?.message}
                    />
                  );
                }}
                name="legalName"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    // @ts-ignore
                    <ReactInputMask
                      {...field}
                      mask={"99.999.999/9999-99"}
                    >
                      {() =>
                        <TextField
                          {...field}
                          ref={entityIDRef}
                          variant="outlined"
                          label="CNPJ"
                          error={!!form.formState.errors.entityID}
                          helperText={form.formState.errors.entityID?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="entityID"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      ref={streetRef}
                      variant="outlined"
                      label="Endereço"
                      error={!!(form.formState.errors.address?.street)}
                      helperText={form.formState.errors.address?.street?.message}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="address.street"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    // @ts-ignore
                    <ReactInputMask
                      {...field}
                      mask={"99.999-999"}
                    >
                      {/* @ts-ignore */}
                      {() =>
                        <TextField
                          {...field}
                          ref={postalCodeRef}
                          variant="outlined"
                          label="CEP"
                          error={!!form.formState.errors.address?.postalCode}
                          helperText={form.formState.errors.address?.postalCode?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="address.postalCode"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field: { value: region, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField
                  ) => {
                    props.onChange(value);
                  };

                  return (
                    <EnhancedAutocomplete
                      {...props}
                      id="regions"
                      options={states.map((s) => {
                        return {
                          label: s.name,
                          value: s.code,
                        } as SelectField;
                      })}
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
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field: { value: city, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField
                  ) => {
                    props.onChange(value);
                  };

                  return (
                    <EnhancedAutocomplete
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
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                //FIX: https://github.com/react-hook-form/react-hook-form/issues/9126#issuecomment-1370843816 related to ref
                render={({ field: { ref, ...field } }) => {

                  // const mask = field.value?.length < 10 ? "(99) 9999-9999" : "(99) 99999-9999"
                  return (
                    // @ts-ignore
                    <ReactInputMask
                      {...field}
                      mask={"(99) 9999-99999"}
                    >
                      {() =>

                        <TextField
                          {...field}
                          ref={companyPhoneRef}
                          variant="outlined"
                          label="Telefone da Empresa"
                          error={!!form.formState.errors.companyPhone}
                          helperText={form.formState.errors.companyPhone?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="companyPhone"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                //FIX: https://github.com/react-hook-form/react-hook-form/issues/9126#issuecomment-1370843816 related to ref
                render={({ field: { ref, ...field } }) => {

                  return (
                    // @ts-ignore
                    <ReactInputMask
                      {...field}
                      mask={"(99) 9999-99999"}
                    >
                      {/* @ts-ignore */}
                      {() =>

                        <TextField
                          {...field}
                          ref={contactPhoneRef}
                          variant="outlined"
                          label="Telefone do Contato"
                          error={!!form.formState.errors.contactPhone}
                          helperText={form.formState.errors.contactPhone?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="contactPhone"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      ref={contactNameRef}
                      variant="outlined"
                      label="Nome do contato"
                      error={!!form.formState.errors.contactName}
                      helperText={form.formState.errors.contactName?.message}
                    />
                  );
                }}
                name="contactName"
              />
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
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
                    <EnhancedAutocomplete
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
                      renderTags={(list: SelectField[]) => {
                        const displayList = list
                          .map((item: SelectField) => item.label)
                          .join(", ");

                        return <span>{displayList}</span>;
                      }}
                    />
                  );
                }}
                name="productCategories"
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      ref={creditTermRef}
                      variant="outlined"
                      label="Prazo de crédito"
                      error={!!form.formState.errors.daysToPay}
                      helperText={form.formState.errors.daysToPay?.message}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="daysToPay"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: "12px" }}>
          {
            supplierID ?
              <Tooltip title="Ctrl/Cmd + Enter" placement="top">
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                >
                  Editar Fornecedor
                </Button>
              </Tooltip>

              :
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CreateModeToggle
                  isCreateMode={isCreateMode}
                  onToggle={setIsCreateMode}
                  listingText="Redirecionar para listagem de fornecedores"
                  createText="Criar mais fornecedores"
                />
                <Tooltip title="Ctrl/Cmd + Enter" placement="top">
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                  >
                    Criar Fornecedor
                  </Button>
                </Tooltip>
              </Box>

          }
        </Box>
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
      </Box>
    </FormProvider>
  );
};
