import { Autocomplete, Button, FormControl, Grid, TextField, Typography, Box } from '@mui/material';
import { useSupplierCreateForm } from './useSupplierCreateForm';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { states } from '../../model/region';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';

export const SupplierForm = () => {
  const { user } = useAuth();
  const { supplierID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { form, supplier, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, availableCities } = useSupplierCreateForm(supplierID);

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

  return (
    <FormProvider {...form}>
      <Box sx={{ position: 'relative', pt: 8 }}>
        <FormActions
          showDelete={!!supplierID}
          showInactivate={!!supplier && supplier.status === 'active'}
          showActivate={!!supplier && supplier.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactivate}
          onActivate={onActivate}
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
                      variant="outlined"
                      label="Endereço"
                      error={!!(form.formState.errors.address?.street)}
                      helperText={form.formState.errors.address?.street?.message}
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
                    <>
                      <Autocomplete
                        {...props}
                        id="regions"
                        options={states.map((s) => {
                          return {
                            label: s.name,
                            value: s.code,
                          } as SelectField;
                        })}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Estado"
                            error={!!(form.formState.errors.address?.region)}
                            helperText={form.formState.errors.address?.region?.message}
                          />
                        )}
                        value={region}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onChange={handleChange}
                      />
                    </>
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
                    <>
                      <Autocomplete
                        {...props}
                        id="cities"
                        options={availableCities || []}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Cidade"
                            error={!!(form.formState.errors.address?.city)}
                            helperText={form.formState.errors.address?.city?.message}
                          />
                        )}
                        value={city}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onChange={handleChange}
                        disabled={!availableCities || availableCities.length === 0}
                      />
                    </>
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
                    <Autocomplete
                      multiple
                      id="productCategories"
                      {...props}
                      options={categories.map(
                        (s) => ({ label: s.name, value: s.id } as SelectField)
                      )}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Categorias de Produto"
                          error={!!form.formState.errors.productCategories}
                          helperText={form.formState.errors.productCategories?.message}
                        />
                      )}
                      value={value}
                      onChange={handleChange}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      renderTags={(list) => {
                        const displayList = list
                          .map((item) => item.label)
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
                      variant="outlined"
                      label="Prazo de crédito"
                      error={!!form.formState.errors.daysToPay}
                      helperText={form.formState.errors.daysToPay?.message}
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
              <Button
                onClick={handleSubmit}
                variant="contained"
              >
                Editar Fornecedor
              </Button>

              :
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CreateModeToggle
                  isCreateMode={isCreateMode}
                  onToggle={setIsCreateMode}
                  listingText="Redirecionar para listagem de fornecedores"
                  createText="Criar mais fornecedores"
                />
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                >
                  Criar Fornecedor
                </Button>
              </Box>

          }
        </Box>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          resourceName="fornecedor"
        />
      </Box>
    </FormProvider>
  );
}
