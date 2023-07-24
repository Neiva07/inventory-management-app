import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";

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
import { Supplier, getSuppliers } from "../../model/suppliers";
import { getUnits, Unit } from "../../model/units";
import { useParams } from "react-router-dom";

export const ProductForm = () => {

  const { productID } = useParams();
  const { register, onFormSubmit, onFormUpdate, onDeactiveProduct, onDelete, ...formMethods } = useProductCreateForm(productID);
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);
  const [units, setUnits] = useState<Array<Unit>>([]);

  useEffect(() => {
    getProductCategories().then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, []);

  useEffect(() => {
    getSuppliers({ pageSize: 1000 }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, []);

  useEffect(() => {
    getUnits().then(queryResult => setUnits(queryResult.docs.map(qr => qr.data() as Unit)))
  }, []);



  return (
    <FormProvider register={register} {...formMethods}>
      <>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {productID ? "Editar Produto" : "Cadastro de Produto"}
            </Typography>
          </Grid>
          {productID && <Grid item xs={4}>
            <Button fullWidth hidden={!productID} onClick={onDelete}
            > Deletar Produto </Button>
          </Grid>}
          {productID && <Grid item xs={4}>
            <Button fullWidth hidden={!productID} onClick={onDeactiveProduct}
            > Desativar Produto </Button>
          </Grid>}
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
                    e: React.SyntheticEvent<Element, Event>,
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
                    e: React.SyntheticEvent<Element, Event>,
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
      </>

      <Divider
        style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }}
      />
      <>
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
                    e: React.SyntheticEvent<Element, Event>,
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
                    <TextField {...field} variant="outlined" label="Estoque" />
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
                    />
                  );
                }}
                name="weight"
              />
            </FormControl>
          </Grid>
        </Grid>
      </>
      <Divider
        style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }}
      />
      <SellingOptions {...formMethods} />
      {
        productID ?
          <Button
            onClick={onFormUpdate}
            variant="contained"
            style={{ marginTop: "12px" }}
          > Atualizar Produto </Button>
          :
          <Button

            onClick={onFormSubmit}
            variant="contained"
            style={{ marginTop: "12px" }}
          >
            Criar produto
          </Button>
      }
    </FormProvider>
  );
};
