import { Autocomplete, Button, FormControl, Grid, TextField, Typography, Box } from '@mui/material';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerCreateForm } from './useCustomerForm';
import { states } from '../../model/region';
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { useState } from 'react';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';

export const CustomerForm = () => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { form, customer, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, availableCities } = useCustomerCreateForm(customerID);

  const handleSubmit = async () => {
    if (customerID) {
      // Edit mode - always redirect to listing
      await onFormUpdate();
      navigate('/customers');
    } else {
      // Create mode
      await onFormSubmit();
      if (isCreateMode) {
        // Reset form for new record
        form.reset();
      } else {
        // Redirect to listing
        navigate('/customers');
      }
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

  return (
    <FormProvider {...form}>
      <Box sx={{ position: 'relative', pt: 8 }}>
        <FormActions
          showDelete={!!customerID}
          showInactivate={!!customer && customer.status === 'active'}
          showActivate={!!customer && customer.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactivate}
          onActivate={onActivate}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <PageTitle>
                {customerID ? "Editar Cliente" : "Cadastro de Cliente"}
              </PageTitle>
              {customer?.publicId && (
                <PublicIdDisplay publicId={customer.publicId} />
              )}
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={form.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Nome"
                      error={!!form.formState.errors.name}
                      helperText={form.formState.errors.name?.message}
                    />
                  );
                }}
                name="name"
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
                      mask={"999.999.999-99"}
                    >
                      {/* @ts-ignore */}
                      {() =>
                        <TextField
                          {...field}
                          variant="outlined"
                          label="CPF"
                          error={!!form.formState.errors.cpf}
                          helperText={form.formState.errors.cpf?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="cpf"
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
                      mask={"999999-9"}
                    >
                      {/* @ts-ignore */}
                      {() =>
                        <TextField
                          {...field}
                          variant="outlined"
                          label="RG(Identidade)"
                          error={!!form.formState.errors.rg}
                          helperText={form.formState.errors.rg?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="rg"
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
                    e: React.SyntheticEvent<Element, Event>,
                    value: SelectField
                  ) => {
                    props.onChange(value);
                  };

                  return (
                    <>
                      <Autocomplete
                        {...props}
                        id="regions"
                        options={states.map((c) => {
                          return {
                            label: c.name,
                            value: c.code,
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
                        isOptionEqualToValue={(option, value) => {
                          console.log(option, value)
                          return option.value === value.value
                        }
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
                    e: React.SyntheticEvent<Element, Event>,
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
                      {/* @ts-ignore */}
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
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: "12px" }}>
          {
            customerID ?
              <Button
                onClick={handleSubmit}
                variant="contained"
              >
                Editar Cliente
              </Button>

              :
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CreateModeToggle
                  isCreateMode={isCreateMode}
                  onToggle={setIsCreateMode}
                  listingText="Redirecionar para listagem de clientes"
                  createText="Criar mais clientes"
                />
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                >
                  Criar Cliente
                </Button>
              </Box>

          }
        </Box>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          resourceName="cliente"
        />
      </Box>
    </FormProvider>
  );
}
