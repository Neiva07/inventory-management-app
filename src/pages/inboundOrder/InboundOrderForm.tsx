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
import React, { useState, useRef } from 'react';
import { integerDivide, multiply } from "lib/math";
import { subtract } from "lib/math";
import { InstallmentPlanModal } from 'components/InstallmentPlanModal';
import { createSupplierBill } from 'model/supplierBill';
import { createMultipleInstallmentPayments } from 'model/installmentPayment';
import { getSupplier } from 'model/suppliers';
import { useAuth } from 'context/auth';
import { toast } from 'react-toastify';
import { useFormWrapper } from '../../hooks/useFormWrapper';
import { KeyboardShortcutsHelp } from 'components/KeyboardShortcutsHelp';
import { ProductUpdateModal } from 'components/ProductUpdateModal';
import { ProductUpdateToggle } from 'components/ProductUpdateToggle';
import { Product } from 'model/products';

export const InboundOrderForm = () => {
  const { inboundOrderID } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  // Product update modal state
  const [showProductUpdateModal, setShowProductUpdateModal] = useState(false);
  const [pendingProductUpdate, setPendingProductUpdate] = useState<{
    productID: string;
    newUnitCost: number;
    variantUnitID: string;
  } | null>(null);
  
  // Ref for the product selection Autocomplete
  const productSelectRef = React.useRef<HTMLDivElement>(null);
  
  // Header field refs
  const supplierRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const orderDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  
  // Line item field refs
  const variantRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const unitCostRef = useRef<HTMLInputElement>(null);
  
  const { 
    register, 
    onFormSubmit, 
    onSubmit, 
    onDelete, 
    inboundOrder, 
    reset, 
    products,
    // Line item business logic
    calculateBaseUnitInventory,
    handleSelectProduct,
    handleSelectVariant,
    submitItem,
    addItemToForm,
    // Product update functionality
    shouldUpdateProduct,
    setShouldUpdateProduct,
    handleProductUpdateConfirm,
    ...formMethods 
  } = useInboundOrderForm(inboundOrderID);

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

  // Handle installment modal submit - create SupplierBill and InstallmentPayments
  const handleInstallmentModalSubmit = async (data: any) => {
    try {
      setInstallmentModalOpen(false);
      
      // Get the form data to create the supplier bill
      const formData = formMethods.getValues();
      const totalCost = formData.totalCost || 0;
      
      // First, create the inbound order and get its id/publicId
      const inboundOrderResult = await onSubmit(formData);
      
      // Fetch supplier data to get the public ID
      const supplierDoc = await getSupplier(formData.supplier.value);
      const supplierData = supplierDoc.data();
      
      const supplierBillData = {
        userID: user.id,
        supplier: {
          supplierID: formData.supplier.value,
          publicID: supplierData?.publicId ?? '',
          supplierName: formData.supplier.label,
        },
        inboundOrder: {
          id: inboundOrderResult?.id ?? '',
          publicId: inboundOrderResult?.publicId ?? '',
        },
        totalValue: totalCost,
        initialCashInstallment: data.initialCashInstallment || 0,
        remainingValue: totalCost - (data.initialCashInstallment || 0),
        startDate: data.startDate.getTime(),
      };
      
      // Create SupplierBill and get its ID
      const supplierBillID = await createSupplierBill(supplierBillData);
      
      // Create InstallmentPayments
      const installmentPayments = data.plannedPayments.map((payment: any, index: number) => ({
        userID: user.id,
        supplierBillID,
        installmentNumber: index + 1,
        dueDate: payment.dueDate.getTime(),
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      }));
      
      await createMultipleInstallmentPayments(installmentPayments);
      
      toast.success('Plano de parcelamento criado com sucesso!');
      
      if (inboundOrderID || !isCreateMode) {
        navigate('/inbound-orders');
      } else {
        reset();
      }
    } catch (error) {
      console.error('Error creating installment plan:', error);
      toast.error('Erro ao criar plano de parcelamento');
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
      const result = submitItem();
      
      if (result === true) {
        // Duplicate item found
        setShowDuplicateDialog(true);
      } else if (result && result.needsProductUpdate) {
        // Product update needed
        setPendingProductUpdate({
          productID: pendingItem.selectedProduct.id,
          newUnitCost: pendingItem.unitCost,
          variantUnitID: pendingItem.variant.unit.id,
        });
        setShowProductUpdateModal(true);
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

  const handleToggleProductUpdate = () => {
    setShouldUpdateProduct(!shouldUpdateProduct);
  }

  const handleProductUpdateConfirmModal = async (updatedProduct: Product) => {
    try {
      const success = await handleProductUpdateConfirm(updatedProduct);
      if (success) {
        setShowProductUpdateModal(false);
        setPendingProductUpdate(null);
        
        // Focus the product selection after successful update
        setTimeout(() => {
          if (productSelectRef.current) {
            const inputElement = productSelectRef.current.querySelector('input');
            inputElement?.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
    }
  }

  const handleProductUpdateCancel = () => {
    setShowProductUpdateModal(false);
    setPendingProductUpdate(null);
    // Reset the unit cost to the original value
    const pendingItem = formMethods.getValues('pendingItem');
    if (pendingItem.variant) {
      formMethods.setValue('pendingItem.unitCost', pendingItem.variant.unitCost);
    }
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
    onSubmit: hasItems ? () => setInstallmentModalOpen(true) : undefined,
    onCancel: () => navigate('/inbound-orders'),
    onDelete: inboundOrderID ? handleDelete : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    autoFocusField: 'supplier',
    helpTitle: 'Atalhos do Teclado - Compra',
    customShortcuts: {
      'Ctrl/Cmd + P': handleAddItem,
      'Ctrl/Cmd + Y': handleToggleProductUpdate,
    },
    fieldRefs: [
      supplierRef, // Header row 1
      statusRef,
      orderDateRef, // Header row 2
      dueDateRef,
      productSelectRef, // Line item row 1
      variantRef,
      quantityRef, // (inventory is not focusable)
      unitCostRef, // Line item row 2
    ],
  });

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
      <Box component="form" ref={formRef}>
        <InboundOrderFormHeader 
          onDelete={handleDelete} 
          inboundOrder={inboundOrder} 
          firstFieldRef={firstFieldRef}
          onShowHelp={handleShowHelp}
          focusNextField={focusNextField}
          focusPreviousField={focusPreviousField}
          headerRefs={{
            supplierRef,
            statusRef,
            orderDateRef,
            dueDateRef,
          }}
        />
        <Box style={{ marginTop: 40 }}>
          <InboundOrderFormLineItemForm 
            productSelectRef={productSelectRef}
            variantRef={variantRef}
            quantityRef={quantityRef}
            unitCostRef={unitCostRef}
            focusNextField={focusNextField}
            focusPreviousField={focusPreviousField}
            products={products}
            handleSelectProduct={handleSelectProduct}
            handleSelectVariant={handleSelectVariant}
            handleAddItem={handleAddItem}
            // Dialog handlers
            showDuplicateDialog={showDuplicateDialog}
            handleDialogOverride={handleDialogOverride}
            handleDialogClose={handleDialogClose}
          />
          
          <Box sx={{ mt: 2 }}>
            <ProductUpdateToggle
              shouldUpdateProduct={shouldUpdateProduct}
              onToggle={setShouldUpdateProduct}
            />
          </Box>
        </Box>

        <Box style={{ marginTop: 40 }}>
          <InboundOrderFormLineItemList deleteLineItemFromForm={deleteLineItemFromForm} />
        </Box>
        
        {inboundOrderID ? (
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
              listingText="Redirecionar para listagem de compras"
              createText="Criar mais compras"
            />
          </Box>

            <Tooltip 
              title={!hasItems ? "Você precisa adicionar ao menos 1 item para fechar a compra" : "Ctrl/Cmd + Enter"}
              arrow
            >
              <Button 
                onClick={hasItems ? () => setInstallmentModalOpen(true) : undefined} 
                variant="outlined" 
                size="large"
                style={{ 
                  marginTop: 20,
                  opacity: hasItems ? 1 : 0.6,
                  cursor: hasItems ? 'pointer' : 'not-allowed'
                }}
              >
                Fechar Compra
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

        <InstallmentPlanModal
          open={installmentModalOpen}
          onClose={() => setInstallmentModalOpen(false)}
          onSubmit={handleInstallmentModalSubmit}
          totalValue={formMethods.watch('totalCost') ?? 0}
          orderDate={formMethods.watch('orderDate') ?? new Date()}
        />

        {pendingProductUpdate && (
          <ProductUpdateModal
            open={showProductUpdateModal}
            onClose={handleProductUpdateCancel}
            onConfirm={handleProductUpdateConfirmModal}
            productID={pendingProductUpdate.productID}
            newUnitCost={pendingProductUpdate.newUnitCost}
            variantUnitID={pendingProductUpdate.variantUnitID}
          />
        )}
        
        {/* Keyboard Help Modal */}
        <KeyboardShortcutsHelp
          open={showHelp}
          onClose={closeHelp}
          title="Atalhos do Teclado - Compra"
          showVariants={false}
          customShortcuts={[
            { shortcut: 'Ctrl/Cmd + P', description: 'Adicionar item (quando disponível)' },
            { shortcut: 'Ctrl/Cmd + Y', description: 'Alternar atualização de custo do produto' }
          ]}
        />
      </Box>
    </FormProvider>
  )
} 