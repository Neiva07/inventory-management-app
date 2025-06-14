import { Autocomplete, Button, FormControl, Grid, TextField, Typography, Box } from '@mui/material';
import { useSupplierCreateForm } from './useSupplierCreateForm';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { states } from '../../model/region';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';

export const SupplierForm = () => {
  const { user } = useAuth();
  const { supplierID } = useParams();

  const { register, supplier, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, ...formMethods } = useSupplierCreateForm(supplierID);
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);

  useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, []);

  return (
    <FormProvider register={register} {...formMethods}>
      <Box sx={{ position: 'relative', pt: 8 }}>
        <FormActions
          showDelete={!!supplierID}
          showInactivate={!!supplier && supplier.status === 'active'}
          showActivate={!!supplier && supplier.status === 'inactive'}
          onDelete={onDelete}
          onInactivate={onDeactivate}
          onActivate={onActivate}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PageTitle>
              {supplierID ? "Editar Fornecedor" : "Cadastro de Fornecedor"}
            </PageTitle>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                //FIX: https://github.com/react-hook-form/react-hook-form/issues/9126#issuecomment-1370843816 related to ref
                render={({ field: { ref, ...field } }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Nome Fantasia"
                      error={!!formMethods.formState.errors.tradeName}
                      helperText={formMethods.formState.errors.tradeName?.message}
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
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Razão Social"
                      error={!!formMethods.formState.errors.legalName}
                      helperText={formMethods.formState.errors.legalName?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.entityID}
                          helperText={formMethods.formState.errors.entityID?.message}
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
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Endereço"
                      error={!!(formMethods.formState.errors.address?.street)}
                      helperText={formMethods.formState.errors.address?.street?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.address?.postalCode}
                          helperText={formMethods.formState.errors.address?.postalCode?.message}
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
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Cidade"
                      error={!!(formMethods.formState.errors.address?.city)}
                      helperText={formMethods.formState.errors.address?.city?.message}
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
                control={formMethods.control}
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
                            error={!!(formMethods.formState.errors.address?.region)}
                            helperText={formMethods.formState.errors.address?.region?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.companyPhone}
                          helperText={formMethods.formState.errors.companyPhone?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.contactPhone}
                          helperText={formMethods.formState.errors.contactPhone?.message}
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
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Nome do contato"
                      error={!!formMethods.formState.errors.contactName}
                      helperText={formMethods.formState.errors.contactName?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.productCategories}
                          helperText={formMethods.formState.errors.productCategories?.message}
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
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Prazo de crédito"
                      error={!!formMethods.formState.errors.daysToPay}
                      helperText={formMethods.formState.errors.daysToPay?.message}
                    />
                  );
                }}
                name="daysToPay"
              />
            </FormControl>
          </Grid>
        </Grid>
        {
          supplierID ?
            <Button
              onClick={onFormUpdate}
              variant="contained"
              style={{ marginTop: "12px" }}
            >
              Editar Fornecedor
            </Button>

            :
            <Button
              onClick={onFormSubmit}
              variant="contained"
              style={{ marginTop: "12px" }}
            >
              Criar Fornecedor
            </Button>

        }
      </Box>
    </FormProvider>
  );
}
