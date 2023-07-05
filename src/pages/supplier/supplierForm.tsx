import { Grid, Typography } from '@mui/material';
import { useSupplierCreateForm } from './useSupplierCreateForm';
import { FormProvider } from 'react-hook-form';

export const SupplierForm = () => {
  const { register, onFormSubmit, ...formMethods } = useSupplierCreateForm();
  return (
    <FormProvider register={register} {...formMethods}>
      <>
        <Typography variant="h5" gutterBottom>
          Cadastro do produto
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      label="Nome do produto"
                      error={!!formMethods.formState.errors.title}
                    />
                  );
                }}
                name="title"
              />
            </FormControl>
          </Grid>
        </Grid>
      </>
    </FormProvider>
  );
};
