import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { FormProvider } from "react-hook-form"
import { useParams, useNavigate } from "react-router-dom";
import { OrderFormHeader } from "./OrderFormHeader";
import { OrderFormLineItemForm } from "./OrderFormLineItemForm";
import { OrderFormLineItemList } from "./OrderFormLineItemList";
import { ItemDataInterface, useOrderForm } from "./useOrderForm";
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { useState } from 'react';
import { multiply } from "lib/math";
import { Product, Variant } from "model/products";
import { subtract } from "lib/math";

export const OrderForm = () => {
  const { orderID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { register, onFormSubmit, onDelete, order, reset, ...formMethods } = useOrderForm(orderID);

  const handleSubmit = async () => {
    onFormSubmit();
    if (orderID || !isCreateMode) {
      navigate('/orders');
    } else {
        reset();
    }
  };

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

  const calculateBaseUnitInventory = (product: Product) => {
    const items = formMethods.getValues('items')
    return items.filter(item => item.productID === product.id).reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory)
  }

  return (
    <FormProvider register={register} reset={reset} {...formMethods}>
        <OrderFormHeader onDelete={handleDelete} order={order} />
        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemForm calculateBaseUnitInventory={calculateBaseUnitInventory} />
        </Box>

        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemList calculateBaseUnitInventory={calculateBaseUnitInventory} />
        </Box>
        
          {orderID ? (
            <Button onClick={handleSubmit} variant="outlined" style={{ marginTop: 20}}>
              Editar Nota
            </Button>
          ) : (
            <>  
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', marginTop: 8}}>
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de vendas"
                createText="Criar mais vendas"
              />
            </Box>

              <Button onClick={handleSubmit} variant="outlined" style={{ marginTop: 20}}>
                Fechar Nota
              </Button>
              </>
          )}
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          resourceName="venda"
        />
    </FormProvider>
  )
}
