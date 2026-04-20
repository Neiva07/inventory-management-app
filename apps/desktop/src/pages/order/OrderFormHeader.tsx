import { Customer, getCustomers } from "model/customer";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { OrderFormDataInterface } from "./useOrderForm";
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
import { Autocomplete } from "components/ui/autocomplete";
import { DatePickerField } from "components/ui";

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
  const { user, organization } = useAuth();
  const { orderID } = useParams();
  const [customers, setCustomers] = useState<Array<Customer>>([]);

  const formMethods = useFormContext<OrderFormDataInterface>()
  const totalCost = formMethods.watch('totalCost');
  const totalComission = formMethods.watch('totalComission');
  useEffect(() => {
    getCustomers({ pageSize: 1000, userID: user.id, organizationId: organization?.id }).then(results => {

      const queriedCustomers = results[0].docs.map(qr => qr.data() as Customer)
      setCustomers(queriedCustomers)
      if (queriedCustomers.length > 0) {
        formMethods.setValue('customer', {
          label: queriedCustomers[0].name,
          value: queriedCustomers[0].id,
        })
      }
    })
  }, [formMethods, organization?.id, user.id]);

  return (
    <div className="pt-8">
      {/* Header Row: Title, PublicId, TotalCost, Delete */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <PageTitle>
            {orderID ? "Editar Nota Fiscal" : "Cadastro de Nota Fiscal"}
          </PageTitle>
          {order?.publicId && (
            <PublicIdDisplay publicId={order.publicId} recordType="pedido" />
          )}
        </div>
        <div className="flex min-w-0 items-center gap-2">
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
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="w-full">
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
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="w-full">
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
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="w-full">
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
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="w-full">
            <Controller
              name="orderDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePickerField
                    id="order-date"
                    label="Data da Venda"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputRef={headerRefs?.orderDateRef}
                    error={!!formMethods.formState.errors.orderDate}
                    helperText={formMethods.formState.errors.orderDate?.message}
                    onFocus={(e) => e.target.select()}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="w-full">
            <Controller
              name="dueDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePickerField
                    id="due-date"
                    label="Data de Vencimento"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputRef={headerRefs?.dueDateRef}
                    error={!!formMethods.formState.errors.dueDate}
                    helperText={formMethods.formState.errors.dueDate?.message}
                    onFocus={(e) => e.target.select()}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
