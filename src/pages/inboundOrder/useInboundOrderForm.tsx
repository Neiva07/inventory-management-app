import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useInboundOrderFormValidationSchema from './useInboundOrderFormValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useState } from 'react';
import { createInboundOrder, InboundOrder, InboundOrderStatus, deleteInboundOrder, getInboundOrder, InboundOrderItem, updateInboundOrder, InboundOrderPayment } from 'model/inboundOrder';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';
import { Product, Variant, updateProduct } from 'model/products';
import { getProducts } from 'model/products';
import { paymentMethodById } from 'model/paymentMethods';
import { multiply, subtract, add, integerDivide } from 'lib/math';

export const statuses = [
  {
    label: "requisição",
    value: "request",
  },
  {
    label: "compra",
    value: "complete"
  }
]

export interface InboundOrderItemDataInterface {
  productID: string;
  productBaseUnitInventory: number;
  title: string;
  balance: number;
  quantity: number;
  unitCost: number;
  variant: Variant;
  itemTotalCost: number;
  shouldChangeProductUnitCost: boolean;
}

export interface PendingItemInterface {
  selectedProduct: Product | null;
  variant: Variant | null;
  quantity: number;
  inventory: number;
  unitCost: number;
  itemTotalCost: number;
  isFormCompleted: boolean;
}

export interface InboundOrderPaymentDataInterface {
  method: SelectField;
  amount: number;
  dueDate?: Date;
}

export interface InboundOrderFormDataInterface {
  supplier: SelectField;
  payments: Array<InboundOrderPaymentDataInterface>;
  dueDate: Date;
  orderDate: Date;
  status: SelectField;
  items: Array<InboundOrderItemDataInterface>;
  totalCost: number;
  pendingItem: PendingItemInterface;
}

const INITIAL_INBOUND_ORDER_VALUES: InboundOrderFormDataInterface = {
  supplier: {
    label: '',
    value: '',
  },
  payments: [],
  items: [],
  status: statuses[1],
  orderDate: new Date(),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  totalCost: 0,
  pendingItem: {
    selectedProduct: null,
    variant: null,
    quantity: 0,
    inventory: 0,
    unitCost: 0,
    itemTotalCost: 0,
    isFormCompleted: false,
  },
};

