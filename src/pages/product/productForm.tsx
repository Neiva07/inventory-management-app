import React from "react";
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

const suppliers = [
  {
    id: "1",
    name: "Ambev",
  },
  {
    id: "2",
    name: "Atacadão",
  },
  {
    id: "3",
    name: "Assaí",
  },
  {
    id: "4",
    name: "Heineken",
  },
];

const units = [
  {
    id: "1",
    name: "pacotes",
  },
  {
    id: "2",
    name: "lata",
  },
  {
    id: "3",
    name: "kilo",
  },
];

const categories = [
  {
    id: "1",
    name: "cerveja",
  },
  {
    id: "2",
    name: "carnes",
  },
  {
    id: "3",
    name: "fraldas",
  },
];

export const ProdutForm = () => {
  const { register, onFormSubmit, ...formMethods } = useProductCreateForm();

  console.log(formMethods.formState.errors);
  return (
    <FormProvider register={register} {...formMethods}>
      <form onSubmit={onFormSubmit}>
        <>
          <Typography variant="h5" gutterBottom>
            Cadastro do produto
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <Controller
                  control={formMethods.control}
                  render={({ field: { value: title, onChange, onBlur } }) => {
                    console.log(title);
                    return (
                      <TextField
                        variant="outlined"
                        label="Nome do produto"
                        value={title}
                        onChange={onChange}
                        onBlur={onBlur}
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
                          {...props}
                          id="tags-standard"
                          // @ts-ignore
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
                    console.log(props);
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
                          (s) => ({ label: s.name, value: s.id } as SelectField)
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
                        renderTags={(list) => {
                          let displayList = list
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
                  render={({ field: { value: inventory, ...props } }) => {
                    return (
                      <TextField
                        variant="outlined"
                        label="Estoque"
                        value={inventory}
                        {...props}
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
        {/* <Divider
        style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }}
      /> */}
        <></>

        <Button
          onClick={onFormSubmit}
          variant="contained"
          style={{ marginTop: "12px" }}
        >
          Criar produto
        </Button>
      </form>

      {/* 
        <ol>
          {products.map((d) => (
            <li>{d.name}</li>
          ))}
        </ol> */}
    </FormProvider>
  );
};
