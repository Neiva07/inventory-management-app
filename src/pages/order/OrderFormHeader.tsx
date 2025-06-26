import { Autocomplete, FormControl, Grid, TextField, Box } from "@mui/material"
import { Customer, getCustomers } from "model/customer";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { OrderFormDataInterface } from "./useOrderForm";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { useParams } from 'react-router-dom';
import { FormActions } from 'components/FormActions';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { Order } from 'model/orders';
import { statuses } from './useOrderForm';
import { paymentMethods } from "model";
import { TotalCostDisplay } from 'components/TotalCostDisplay';
import { TotalComissionDisplay } from 'components/TotalComissionDisplay';

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

export const OrderFormHeader = ({ onDelete, order }: { onDelete?: () => void; order?: Order }) => {
  const { user } = useAuth();
  const { orderID } = useParams();
  const [customers, setCustomers] = useState<Array<Customer>>([]);

  const formMethods = useFormContext<OrderFormDataInterface>()
  const totalCost = formMethods.watch('totalCost');
  const totalComission = formMethods.watch('totalComission');
  useEffect(() => {
    getCustomers({ pageSize: 1000, userID: user.id }).then(results => setCustomers(results[0].docs.map(qr => qr.data() as Customer)))
  }, []);

  return (
    <Box sx={{ pt: 8 }}>
      {/* Header Row: Title, PublicId, TotalCost, Delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <PageTitle>
            {orderID ? "Editar Nota Fiscal" : "Cadastro de Nota Fiscal"}
          </PageTitle>
          {order?.publicId && (
            <PublicIdDisplay publicId={order.publicId} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 2 }}>
          <TotalComissionDisplay
            value={totalComission || 0}
            label="Comissão Total"
            size="small"
          />
          <TotalCostDisplay
            value={totalCost || 0}
            label="Total da Nota"
            size="large"
            sx={{ ml: -1, pl: -2 }}
          />
          <FormActions
            showDelete={!!orderID}
            onDelete={onDelete}
          />
        </Box>
      </Box>
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
                          error={!!formMethods.formState.errors.customer}
                          helperText={formMethods.formState.errors.customer?.label?.message}
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
                          error={!!formMethods.formState.errors.status}
                          helperText={formMethods.formState.errors.status?.message}
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
                      id="payment-method-select"
                      options={paymentMethods.map(pm => ({
                        label: pm.label,
                        value: pm.id,
                      }))}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Método de pagamento"
                          error={!!formMethods.formState.errors.paymentMethod}
                          helperText={formMethods.formState.errors.paymentMethod?.message}
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
              name="paymentMethod"
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              name="orderDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePicker 
                    {...field} 
                    label="Data da Venda" 
                    slotProps={{
                      textField: {
                        error: !!formMethods.formState.errors.orderDate,
                        helperText: formMethods.formState.errors.orderDate?.message
                      }
                    }}
                  />
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              name="dueDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePicker 
                    {...field} 
                    label="Data de Vencimento" 
                    slotProps={{
                      textField: {
                        error: !!formMethods.formState.errors.dueDate,
                        helperText: formMethods.formState.errors.dueDate?.message
                      }
                    }}
                  />
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <Controller
              name="totalComission"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <TextField 
                    {...field} 
                    disabled 
                    label="Comissão Total (R$)" 
                    error={!!formMethods.formState.errors.totalComission}
                    helperText={formMethods.formState.errors.totalComission?.message}
                  />
                );
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}
