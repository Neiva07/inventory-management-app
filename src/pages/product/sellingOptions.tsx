import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
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
  const handleRemovePrice = () => {
    const currentPrices = formMethods.getValues(`sellingOptions.${parentIndex}.prices`);
    const newPrices = currentPrices.filter((_, i) => i !== index);
    formMethods.setValue(`sellingOptions.${parentIndex}.prices`, newPrices);
  };

  // Watch for unit cost changes to recalculate profit percentages
  const unitCost = formMethods.watch(`sellingOptions.${parentIndex}.unitCost`) || 0;
  
  React.useEffect(() => {
    if (unitCost > 0) {
      const currentPrices = formMethods.getValues(`sellingOptions.${parentIndex}.prices`);
      const updatedPrices = currentPrices.map((price, i) => {
        if (i === index && price.profit !== undefined) {
          // Recalculate the price value based on the new unit cost and existing profit percentage
          const newValue = unitCost * ((price.profit / 100) + 1);
          return { ...price, value: newValue };
        }
        return price;
      });
      formMethods.setValue(`sellingOptions.${parentIndex}.prices`, updatedPrices);
    }
  }, [unitCost, parentIndex, index, formMethods]);

  return (
    <Grid
      spacing={2}
      container
      style={{
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
    
      <Grid item xs={3}>
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
      <Grid item xs={1}>
        <IconButton 
          color="error" 
          onClick={handleRemovePrice}
          size="small"
          style={{ marginTop: '8px' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
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

  const handleRemoveSellingOption = () => {
    const currentOptions = formMethods.getValues('sellingOptions');
    const newOptions = currentOptions.filter((_, i) => i !== index);
    formMethods.setValue('sellingOptions', newOptions);
  };

  const [units, setUnits] = React.useState<Array<Unit>>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    getUnits(user.id).then(qr => setUnits(qr.docs.map(d => d.data() as Unit)));
  }, [])

  // Watch the main inventory and cost values
  const mainInventory = formMethods.watch('inventory') || 0;
  const mainCost = formMethods.watch('cost') || 0;
  const buyUnit = formMethods.watch('buyUnit');
  const currentUnit = formMethods.watch(`sellingOptions.${index}.unit`);

  // Auto-set conversion rate to 1 when unit matches buy unit
  React.useEffect(() => {
    if (currentUnit?.value && buyUnit?.value && currentUnit.value === buyUnit.value) {
      formMethods.setValue(`sellingOptions.${index}.conversionRate`, 1);
    }
  }, [currentUnit?.value, buyUnit?.value, index, formMethods]);

  // Recalculate inventory and unit cost when main inventory or cost changes
  React.useEffect(() => {
    const conversionRate = formMethods.getValues(`sellingOptions.${index}.conversionRate`) || 0;
    if (conversionRate > 0) {
      const newInventory = mainInventory * conversionRate;
      const newUnitCost = mainCost / conversionRate;
      formMethods.setValue(`sellingOptions.${index}.inventory`, newInventory);
      formMethods.setValue(`sellingOptions.${index}.unitCost`, newUnitCost);
    }
  }, [mainInventory, mainCost, index, formMethods]);

  // Calculate inventory and unit cost when conversion rate changes
  const handleConversionRateChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const conversionRate = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
    
    // Calculate new inventory and unit cost
    const newInventory = mainInventory * conversionRate;
    const newUnitCost = conversionRate > 0 ? mainCost / conversionRate : 0;
    
    // Update the form values
    formMethods.setValue(`sellingOptions.${index}.inventory`, newInventory);
    formMethods.setValue(`sellingOptions.${index}.unitCost`, newUnitCost);
  };

  return (
    <Box>
      <Grid container spacing={2}>
       
        <Grid item xs={2}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: unit, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField
                ) => {
                  props.onChange(value);
                  
                  // Auto-set conversion rate to 1 if unit matches buy unit
                  if (value?.value && buyUnit?.value && value.value === buyUnit.value) {
                    formMethods.setValue(`sellingOptions.${index}.conversionRate`, 1);
                  }
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
                  <TextField 
                    {...props}
                    variant="outlined"
                    label="Conversão"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      props.onChange(e);
                      handleConversionRateChange(e);
                    }}
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
                    InputProps={{
                      readOnly: true,
                    }}
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
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                );
              }}
              name={`sellingOptions.${index}.unitCost`}
            />
          </FormControl>
        </Grid>
        <Grid item xs={1}>
          <IconButton 
            color="error" 
            onClick={handleRemoveSellingOption}
            size="medium"
            style={{ marginTop: '8px' }}
          >
            <DeleteIcon />
          </IconButton>
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

        <Grid item xs={6} style={{ marginBottom: '16px' }}>
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
