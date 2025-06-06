import { Autocomplete, Button, FormControl, Grid, TextField, Typography } from '@mui/material';
import { Controller, FormProvider } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import ReactInputMask from 'react-input-mask';
import { useParams } from 'react-router-dom';
import { useCustomerCreateForm } from './useCustomerForm';
import { states } from '../../model/region';

export const CustomerForm = () => {
  const { customerID } = useParams();

  const { register, customer, onFormSubmit, onFormUpdate, onDelete, onDeactivate, onActivate, ...formMethods } = useCustomerCreateForm(customerID);

  return (
    <FormProvider register={register} {...formMethods}>
      <>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {customerID ? "Editar  Cliente" : "Cadastro de  Cliente"}
            </Typography>
          </Grid>
          {customerID && <Grid item xs={4}>
            <Button fullWidth hidden={!customerID} onClick={onDelete}
            > Deletar  Cliente </Button>
          </Grid>}
          {customer && customer.status === 'active' && <Grid item xs={4}>
            <Button fullWidth hidden={!customerID} onClick={onDeactivate}
            > Desativar  Cliente </Button>
          </Grid>}
          {customer && customer.status === 'inactive' && (
            <Grid item xs={4}>
              <Button fullWidth hidden={!customerID} onClick={onActivate}
              > Ativar  Cliente</Button>
            </Grid>
          )}
        </Grid>


        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Nome"
                      error={!!formMethods.formState.errors.name}
                      helperText={formMethods.formState.errors.name?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.cpf}
                          helperText={formMethods.formState.errors.cpf?.message}
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
                control={formMethods.control}
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
                          error={!!formMethods.formState.errors.rg}
                          helperText={formMethods.formState.errors.rg?.message}
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
                            error={!!(formMethods.formState.errors.address?.region)}
                            helperText={formMethods.formState.errors.address?.region?.message}
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
                      {/* @ts-ignore */}
                      {() =>

                        <TextField
                          {...field}
                          variant="outlined"
                          label="Telefone"
                          error={!!formMethods.formState.errors.phone}
                          helperText={formMethods.formState.errors.phone?.message}
                        />
                      }
                    </ReactInputMask>
                  );
                }}
                name="phone"
              />
            </FormControl>
          </Grid>
        </Grid>
        {
          customerID ?
            <Button
              onClick={onFormUpdate}
              variant="contained"
              style={{ marginTop: "12px" }}
            >
              Editar Cliente
            </Button>

            :
            <Button
              onClick={onFormSubmit}
              variant="contained"
              style={{ marginTop: "12px" }}
            >
              Criar Cliente
            </Button>

        }
      </>
    </FormProvider>
  );
}
