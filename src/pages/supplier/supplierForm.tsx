import { Autocomplete, Button, FormControl, Grid, TextField, Typography } from '@mui/material';
import { useSupplierCreateForm } from './useSupplierCreateForm';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { states } from '../../model/region';
import { useAuth } from 'context/auth';

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
      <>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {supplierID ? "Editar Fornecedor" : "Cadastro de Fornecedor"}
            </Typography>
          </Grid>
          {supplierID && <Grid item xs={4}>
            <Button fullWidth hidden={!supplierID} onClick={onDelete}
            > Deletar Fornecedor </Button>
          </Grid>}
          {supplier && supplier.status === 'active' && <Grid item xs={4}>
            <Button fullWidth hidden={!supplierID} onClick={onDeactivate}
            > Desativar Fornecedor </Button>
          </Grid>}
          {supplier && supplier.status === 'inactive' && (
            <Grid item xs={4}>
              <Button fullWidth hidden={!supplierID} onClick={onActivate}
              > Ativar Fornecedor</Button>
            </Grid>
          )}
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
      </>
    </FormProvider>
  );
}
