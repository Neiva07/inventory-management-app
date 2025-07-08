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
import React, { useState, useRef } from 'react';
import { integerDivide, multiply } from "lib/math";
import { subtract } from "lib/math";
import { useFormWrapper } from '../../hooks/forms/useFormWrapper';
import { KeyboardShortcutsHelp } from 'components/KeyboardFormShortcutsHelp';

export const OrderForm = () => {
  const { orderID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  // Ref for the product selection Autocomplete
  const productSelectRef = React.useRef<HTMLDivElement>(null);
  
  // Header field refs
  const customerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const orderDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  
  // Line item field refs
  const variantRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const unitPriceRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const commissionRef = useRef<HTMLInputElement>(null);
  
  const { 
    register, 
    onFormSubmit, 
    onDelete, 
    order, 
    reset, 
    products,
    // Line item business logic
    calculateBaseUnitInventory,
    handleSelectProduct,
    handleSelectVariant,
    submitItem,
    addItemToForm,
    ...formMethods 
  } = useOrderForm(orderID);

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

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar o formulário? Todas as alterações serão perdidas.')) {
      reset();
    }
  }

  // UI handlers for dialogs
  const handleDialogOverride = () => {
    const pendingItem = formMethods.getValues('pendingItem');
    const itemToDelete = formMethods.getValues("items").find(item => item.productID === pendingItem.selectedProduct.id && item.variant.unit.id === pendingItem.variant.unit.id)
    deleteLineItemFromForm(itemToDelete);
    setShowDuplicateDialog(false);
    addItemToForm(true);
  }

  const handleDialogClose = () => {
    setShowDuplicateDialog(false);
  }

  const handleAddItem = () => {
    const pendingItem = formMethods.getValues('pendingItem');
    
    if (pendingItem.isFormCompleted) {
      const hasDuplicate = submitItem();
      if (hasDuplicate) {
        setShowDuplicateDialog(true);
      } else {
        // Item was added successfully, focus the product selection for next item
        setTimeout(() => {
          if (productSelectRef.current) {
            const inputElement = productSelectRef.current.querySelector('input');
            inputElement?.focus();
          }
        }, 100);
      }
    }
  }

  const handleToggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  }

  const handleShowHelp = () => {
    // The F1 shortcut is handled by the form wrapper, but we need this for the button
    // We'll trigger the F1 key programmatically
    const f1Event = new KeyboardEvent('keydown', {
      key: 'F1',
      code: 'F1',
      keyCode: 112,
      which: 112,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(f1Event);
  };

  // Form wrapper with keyboard shortcuts and field navigation
  const {
    showHelp,
    closeHelp,
    formRef,
    firstFieldRef,
    focusNextField,
    focusPreviousField,
  } = useFormWrapper({
    onSubmit: hasItems ? handleSubmit : undefined,
    onCancel: () => navigate('/orders'),
    onDelete: orderID ? handleDelete : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    autoFocusField: 'customer',
    helpTitle: 'Atalhos do Teclado - Venda',
    customShortcuts: {
      'Ctrl/Cmd + P': handleAddItem,
    },
    fieldRefs: [
      customerRef, // Header row 1
      statusRef,
      paymentMethodRef,
      orderDateRef, // Header row 2
      dueDateRef,
      productSelectRef, // Line item row 1
      variantRef,
      quantityRef, // (inventory is not focusable)
      unitPriceRef, // Line item row 2
      discountRef,
      commissionRef, // (unit cost and total are not focusable)
    ],
  });

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
      <Box component="form" ref={formRef}>
        <OrderFormHeader 
          onDelete={handleDelete} 
          order={order} 
          firstFieldRef={firstFieldRef}
          focusNextField={focusNextField}
          focusPreviousField={focusPreviousField}
          headerRefs={{
            customerRef,
            statusRef,
            paymentMethodRef,
            orderDateRef,
            dueDateRef,
          }}
        />
        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemForm 
            productSelectRef={productSelectRef}
            variantRef={variantRef}
            quantityRef={quantityRef}
            unitPriceRef={unitPriceRef}
            discountRef={discountRef}
            commissionRef={commissionRef}
            products={products}
            handleSelectProduct={handleSelectProduct}
            handleSelectVariant={handleSelectVariant}
            handleAddItem={handleAddItem}
            // Dialog handlers
            showDuplicateDialog={showDuplicateDialog}
            handleDialogOverride={handleDialogOverride}
            handleDialogClose={handleDialogClose}
            focusNextField={focusNextField}
            focusPreviousField={focusPreviousField}
          />
        </Box>

        <Box style={{ marginTop: 40 }}>
          <OrderFormLineItemList deleteLineItemFromForm={deleteLineItemFromForm} />
        </Box>
        
          {orderID ? (
            <Tooltip title="Ctrl/Cmd + Enter" placement="top">
              <Button onClick={handleSubmit} variant="outlined" size="large" style={{ marginTop: 20}}>
                Editar Nota
              </Button>
            </Tooltip>
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
                title={!hasItems ? "Você precisa adicionar ao menos 1 item para fechar a nota" : "Ctrl/Cmd + Enter"}
                placement="top"
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
        
        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={closeHelp}
          title="Atalhos do Teclado - Venda"
          showVariants={false}
          customShortcuts={[
            { shortcut: 'Ctrl/Cmd + P', description: 'Adicionar item (quando disponível)' }
          ]}
        />
      </Box>
    </FormProvider>
  );
};
