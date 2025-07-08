import { FormControl, Grid, Box } from "@mui/material"
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
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";

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

interface OrderFormHeaderProps {
  onDelete?: () => void;
  onBack?: () => void;
  order?: Order;
  firstFieldRef?: React.RefObject<HTMLDivElement>;
  focusNextField?: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField?: (currentRef: React.RefObject<HTMLElement>) => void;
  headerRefs?: {
    customerRef: React.RefObject<HTMLDivElement>;
    statusRef: React.RefObject<HTMLDivElement>;
    paymentMethodRef: React.RefObject<HTMLDivElement>;
    orderDateRef: React.RefObject<HTMLInputElement>;
    dueDateRef: React.RefObject<HTMLInputElement>;
  };
}

export const OrderFormHeader = ({ onDelete, onBack, order, firstFieldRef, focusNextField, focusPreviousField, headerRefs }: OrderFormHeaderProps) => {
  const { user } = useAuth();
  const { orderID } = useParams();
  const [customers, setCustomers] = useState<Array<Customer>>([]);

  const formMethods = useFormContext<OrderFormDataInterface>()
  const totalCost = formMethods.watch('totalCost');
  const totalComission = formMethods.watch('totalComission');
  useEffect(() => {
    getCustomers({ pageSize: 1000, userID: user.id }).then(results => {

      const queriedCustomers = results[0].docs.map(qr => qr.data() as Customer)
      setCustomers(queriedCustomers)
      if (queriedCustomers.length > 0) {
        formMethods.setValue('customer', {
          label: queriedCustomers[0].name,
          value: queriedCustomers[0].id,
        })
      }
    })
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
            onBack={onBack}
            onShowHelp={() => {
              // Trigger F1 key programmatically to show help
              const f1Event = new KeyboardEvent('keydown', {
                key: 'F1',
                code: 'F1',
                keyCode: 112,
                which: 112,
                bubbles: true,
                cancelable: true,
              });
              document.dispatchEvent(f1Event);
            }}
            absolute={true}
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
                    <EnhancedAutocomplete
                      label="Cliente"
                      value={customer}
                      {...props}
                      id="customer-select"
                      name="customer"
                      options={customers.map((c) => {
                        return {
                          label: c.name,
                          value: c.id,
                        } as SelectField;
                      })}
                      getOptionLabel={(option: SelectField) => option.label}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value.value
                      }
                      onChange={handleChange}
                      error={!!formMethods.formState.errors.customer}
                      helperText={formMethods.formState.errors.customer?.label?.message}
                      ref={firstFieldRef || headerRefs?.customerRef}
                      onNextField={focusNextField ? () => focusNextField(headerRefs?.customerRef!) : undefined}
                      onPreviousField={focusPreviousField ? () => focusPreviousField(headerRefs?.customerRef!) : undefined}
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
                    <EnhancedAutocomplete
                      value={status}
                      {...props}
                      id="status-select"
                      options={statuses}
                      getOptionLabel={(option: SelectField) => option.label}
                      label="Tipo de venda"
                      error={!!formMethods.formState.errors.status}
                      helperText={formMethods.formState.errors.status?.message}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value.value
                      }
                      onChange={handleChange}
                      ref={headerRefs?.statusRef}
                      onNextField={focusNextField ? () => focusNextField(headerRefs?.statusRef!) : undefined}
                      onPreviousField={focusPreviousField ? () => focusPreviousField(headerRefs?.statusRef!) : undefined}
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
                    <EnhancedAutocomplete
                      value={paymentType}
                      {...props}
                      id="payment-method-select"
                      options={paymentMethods.map(pm => ({
                        label: pm.label,
                        value: pm.id,
                      }))}
                      getOptionLabel={(option: SelectField) => option.label}
                      label="Método de pagamento"
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value.value
                      }
                      onChange={handleChange}
                      error={!!formMethods.formState.errors.paymentMethod}
                      helperText={formMethods.formState.errors.paymentMethod?.message}
                      ref={headerRefs?.paymentMethodRef}
                      onNextField={focusNextField ? () => focusNextField(headerRefs?.paymentMethodRef!) : undefined}
                      onPreviousField={focusPreviousField ? () => focusPreviousField(headerRefs?.paymentMethodRef!) : undefined}
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
                    ref={headerRefs?.orderDateRef}
                    slotProps={{
                      textField: {
                        error: !!formMethods.formState.errors.orderDate,
                        helperText: formMethods.formState.errors.orderDate?.message,
                        onFocus: (e) => e.target.select(),
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
                    ref={headerRefs?.dueDateRef}
                    slotProps={{
                      textField: {
                        error: !!formMethods.formState.errors.dueDate,
                        helperText: formMethods.formState.errors.dueDate?.message,
                        onFocus: (e) => e.target.select(),
                      }
                    }}
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
