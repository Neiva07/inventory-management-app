import { Autocomplete, FormControl, Grid, TextField } from "@mui/material"
import { Supplier, getSuppliers } from "model/suppliers";
import { SelectField } from "pages/product/useProductCreateForm";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form"
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { useParams } from 'react-router-dom';
import { FormActions } from 'components/FormActions';
import { Box } from '@mui/material';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { InboundOrder } from 'model/inboundOrder';
import { statuses } from './useInboundOrderForm';

export const InboundOrderFormHeader = ({ onDelete, inboundOrder }: { onDelete?: () => void; inboundOrder?: InboundOrder }) => {
  const { user } = useAuth();
  const { inboundOrderID } = useParams();
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);

  const formMethods = useFormContext<InboundOrderFormDataInterface>()
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
    <Box sx={{ position: 'relative', pt: 8 }}>
      <FormActions
        showDelete={!!inboundOrderID}
        onDelete={onDelete}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PageTitle>
          {inboundOrderID ? "Editar Nota de Compra" : "Cadastro de Compra"}
        </PageTitle>
        {inboundOrder?.publicId && (
          <PublicIdDisplay 
            publicId={inboundOrder.publicId} 
          />
        )}
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
                    <Autocomplete
                      value={supplier}
                      {...props}
                      id="supplier-select"
                      options={suppliers.map((s) => {
                        return {
                          label: s.tradeName,
                          value: s.id,
                        } as SelectField;
                      })}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Fornecedor"
                          error={!!formMethods.formState.errors.supplier}
                          helperText={formMethods.formState.errors.supplier?.label?.message}
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
                          label="Tipo de compra"
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
              name="orderDate"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <DatePicker 
                    {...field} 
                    label="Data da Compra" 
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
              name="totalCost"
              control={formMethods.control}
              render={({ field }) => {
                return (
                  <TextField 
                    {...field} 
                    disabled 
                    label="Valor Total da nota" 
                    error={!!formMethods.formState.errors.totalCost}
                    helperText={formMethods.formState.errors.totalCost?.message}
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