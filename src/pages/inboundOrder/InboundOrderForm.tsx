import { Button, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import { FormProvider } from "react-hook-form"
import { useParams, useNavigate } from "react-router-dom";
import { InboundOrderFormHeader } from "./InboundOrderFormHeader";
import { InboundOrderFormLineItemForm } from "./InboundOrderFormLineItemForm";
import { InboundOrderFormLineItemList } from "./InboundOrderFormLineItemList";
import { InboundOrderItemDataInterface, useInboundOrderForm } from "./useInboundOrderForm";
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { useState } from 'react';
import { add, integerDivide, multiply, subtract } from "lib/math";
import { Product, Variant } from "model/products";

export const InboundOrderForm = () => {
  const { inboundOrderID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { register, onFormSubmit, onDelete, inboundOrder, reset, ...formMethods } = useInboundOrderForm(inboundOrderID);

  // Watch the items to check if there are any line items
  const items = formMethods.watch('items');
  const hasItems = items && items.length > 0;

  const handleSubmit = async () => {
    onFormSubmit();
    if (inboundOrderID || !isCreateMode) {
      navigate('/inbound-orders');
    } else {
        reset();
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    onDelete(() => navigate('/inbound-orders'));
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  console.log(inboundOrder);

  const calculateBaseUnitInventory = (product: Product) => {
    const inventoryWithoutSubmmitedInboundOrder = inboundOrder ? inboundOrder.items.reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory) : product.inventory;
    console.log(inventoryWithoutSubmmitedInboundOrder)

    const items = formMethods.getValues('items')
    return items.filter(item => item.productID === product.id).reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), inventoryWithoutSubmmitedInboundOrder)
  }

  const deleteLineItemFromForm = (itemToDelete: InboundOrderItemDataInterface) => {

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
        <InboundOrderFormHeader onDelete={handleDelete} inboundOrder={inboundOrder} />
        <Box style={{ marginTop: 40 }}>
          <InboundOrderFormLineItemForm calculateBaseUnitInventory={calculateBaseUnitInventory} deleteLineItemFromForm={deleteLineItemFromForm} />
        </Box>

        <Box style={{ marginTop: 40 }}>
          <InboundOrderFormLineItemList deleteLineItemFromForm={deleteLineItemFromForm} />
        </Box>
        
          {inboundOrderID ? (
            <Button onClick={handleSubmit} variant="outlined" size="large" style={{ marginTop: 20}}>
              Editar Nota
            </Button>
          ) : (
            <>  
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', marginTop: 8}}>
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de compras"
                createText="Criar mais compras"
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
          resourceName="compra"
        />
    </FormProvider>
  )
} 