import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

import {
  Autocomplete,
  Divider,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, FormProvider } from "react-hook-form";
import { SelectField, useProductCreateForm } from "./useProductCreateForm";
import { SellingOptions } from "./sellingOptions";
import { getProductCategories, ProductCategory } from "../../model/productCategories";
import { Supplier, getSuppliers } from "model/suppliers";
import { getUnits, Unit } from "model/units";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';

export const ProductForm = () => {
  const { user } = useAuth();

  const { productID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  const formMethods = useProductCreateForm(productID);
  const { register, product, onFormSubmit, onFormUpdate, onDeactiveProduct, onActivateProduct, onDelete } = formMethods; 
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);
  const [units, setUnits] = useState<Array<Unit>>([]);

  useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user]);

  useEffect(() => {
    getSuppliers({ pageSize: 1000, userID: user.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [user]);

  useEffect(() => {
    getUnits(user.id).then(queryResult => setUnits(queryResult.docs.map(qr => qr.data() as Unit)))
  }, [user]);

  const handleSubmit = async () => {
    if (productID) {
      // Edit mode - always redirect to listing
      await onFormUpdate();
      navigate('/products');
    } else {
      // Create mode
      await onFormSubmit();
      if (isCreateMode) {
        // Reset form for new record
        formMethods.reset();
      } else {
        // Redirect to listing
        navigate('/products');
      }
    }
  };

  return (
    <FormProvider register={register} {...formMethods}>
      <Box sx={{ position: 'relative', pt: 8 }}>
        <FormActions
          showDelete={!!productID}
          showInactivate={!!product && product.status === 'active'}
          showActivate={!!product && product.status === 'inactive'}
          onDelete={() => onDelete(() => navigate('/products'))}
          onInactivate={onDeactiveProduct}
          onActivate={onActivateProduct}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <PageTitle>
              {productID ? "Editar Produto" : "Cadastro de Produto"}
            </PageTitle>
          </Grid>
        </Grid>
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
                      helperText={formMethods.formState.errors.title?.message}
                    />
                  );
                }}
                name="title"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: productCategory, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField
                  ) => {
                    props.onChange(value);
                  };

                  return (
                    <>
                      <Autocomplete
                        value={productCategory}
                        {...props}
                        id="tags-standard"
                        options={categories.map((c) => {
                          return {
                            label: c.name,
                            value: c.id,
                          } as SelectField;
                        })}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Categoria"
                            error={
                              !!formMethods.formState.errors.productCategory
                            }
                            helperText={formMethods.formState.errors.productCategory?.label?.message}
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onChange={handleChange}
                      />
                    </>
                  );
                }}
                name="productCategory"
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: description, onChange } }) => {
                  return (
                    <TextField
                      label="descrição"
                      variant="outlined"
                      style={{
                        width: "100%",
                      }}
                      value={description}
                      onChange={onChange}
                      error={!!formMethods.formState.errors.description}
                      helperText={formMethods.formState.errors.description?.message}
                    />
                  );
                }}
                name="description"
              />
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      {...props}
                      variant="outlined"
                      label="Comissão do vendedor"
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="sailsmanComission"
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
                      id="suppliers"
                      {...props}
                      options={suppliers.map(
                        (s) => ({ label: s.tradeName, value: s.id } as SelectField)
                      )}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Fornecedores"
                        />
                      )}
                      onChange={handleChange}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      value={value}
                      renderTags={(list) => {
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
            </FormControl>
          </Grid>
        </Grid>
        <Divider style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }} />
        <Typography variant="h6" gutterBottom>
          Unidade de compra
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: buyUnit, ...props } }) => {
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
                        id="tags-standard"
                        value={buyUnit}
                        options={units.map((c) => {
                          return {
                            label: c.name,
                            value: c.id,
                          } as SelectField;
                        })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Unidade"
                            error={!!formMethods.formState.errors.buyUnit}
                            helperText={formMethods.formState.errors.buyUnit?.label?.message}
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onChange={handleChange}
                      />
                    </>
                  );
                }}
                name="buyUnit"
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField {...field}
                      variant="outlined"
                      label="Estoque"

                      onFocus={(e) => e.target.select()}

                    />
                  );
                }}
                name="inventory"
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      variant="outlined"
                      label="Estoque Mínimo"
                      {...props}

                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="minInventory"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      variant="outlined"
                      label="Custo de compra"
                      {...props}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="cost"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      variant="outlined"
                      label="Peso (kg)"
                      {...props}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="weight"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Divider style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }} />
        <SellingOptions {...formMethods} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: "12px" }}>
          {productID ? (
            <Button onClick={handleSubmit} variant="contained">
              Atualizar Produto
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de produtos"
                createText="Criar mais produtos"
              />
              <Button onClick={handleSubmit} variant="contained">
                Criar produto
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </FormProvider>
  );
};
