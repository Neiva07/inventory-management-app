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
import { InstallmentPlanModal } from 'components/InstallmentPlanModal';
import { createSupplierBill } from 'model/supplierBill';
import { createMultipleInstallmentPayments } from 'model/installmentPayment';
import { getSupplier } from 'model/suppliers';
import { useAuth } from 'context/auth';
import { toast } from 'react-toastify';

export const InboundOrderForm = () => {
  const { inboundOrderID } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const { register, onFormSubmit, onSubmit, onDelete, inboundOrder, reset, ...formMethods } = useInboundOrderForm(inboundOrderID);

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
                  onClick={hasItems ? () => setInstallmentModalOpen(true) : undefined} 
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
        {/* <InstallmentPaymentModal
          open={installmentModalOpen}
          onClose={() => setInstallmentModalOpen(false)}
          onSubmit={handleInstallmentModalSubmit}
          totalValue={formMethods.watch('totalCost') ?? 0}
        /> */}
        <InstallmentPlanModal
          open={installmentModalOpen}
          onClose={() => setInstallmentModalOpen(false)}
          onSubmit={handleInstallmentModalSubmit}
          totalValue={formMethods.watch('totalCost') ?? 0}
          orderDate={formMethods.watch('orderDate') ?? new Date()}
          
        />
    </FormProvider>
  )
} 