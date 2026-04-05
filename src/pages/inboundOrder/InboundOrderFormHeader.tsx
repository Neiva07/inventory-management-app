import { Supplier, getSuppliers } from "model/suppliers";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { useParams } from 'react-router-dom';
import { FormActions } from 'components/FormActions';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { InboundOrder } from 'model/inboundOrder';
import { statuses } from './useInboundOrderForm';
import { TotalCostDisplay } from 'components/TotalCostDisplay';
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";
import { DatePickerField } from "components/ui";

interface InboundOrderFormHeaderProps {
  onDelete?: () => void;
  onBack?: () => void;
  inboundOrder?: InboundOrder;
  firstFieldRef?: React.RefObject<HTMLDivElement>;
  onShowHelp?: () => void;
  focusNextField?: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField?: (currentRef: React.RefObject<HTMLElement>) => void;
  headerRefs?: {
    supplierRef: React.RefObject<HTMLDivElement>;
    statusRef: React.RefObject<HTMLDivElement>;
    orderDateRef: React.RefObject<HTMLInputElement>;
    dueDateRef: React.RefObject<HTMLInputElement>;
  };
}

export const InboundOrderFormHeader = ({ onDelete, onBack, inboundOrder, firstFieldRef, onShowHelp, focusNextField, focusPreviousField, headerRefs }: InboundOrderFormHeaderProps) => {
  const { user, organization } = useAuth();
  const { inboundOrderID } = useParams();
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);

  const formMethods = useFormContext<InboundOrderFormDataInterface>()
  const totalCost = formMethods.watch('totalCost');
  
  useEffect(() => {
    getSuppliers({ pageSize: 1000, userID: user.id, organizationId: organization?.id }).then(results => {
      const queriedSuppliers = results[0].docs.map(qr => qr.data() as Supplier)
      setSuppliers(queriedSuppliers)
      if (queriedSuppliers.length > 0 && !Boolean(formMethods.getValues('supplier').value)) {
        formMethods.setValue('supplier', {
          label: queriedSuppliers[0].tradeName,
          value: queriedSuppliers[0].id,
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
            {inboundOrderID ? "Editar Nota de Compra" : "Cadastro de Compra"}
          </PageTitle>
          {inboundOrder?.publicId && (
            <PublicIdDisplay publicId={inboundOrder.publicId} />
          )}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <TotalCostDisplay
            value={totalCost || 0}
            label="Total da Nota"
            size="large"
          />
          <FormActions
            showDelete={!!inboundOrderID}
            onDelete={onDelete}
            onBack={onBack}
            onShowHelp={onShowHelp}
            absolute={true}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="w-full">
            <Controller
              control={formMethods.control}
              render={({ field: { value: supplier, ...props } }) => {
                const handleChange = (
                  _: React.SyntheticEvent<Element, Event>,
                  value: SelectField
                ) => {
                  props.onChange(value);
                };

                return (
                  <>
                    <EnhancedAutocomplete
                      label="Fornecedor"
                      value={supplier}
                      {...props}
                      id="supplier-select"
                      name="supplier"
                      options={suppliers.map((s) => {
                        return {
                          label: s.tradeName,
                          value: s.id,
                        } as SelectField;
                      })}
                      getOptionLabel={(option: SelectField) => option.label}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value.value
                      }
                      onChange={handleChange}
                      error={!!formMethods.formState.errors.supplier}
                      helperText={formMethods.formState.errors.supplier?.label?.message}
                      ref={firstFieldRef || headerRefs?.supplierRef}
                      onNextField={focusNextField ? () => focusNextField(headerRefs?.supplierRef!) : undefined}
                      onPreviousField={focusPreviousField ? () => focusPreviousField(headerRefs?.supplierRef!) : undefined}
                    />
                  </>
                );
              }}
              name="supplier"
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
                    <EnhancedAutocomplete
                      value={status}
                      {...props}
                      id="status-select"
                      options={statuses}
                      getOptionLabel={(option: SelectField) => option.label}
                      label="Tipo de compra"
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
              name="orderDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePickerField
                    id="inbound-order-date"
                    label="Data da Compra"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputRef={headerRefs?.orderDateRef}
                    error={!!formMethods.formState.errors.orderDate}
                    helperText={formMethods.formState.errors.orderDate?.message}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="w-full">
            <Controller
              name="dueDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePickerField
                    id="inbound-due-date"
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
