import { Button, Tooltip } from "@mui/material";
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

  // Watch the items to check if there are any line items
  const items = formMethods.watch('items');
  const hasItems = items && items.length > 0;

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
            <Button onClick={handleSubmit} variant="outlined" size="large" style={{ marginTop: 20}}>
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

              <Tooltip 
                title={!hasItems ? "Você precisa adicionar ao menos 1 item para fechar a nota" : ""}
                arrow
              >
                <Button 
                  onClick={hasItems ? handleSubmit : undefined} 
                  variant="outlined" 
                  size="large"
                  style={{ 
                    marginTop: 20,
                    opacity: hasItems ? 1 : 0.6,
                    cursor: hasItems ? 'pointer' : 'not-allowed'
                  }}
                >
                  Fechar Nota
                </Button>
              </Tooltip>
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
