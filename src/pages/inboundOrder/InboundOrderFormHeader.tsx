import { FormControl, Grid, Box } from "@mui/material"
import { Supplier, getSuppliers } from "model/suppliers";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { useParams } from 'react-router-dom';
import { FormActions } from 'components/FormActions';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { InboundOrder } from 'model/inboundOrder';
import { statuses } from './useInboundOrderForm';
import { TotalCostDisplay } from 'components/TotalCostDisplay';
import { EnhancedAutocomplete } from "components/EnhancedAutocomplete";

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
  const { user } = useAuth();
  const { inboundOrderID } = useParams();
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);

  const formMethods = useFormContext<InboundOrderFormDataInterface>()
  const totalCost = formMethods.watch('totalCost');
  
  useEffect(() => {
    getSuppliers({ pageSize: 1000, userID: user.id }).then(results => {
      const queriedSuppliers = results[0].docs.map(qr => qr.data() as Supplier)
      setSuppliers(queriedSuppliers)
      if (queriedSuppliers.length > 0 && !Boolean(formMethods.getValues('supplier').value)) {
        formMethods.setValue('supplier', {
          label: queriedSuppliers[0].tradeName,
          value: queriedSuppliers[0].id,
        })
      }
    })
  }, [formMethods]);

  return (
    <Box sx={{ pt: 8 }}>
      {/* Header Row: Title, PublicId, TotalCost, Delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <PageTitle>
            {inboundOrderID ? "Editar Nota de Compra" : "Cadastro de Compra"}
          </PageTitle>
          {inboundOrder?.publicId && (
            <PublicIdDisplay publicId={inboundOrder.publicId} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
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
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControl fullWidth>
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
                      onNextField={() => focusNextField(headerRefs?.supplierRef!)}
                      onPreviousField={() => focusPreviousField(headerRefs?.supplierRef!)}
                    />
                  </>
                );
              }}
              name="supplier"
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
                      label="Tipo de compra"
                      error={!!formMethods.formState.errors.status}
                      helperText={formMethods.formState.errors.status?.message}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value.value
                      }
                      onChange={handleChange}
                      ref={headerRefs?.statusRef}
                      onNextField={() => focusNextField(headerRefs?.statusRef!)}
                      onPreviousField={() => focusPreviousField(headerRefs?.statusRef!)}
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
              name="orderDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePicker 
                    {...field} 
                    label="Data da Compra" 
                    ref={headerRefs?.orderDateRef}
                    slotProps={{
                      textField: {
                        error: !!formMethods.formState.errors.orderDate,
                        helperText: formMethods.formState.errors.orderDate?.message,
                      }
                    }}
                  />
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
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
                        helperText: formMethods.formState.errors.dueDate?.message,
                        ref: headerRefs?.dueDateRef,
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