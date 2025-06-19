import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { FormProvider } from "react-hook-form"
import { useParams, useNavigate } from "react-router-dom";
import { OrderFormHeader } from "./OrderFormHeader";
import { OrderFormLineItemForm } from "./OrderFormLineItemForm";
import { OrderFormLineItemList } from "./OrderFormLineItemList";
import { useOrderForm } from "./useOrderForm";
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { useState } from 'react';

export const OrderForm = () => {
  const { orderID } = useParams();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { register, onFormSubmit, onDelete, ...formMethods } = useOrderForm(orderID);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    onDelete(() => navigate('/orders'));
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  return (
    <FormProvider register={register} {...formMethods}>
      <OrderFormHeader onDelete={handleDelete} />
      <Box style={{ marginTop: 40 }}>
        <OrderFormLineItemForm />
      </Box>

      <Box style={{ marginTop: 40 }}>
        <OrderFormLineItemList />
      </Box>
      <Button variant="outlined" onClick={onFormSubmit} style={{ marginTop: 20 }}>{orderID ? 'Editar Nota' : 'Fechar Nota'} </Button>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="venda"
      />
    </FormProvider>
  )
}
