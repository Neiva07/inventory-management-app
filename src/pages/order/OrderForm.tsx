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
import { add, integerDivide, multiply } from "lib/math";
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
    const inventoryWithoutSubmmitedOrder = order ? order.items.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory) : product.inventory;
    const items = formMethods.getValues('items')
    return items.filter(item => item.productID === product.id).reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), inventoryWithoutSubmmitedOrder)
  }

  const deleteLineItemFromForm = (itemToDelete: ItemDataInterface) => {
    const filteredItems = items.filter(i => !(i.productID === itemToDelete.productID && i.variant.unit.id === itemToDelete.variant.unit.id))
    const balanceToSubtract = multiply(itemToDelete.variant.conversionRate, itemToDelete.quantity)
    formMethods.setValue('items', filteredItems.map(item => {
      if(item.productID === itemToDelete.productID) {
      return {
        ...item,
        balance: subtract(item.balance, integerDivide(balanceToSubtract, item.variant.conversionRate))
      }
    }
    return item
    }))
    const prevTotalCost = formMethods.getValues('totalCost')
    formMethods.setValue('totalCost', subtract(prevTotalCost, itemToDelete.itemTotalCost))
  }

  return (
    <FormProvider register={register} reset={reset} {...formMethods}>
        <OrderFormHeader onDelete={handleDelete} order={order} />
        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemForm calculateBaseUnitInventory={calculateBaseUnitInventory} deleteLineItemFromForm={deleteLineItemFromForm} />
        </Box>

        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemList deleteLineItemFromForm={deleteLineItemFromForm} />
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