export const useInboundOrderForm = (inboundOrderID?: string) => {
  const { user } = useAuth();
  const [fetchedInboundOrderForm, setFetchedInboundOrderForm] = React.useState<InboundOrderFormDataInterface>();
  const [inboundOrder, setInboundOrder] = React.useState<InboundOrder>();
  const [products, setProducts] = useState<Array<Product>>([]);
  const [shouldUpdateProduct, setShouldUpdateProduct] = useState<boolean>(true);

  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize: 10000,
      status: 'active',
      userID: user.id,
    }).then(result => {
      const queriedProducts = result[0].map(p => p as Product)
      setProducts(queriedProducts)
      if (queriedProducts.length > 0) {
        formMethods.setValue('pendingItem.selectedProduct', queriedProducts[0])
        formMethods.setValue('pendingItem.variant', queriedProducts[0].variants[0])
        formMethods.setValue('pendingItem.unitCost', queriedProducts[0].variants[0].unitCost ?? 0)
      }
    })
  }, [user]);

  React.useEffect(() => {
    queryProducts();
  }, [user]);

  const formValidationSchema = useInboundOrderFormValidationSchema();
  const formMethods = useForm<InboundOrderFormDataInterface>({
    defaultValues: INITIAL_INBOUND_ORDER_VALUES,
    mode: 'onBlur',
    resolver: yupResolver(formValidationSchema) as Resolver<InboundOrderFormDataInterface>,
  });

  const getInboundOrderFormData = React.useCallback(async (inboundOrderID?: string) => {
    const queriedInboundOrder = await getInboundOrder(inboundOrderID)
    setInboundOrder(queriedInboundOrder);

    const inboundOrderForm = {
      ...queriedInboundOrder,
      dueDate: new Date(queriedInboundOrder.dueDate),
      orderDate: new Date(queriedInboundOrder.orderDate),
      supplier: {
        label: queriedInboundOrder.supplier.name,
        value: queriedInboundOrder.supplier.id,
      },
      status: {
        ...statuses.find(s => s.value === queriedInboundOrder.status),
      },
      payments: queriedInboundOrder.payments?.map(payment => ({
        method: {
          label: payment.method.label,
          value: payment.method.id,
        },
        amount: payment.amount,
        dueDate: payment.dueDate ? new Date(payment.dueDate) : undefined,
      })) ?? [],
      items: queriedInboundOrder.items.map(item => ({
        ...item,
        shouldChangeProductUnitCost: false,
      })) ?? [],
      pendingItem: {
        selectedProduct: null,
        variant: null,
        quantity: 0,
        inventory: 0,
        unitCost: 0,
        itemTotalCost: 0,
        isFormCompleted: false,
      },
    } as InboundOrderFormDataInterface

    setFetchedInboundOrderForm(inboundOrderForm);
  }, [inboundOrderID]);

  React.useEffect(() => {
    if (inboundOrderID) {
      getInboundOrderFormData(inboundOrderID)
    }
  }, [inboundOrderID])

  React.useEffect(() => {
    formMethods.reset(fetchedInboundOrderForm)
  }, [fetchedInboundOrderForm])

  const onSubmit = useCallback(async (data: InboundOrderFormDataInterface) => {
    const { supplier, dueDate, status, payments, items, orderDate, pendingItem, ...rest } = data;

    const inboundOrder = {
      supplier: {
        name: supplier.label,
        id: supplier.value,
      },
      payments: payments.map(payment => ({
        method: {
          label: payment.method.label,
          id: payment.method.value,
        },
        amount: payment.amount,
        dueDate: payment.dueDate?.getTime(),
      } as InboundOrderPayment)),
      userID: user.id,
      status: status.value as InboundOrderStatus,
      dueDate: dueDate.getTime(),
      orderDate: orderDate.getTime(),
      items: items.map(i => ({
        ...i
      } as InboundOrderItem)),
      ...rest
    } as InboundOrder

    try {
      if (inboundOrderID) {
        await updateInboundOrder(inboundOrderID, inboundOrder);
        toast.success('Compra atualizada com sucesso', {
          position: "bottom-right",
          theme: "colored",
        });
        return { id: inboundOrderID, publicId: '' };
      } else {
        const result = await createInboundOrder(inboundOrder);
        toast.success('Compra realizada com sucesso', {
          position: "bottom-right",
          theme: "colored",
        });
        return result;
      }
    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
      return null;
    }
  }, [inboundOrderID]);

  const onDelete = useCallback((onSuccess?: () => void) => {
    try {
      deleteInboundOrder(inboundOrderID)
      toast.success('Compra deletada com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })
      // Call the success callback (navigation) after successful deletion
      onSuccess?.()

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }
  }, [inboundOrderID])

  const calculateBaseUnitBalance = useCallback((product: Product, itemVariant: Variant, submittedItemQuantity: number, items: InboundOrderItemDataInterface[]) => {
    const prevBalance = items.filter(item => item.productID === product.id).reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory)

    return add(prevBalance, multiply(submittedItemQuantity, itemVariant.conversionRate))
  }, [])

  // Line item business logic functions
  const calculateBaseUnitInventory = useCallback((product: Product) => {
    const inventoryWithoutSubmmitedInboundOrder = inboundOrder ? inboundOrder.items.reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory) : product.inventory;
    const items = formMethods.getValues('items')
    return items.filter(item => item.productID === product.id).reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), inventoryWithoutSubmmitedInboundOrder)
  }, [inboundOrder, formMethods]);

  const handleSelectProduct = useCallback((_: React.SyntheticEvent<Element, Event>, value: Product) => {
    formMethods.setValue('pendingItem.selectedProduct', value);
    handleSelectVariant(null, value.variants[0])
  }, [formMethods]);

  const handleSelectVariant = useCallback((_: React.SyntheticEvent<Element, Event>, value: Variant) => {
    const resetPendingItem : PendingItemInterface = {
      selectedProduct: formMethods.getValues('pendingItem.selectedProduct'),
      variant: value,
      quantity: 0,
      inventory: 0,
      unitCost: 0,
      itemTotalCost: 0,
      isFormCompleted: false,
    }
    
    if (value) {
      const availableInventory = integerDivide(calculateBaseUnitInventory(resetPendingItem.selectedProduct), value.conversionRate);
      const newPendingItem: PendingItemInterface = {
        ...resetPendingItem,
        variant: value,
        unitCost: value.unitCost,
        inventory: availableInventory,
      };
      formMethods.setValue('pendingItem', newPendingItem);
    } else {
      const newPendingItem: PendingItemInterface = {
        ...resetPendingItem,
        variant: null,
        unitCost: 0,
        inventory: 0,
      };
      formMethods.setValue('pendingItem', newPendingItem);
    }
    formMethods.trigger('pendingItem.variant')
  }, [formMethods, calculateBaseUnitInventory]);

  const clearLineItemForm = useCallback(() => {
    const currentPendingItem = formMethods.getValues('pendingItem');
    
    if (currentPendingItem.selectedProduct && products && products.length > 0) {
      // Find next product in the list
      const nextIndex = products.findIndex((p: Product) => p.id === currentPendingItem.selectedProduct.id) + 1;
      const nextProduct = nextIndex === products.length ? products[0] : products[nextIndex];
      
      // Select the next product
      handleSelectProduct(null, nextProduct);
    } else {
      // Reset to empty state if no products or no current product
      const emptyPendingItem: PendingItemInterface = {
        selectedProduct: null,
        variant: null,
        quantity: 0,
        inventory: 0,
        unitCost: 0,
        itemTotalCost: 0,
        isFormCompleted: false,
      };
      formMethods.setValue('pendingItem', emptyPendingItem);
    }
  }, [formMethods, handleSelectProduct, products]);

  const addItemToForm = useCallback((overrideExisting: boolean = false, skipCostCheck: boolean = false) => {
    const prevItems = formMethods.getValues("items");
    const pendingItem = formMethods.getValues('pendingItem');
    
    // Calculate the new balance in base units
    const baseUnitBalance = calculateBaseUnitBalance(pendingItem.selectedProduct, pendingItem.variant, pendingItem.quantity, prevItems);

    // Check if cost has changed and update toggle is enabled
    const costHasChanged = pendingItem.unitCost !== pendingItem.variant.unitCost;
    if (costHasChanged && shouldUpdateProduct && !skipCostCheck) {
      // Return special value to indicate product update needed
      return { needsProductUpdate: true, pendingItem };
    }

    let updatedItems;
    if (overrideExisting) {
      // Remove existing item with same product and unit
      const itemsWithoutDuplicate = prevItems.filter(item => 
        !(item.productID === pendingItem.selectedProduct.id && item.variant.unit.id === pendingItem.variant.unit.id)
      );
      
      const itemsFromSameProduct = itemsWithoutDuplicate.filter(item => item.productID === pendingItem.selectedProduct.id)
      const updatedSameProductItems = itemsFromSameProduct.map(item => {
        return {
          ...item,
          balance: integerDivide(baseUnitBalance, item.variant.conversionRate)
        }
      })
      
      const itemsFromOtherProducts = itemsWithoutDuplicate.filter(item => item.productID !== pendingItem.selectedProduct.id)
      
      updatedItems = [...itemsFromOtherProducts, ...updatedSameProductItems, {
        quantity: pendingItem.quantity,
        unitCost: pendingItem.unitCost,
        variant: pendingItem.variant,
        itemTotalCost: pendingItem.itemTotalCost,
        title: pendingItem.selectedProduct.title,
        productID: pendingItem.selectedProduct.id,
        balance: integerDivide(baseUnitBalance, pendingItem.variant.conversionRate),
        shouldChangeProductUnitCost: false,
      } as InboundOrderItemDataInterface]
    } else {
      // Add as new item (existing logic)
      const itemsFromSameProduct = prevItems.filter(item => item.productID === pendingItem.selectedProduct.id)
      const updatedSameProductItems = itemsFromSameProduct.map(item => {
        return {
          ...item,
          balance: integerDivide(baseUnitBalance, item.variant.conversionRate)
        }
      })
      
      const itemsFromOtherProducts = prevItems.filter(item => item.productID !== pendingItem.selectedProduct.id)
      
      updatedItems = [...itemsFromOtherProducts, ...updatedSameProductItems, {
        quantity: pendingItem.quantity,
        unitCost: pendingItem.unitCost,
        variant: pendingItem.variant,
        itemTotalCost: pendingItem.itemTotalCost,
        title: pendingItem.selectedProduct.title,
        productID: pendingItem.selectedProduct.id,
        balance: integerDivide(baseUnitBalance, pendingItem.variant.conversionRate),
        shouldChangeProductUnitCost: false,
      } as InboundOrderItemDataInterface]
    }

    formMethods.setValue("items", updatedItems)

    const prevTotalCost = formMethods.getValues("totalCost")
    formMethods.setValue("totalCost", add(prevTotalCost, pendingItem.itemTotalCost))

    // Clear the form and select next product
    clearLineItemForm(); 
    
    return { needsProductUpdate: false };
  }, [formMethods, calculateBaseUnitBalance, clearLineItemForm, shouldUpdateProduct]);

  const submitItem = useCallback(() => {
    const prevItems = formMethods.getValues("items");
    const pendingItem = formMethods.getValues('pendingItem');

    const existingItem = prevItems.find(item => item.productID === pendingItem.selectedProduct.id && item.variant.unit.id === pendingItem.variant.unit.id);
    
    if (existingItem) {
      // Return true to indicate duplicate found (UI will handle dialog)
      return true;
    }

    // No duplicate, add normally
    const result = addItemToForm();
    return result;
  }, [formMethods, addItemToForm]);

  const handleProductUpdateConfirm = useCallback(async (updatedProduct: Product) => {
    try {
      // Update the product in the database
      await updateProduct(updatedProduct.id, updatedProduct);
      
      // Update the local product state to reflect changes
      const currentPendingItem = formMethods.getValues('pendingItem');
      formMethods.setValue('pendingItem.selectedProduct', updatedProduct);
      
      const updatedVariant = updatedProduct.variants.find(v => v.unit.id === currentPendingItem.variant.unit.id) ?? updatedProduct.variants[0];
      formMethods.setValue('pendingItem.variant', updatedVariant);
      
      // Add item to form with the updated cost
      addItemToForm(false, true);
      
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      return false;
    }
  }, [formMethods, addItemToForm]);

  const pendingItem = formMethods.watch('pendingItem')

  React.useEffect(() => {
    if (pendingItem.selectedProduct && pendingItem.variant) {
      // Calculate available inventory for this variant
      const availableInventory = integerDivide(calculateBaseUnitInventory(pendingItem.selectedProduct), pendingItem.variant.conversionRate);
      // Update pendingItem with calculated values
      formMethods.setValue('pendingItem.inventory', availableInventory);
      formMethods.setValue('pendingItem.unitCost', pendingItem.variant.unitCost);
    }
  }, [pendingItem.selectedProduct, pendingItem.variant, formMethods, calculateBaseUnitInventory]);

  const itemTotalCost = React.useMemo(() => {
    const totalCost = multiply(pendingItem.unitCost, pendingItem.quantity ?? 0);
    return totalCost;
  }, [pendingItem.quantity, pendingItem.unitCost])

  React.useEffect(() => {
    formMethods.setValue('pendingItem.itemTotalCost', itemTotalCost);
  }, [itemTotalCost, formMethods]);

  React.useEffect(() => {
    formMethods.setValue('pendingItem.isFormCompleted', pendingItem.selectedProduct && pendingItem.variant && pendingItem.quantity > 0 && itemTotalCost > 0)
  }, [pendingItem.selectedProduct, pendingItem.variant, pendingItem.quantity, itemTotalCost, formMethods])

  return {
    ...formMethods,
    products,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onSubmit,
    onDelete,
    inboundOrder,
    reset: formMethods.reset,
    calculateBaseUnitBalance,
    // Line item business logic
    calculateBaseUnitInventory,
    handleSelectProduct,
    handleSelectVariant,
    submitItem,
    addItemToForm,
    clearLineItemForm,
    // Product update functionality
    shouldUpdateProduct,
    setShouldUpdateProduct,
    handleProductUpdateConfirm,
  };
} 