import { Autocomplete, FormControl, Grid, TextField } from "@mui/material"
import { Customer, getCustomers } from "model/customer";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { OrderFormDataInterface } from "./useOrderForm";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const statuses = [
  {
    label: "requisição",
    value: "request",
  },
  {
    label: "venda",
    value: "complete"
  }
]

export const paymentOptions = [
  {
    label: "Cartão de Crédito",
    value: "credit",
  },
  {
    label: "Cartão de Débito",
    value: "debit",
  },
  {
    label: "A vista",
    value: "cash",
  },
  {
    label: "pix",
    value: "pix"
  }
]

export const OrderFormHeader = () => {
  const [customers, setCustomers] = useState<Array<Customer>>([]);

  const formMethods = useFormContext<OrderFormDataInterface>()
  useEffect(() => {
    getCustomers({ pageSize: 1000 }).then(results => setCustomers(results[0].docs.map(qr => qr.data() as Customer)))
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: customer, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField
                ) => {
                  props.onChange(value);
                };

                return (
                  <>
                    <Autocomplete
                      value={customer}
                      {...props}
                      id="customer-select"
                      options={customers.map((c) => {
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
                          label="Cliente"
                          error={
                            !!formMethods.formState.errors.customer
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
              name="customer"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: status, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField
                ) => {
                  props.onChange(value);
                };

                return (
                  <>
                    <Autocomplete
                      value={status}
                      {...props}
                      id="status-select"
                      options={statuses}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Tipo de venda"
                          error={
                            !!formMethods.formState.errors.status
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
              name="status"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              control={formMethods.control}
              render={({ field: { value: paymentType, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField
                ) => {
                  props.onChange(value);
                };

                return (
                  <>
                    <Autocomplete
                      value={paymentType}
                      {...props}
                      id="payment-type-select"
                      options={paymentOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Tipo de pagamento"
                          error={
                            !!formMethods.formState.errors.paymentType
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
              name="paymentType"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              name="dueDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePicker {...field} label="Data de Vencimento" />
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              name="totalComission"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <TextField {...field} disabled label="Comissão Total (R$)" />
                );
              }}
            />
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              name="totalCost"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <TextField {...field} disabled label="Valor Total da nota" />
                );
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </>

  )

}
