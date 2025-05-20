import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  DEFAULT_PRICE,
  DEFAULT_SELLING_OPTION_VALUE,
  ProductFormDataInterface,
  SelectField,
  FormSellingOption,
} from "./useProductCreateForm";
import { Price } from "../../model/products";
import { getUnits, Unit } from "model/units";
import { useAuth } from "context/auth";


type SellingOptionProps = {
  sellingOption: FormSellingOption;
  formMethods: UseFormReturn<ProductFormDataInterface>;
  index: number;
};

type PriceProps = {
  price: Price;
  formMethods: UseFormReturn<ProductFormDataInterface>;
  index: number;
  parentIndex: number;
};

const Price = ({ formMethods, index, parentIndex }: PriceProps) => {
  return (
    <Grid
      spacing={2}
      container
      style={{
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      <Grid item xs={4}>
        <FormControl fullWidth>
          <Controller
            control={formMethods.control}
            render={({ field: { value: title, ...props } }) => {
              return (
                <TextField
                  {...props}
                  variant="standard"
                  label="Titulo do preço"
                  value={title}
                />
              );
            }}
            name={`sellingOptions.${parentIndex}.prices.${index}.title`}
          />
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <Controller
            control={formMethods.control}
            render={({ field: { value: profit, ...props } }) => {
              const currentCost = formMethods.watch(`sellingOptions.${parentIndex}.unitCost`) || 0
              const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
                props.onChange(event)

                const value = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0
                const finalValue = currentCost * ((value / 100) + 1)
                formMethods.setValue(`sellingOptions.${parentIndex}.prices.${index}.value`, finalValue)
              }
              return (
                <TextField
                  {...props}
                  variant="outlined"
                  label="Lucro %"
                  value={profit}
                  onChange={onChange}
                  onFocus={(e) => e.target.select()}
                />
              );
            }}
            name={`sellingOptions.${parentIndex}.prices.${index}.profit`}
          />
        </FormControl>
      </Grid>

      <Grid item xs={4}>
        <FormControl fullWidth>
          <Controller
            control={formMethods.control}
            render={({ field: props }) => {
              const currentCost = formMethods.watch(`sellingOptions.${parentIndex}.unitCost`) || 0
              const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
                props.onChange(event)

                const value = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0
                const finalValue = (value - currentCost) * 100 / currentCost
                formMethods.setValue(`sellingOptions.${parentIndex}.prices.${index}.profit`, finalValue)
              }

              return (
                <TextField
                  {...props}
                  onChange={onChange}
                  variant="outlined"
                  label="Preço"
                  onFocus={(e) => e.target.select()}
                />
              );
            }}
            name={`sellingOptions.${parentIndex}.prices.${index}.value`}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

const SellingOption = ({ formMethods, index }: SellingOptionProps) => {
  const handleAddPrice = () => {
    formMethods.setValue(`sellingOptions.${index}.prices`, [
      ...formMethods.getValues(`sellingOptions.${index}.prices`),
      DEFAULT_PRICE,
    ]);
  };


  const [units, setUnits] = React.useState<Array<Unit>>([]);
  const { user } = useAuth();


  React.useEffect(() => {
    getUnits(user.id).then(qr => setUnits(qr.docs.map(d => d.data() as Unit)));
  }, [])

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: unit, ...props } }) => {
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
                      id={`sellingOptions.${index}.unit`}
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
                      value={unit}
                    />
                  </>
                );
              }}
              name={`sellingOptions.${index}.unit`}
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { ...props } }) => {
                return (
                  <TextField {...props}
                    variant="outlined"
                    label="Conversão"
                    onFocus={(e) => e.target.select()}
                  />
                );
              }}
              name={`sellingOptions.${index}.conversionRate`}
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: inventory, ...props } }) => {
                return (
                  <TextField
                    {...props}
                    variant="outlined"
                    label="Estoque"
                    value={inventory}
                    onFocus={(e) => e.target.select()}
                  />
                );
              }}
              name={`sellingOptions.${index}.inventory`}
            />
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { ...props } }) => {


                return (
                  <TextField
                    {...props}
                    variant="outlined"
                    label="Custo da unidade"

                    onFocus={(e) => e.target.select()}
                  />
                );
              }}
              name={`sellingOptions.${index}.unitCost`}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={formMethods.control}
            name={`sellingOptions.${index}.prices`}
            render={(formControlProps) => {
              return (
                <div
                  style={{
                    marginTop: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {formControlProps.field.value.map((price, i) => {
                    return (
                      <>
                        <Price
                          key={i}
                          index={i}
                          price={price}
                          formMethods={formMethods}
                          parentIndex={index}
                        />
                      </>
                    );
                  })}
                </div>
              );
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <Button onClick={handleAddPrice}>+ preço sugerido</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export const SellingOptions = (
  formMethods: UseFormReturn<ProductFormDataInterface>
) => {
  const handleAddNewSellingOption = () => {
    formMethods.setValue("sellingOptions", [
      ...formMethods.getValues("sellingOptions"),
      DEFAULT_SELLING_OPTION_VALUE,
    ]);
  };

  return (
    <>
      <Box>
        <Typography variant="h6" gutterBottom>
          Unidade de Venda
        </Typography>
        <Controller
          control={formMethods.control}
          name="sellingOptions"
          render={(formControlProps) => {
            return (
              <>
                {formControlProps.field.value?.map((so, index) => {
                  return (
                    <SellingOption
                      key={index}
                      index={index}
                      sellingOption={so}
                      formMethods={formMethods}
                    />
                  );
                })}
              </>
            );
          }}
        />
        <Button onClick={handleAddNewSellingOption}>+ unidade de venda</Button>
      </Box>
    </>
  );
};
