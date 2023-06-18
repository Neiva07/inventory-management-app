import React, { ChangeEvent, useEffect, useState } from "react";
import Button from "@mui/material/Button";

import {
  Autocomplete,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Control, Controller, FormProvider } from "react-hook-form";
import {
  ProductFormDataInterface,
  SelectField,
  useProductCreateForm,
} from "./useProductCreateForm";

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
  const [productCategory, setProductCategory] = useState<SelectField>();

  return (
    <FormProvider register={register} {...formMethods}>
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

        <Grid item xs={8}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: productCategory, ...props } }) => {
                return (
                  <>
                    <Autocomplete
                      id="tags-standard"
                      // @ts-ignore
                      options={categories.map((c) => {
                        return {
                          label: c.name,
                          value: c.id,
                        } as SelectField;
                      })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Categoria"
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      // renderTags={(list) => {
                      //   let displayList = list
                      //     .map((item) => item.label)
                      //     .join(", ");

                      //   // Render <span> elements instead of <Chip> components.
                      //   return <span>{displayList}</span>;
                      // }}
                      {...props}
                    />
                  </>
                );
              }}
              name="productCategory"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: buyUnit, ...props } }) => {
                return (
                  <>
                    <Autocomplete
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
                      {...props}
                    />
                  </>
                );
              }}
              name="buyUnit"
            />
          </FormControl>
        </Grid>
        <Divider variant="middle" />

        {/* <div>
          <div>
            <TextField
              variant="outlined"
              value={inventory}
              label="Estoque"
              onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
                setInventory
              )}
            />
          </div>
          <div>
            <TextField
              variant="outlined"
              value={minInventory}
              label="Estoque Mínimo"
              onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
                setMinInventory
              )}
            />
          </div>
          <div>
            <TextField
              variant="outlined"
              value={cost}
              label="Custo $"
              onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
                setCost
              )}
            />
          </div>
        </div>
        <div>
          <TextField
            variant="outlined"
            value={weight}
            label="Peso"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setWeight
            )}
          />
        </div>

        <div>
          <TextField
            variant="outlined"
            value={conversionWholesomeUnit}
            label="Conversão"
            onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(
              setWholesomeUnit
            )}
          />
        </div>

        <div>
          <TextField
            variant="outlined"
            value={sellWholesomeInventory}
            label="Estoque"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setWholesomeInventory
            )}
          />
        </div>
        <div>
          <TextField
            variant="outlined"
            value={sellCost}
            label="Custo $"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setSellCost
            )}
          />
        </div>

        <div>
          <TextField
            variant="outlined"
            value={retailProfit}
            label="Lucro %"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setRetailProfit
            )}
          />
        </div>
        <div>
          <TextField
            variant="outlined"
            value={retailPrice}
            label="Preço R$"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setRetailPrice
            )}
          />
        </div>

        <div>
          <TextField
            variant="outlined"
            value={creditProfit}
            label="Lucro"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setCreditProfit
            )}
          />
        </div>
        <div>
          <TextField
            variant="outlined"
            value={sellCost}
            label="Custo $"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setSellCost
            )}
          />
        </div>
        <Button onClick={} variant="contained">
          Criar produto
        </Button> */}
        {/* 
        <ol>
          {products.map((d) => (
            <li>{d.name}</li>
          ))}
        </ol> */}
      </Grid>
    </FormProvider>
  );
};
