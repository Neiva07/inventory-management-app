import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useOrderFormValidationSchema from './useOrderFormValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useState } from 'react';
import { createOrder, Order, OrderStatus, deleteOrder, getOrder, Item, updateOrder, calcItemTotalCost } from 'model/orders';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';
import { getProducts, Product, Variant } from 'model/products';
import { paymentMethodById } from 'model/paymentMethods';
import { multiply, subtract, add, integerDivide, divide } from 'lib/math';

export const statuses = [
  {
    label: "requisição",
    value: "request",
  },
  {
    label: "venda",
    value: "complete"
  }
]

export interface ItemDataInterface {
  productID: string;
  productBaseUnitInventory: number;
  title: string;
  balance: number;
  quantity: number;
  cost: number;
  unitPrice: number;
  variant: Variant;
  itemTotalCost: number;
  descount: number;
  commissionRate: number;
}

export interface PendingItemInterface {
  selectedProduct: Product | null;
  variant: Variant | null;
  quantity: number;
  inventory: number;
  descount: number;
  unitCost: number;
  productComission: number;
  unitPrice: number;
  itemTotalCost: number;
  isFormCompleted: boolean;
}

export interface OrderFormDataInterface {
  customer: SelectField;
  paymentMethod: SelectField;
  dueDate: Date;
  orderDate: Date;
  totalComission: number;
  status: SelectField;
  items: Array<ItemDataInterface>;
  totalCost: number;
  pendingItem: PendingItemInterface;
}

const INITIAL_ORDER_VALUES: OrderFormDataInterface = {
  customer: {
    label: '',
    value: '',
  },
  paymentMethod: {
    label: paymentMethodById.get('prazo') ?? '',
    value: 'prazo',
  },
  items: [],
  status: statuses[1],
  totalComission: 0,
  orderDate: new Date(),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  totalCost: 0,
  pendingItem: {
    selectedProduct: null,
    variant: null,
    quantity: 0,
    inventory: 0,
    descount: 0,
    unitCost: 0,
    productComission: 0,
    unitPrice: 0,
    itemTotalCost: 0,
    isFormCompleted: false,
  },
};

export const useOrderForm = (orderID?: string) => {
  const { user } = useAuth();
  const [fetchedOrderForm, setFetchedOrderForm] = React.useState<OrderFormDataInterface>();
  const [order, setOrder] = React.useState<Order>();
  const [products, setProducts] = useState<Array<Product>>([]);

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
        formMethods.setValue('pendingItem.unitPrice', queriedProducts[0].variants[0].prices.find(p => p.paymentMethod.id === formMethods.getValues('paymentMethod').value)?.value ?? 0)
      }
    })

  }, [user]);

  React.useEffect(() => {
    queryProducts();
  }, [user]);


  const formValidationSchema = useOrderFormValidationSchema();
  const formMethods = useForm<OrderFormDataInterface>({
    defaultValues: INITIAL_ORDER_VALUES,
    mode: 'onBlur',
    resolver: yupResolver(formValidationSchema) as Resolver<OrderFormDataInterface>,
  });

  const getOrderFormData = React.useCallback(async (orderID?: string) => {

    const queriedOrder = await getOrder(orderID)
    setOrder(queriedOrder);

    const orderForm = {
      ...queriedOrder,
      dueDate: new Date(queriedOrder.dueDate),
      orderDate: new Date(queriedOrder.orderDate),
      customer: {
        label: queriedOrder.customer.name,
        value: queriedOrder.customer.id,
      },
      status: {
        ...statuses.find(s => s.value === queriedOrder.status),
      },
      paymentMethod: {
        label: queriedOrder.paymentMethod.label,
        value: queriedOrder.paymentMethod.id,
      },
      pendingItem: {
        selectedProduct: null,
        variant: null,
        quantity: 0,
        inventory: 0,
        descount: 0,
        unitCost: 0,
        productComission: 0,
        unitPrice: 0,
        itemTotalCost: 0,
        isFormCompleted: false,
      },
    } as OrderFormDataInterface

    setFetchedOrderForm(orderForm);
  }, [orderID]);

  React.useEffect(() => {
    if (orderID) {
      getOrderFormData(orderID)
    }

  }, [orderID])

  React.useEffect(() => {
    formMethods.reset(fetchedOrderForm)
  }, [fetchedOrderForm])

  const onSubmit = useCallback((data: OrderFormDataInterface) => {
    const { customer, dueDate, status, paymentMethod, items, orderDate, pendingItem, ...rest } = data;

    const order = {
      customer: {
        name: customer.label,
        id: customer.value,
      },
      paymentMethod: {
        label: paymentMethod.label,
        id: paymentMethod.value,
      },
      userID: user.id,
      status: status.value as OrderStatus,
      dueDate: dueDate.getTime(),
      orderDate: orderDate.getTime(),
      items: items.map(i => ({
        ...i
      } as Item)),
      ...rest
    } as Order

    try {
      orderID ? updateOrder(orderID, order) : createOrder(order);

      toast.success('Venda realizada com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }
  }, [orderID]);

  const onDelete = useCallback((onSuccess?: () => void) => {
    try {
      deleteOrder(orderID)
      toast.success('Venda deletada com sucesso', {
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
  }, [orderID])

  const calculateBaseUnitBalance = useCallback((product: Product, itemVariant: Variant, submittedItemQuantity: number, items: ItemDataInterface[]) => {
    const prevBalance = items.filter(item => item.productID === product.id).reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory)

    return subtract(prevBalance, multiply(submittedItemQuantity, itemVariant.conversionRate))
  }, [])

  // Line item business logic functions
  const calculateBaseUnitInventory = useCallback((product: Product) => {
    const inventoryWithoutSubmmitedOrder = order ? order.items.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), product.inventory) : product.inventory;
    const items = formMethods.getValues('items')
    return items.filter(item => item.productID === product.id).reduce((acc, item) => subtract(acc, multiply(item.quantity, item.variant.conversionRate)), inventoryWithoutSubmmitedOrder)
  }, [order, formMethods]);

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
      descount: 0,
      unitCost: 0,
      productComission: 0,
      unitPrice: 0,
      itemTotalCost: 0,
      isFormCompleted: false,
    }
    const paymentMethod = formMethods.getValues("paymentMethod");
    
    if (value) {
      const availableInventory = integerDivide(calculateBaseUnitInventory(resetPendingItem.selectedProduct), value.conversionRate);
      const newPendingItem: PendingItemInterface = {
        ...resetPendingItem,
        variant: value,
        unitCost: value.unitCost,
        inventory: availableInventory,
        unitPrice: value.prices.find(p => p.paymentMethod.id === paymentMethod.value)?.value ?? 0,
      };
      formMethods.setValue('pendingItem', newPendingItem);
    } else {
      const newPendingItem: PendingItemInterface = {
        ...resetPendingItem,
        variant: null,
        unitCost: 0,
        inventory: 0,
        unitPrice: 0,
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
        descount: 0,
        unitCost: 0,
        productComission: 0,
        unitPrice: 0,
        itemTotalCost: 0,
        isFormCompleted: false,
      };
      formMethods.setValue('pendingItem', emptyPendingItem);
    }

  }, [formMethods, handleSelectProduct, products]);

  const addItemToForm = useCallback((overrideExisting: boolean = false) => {
    const prevItems = formMethods.getValues("items");
    const pendingItem = formMethods.getValues('pendingItem');
    
    // Calculate the new balance in base units
    const baseUnitBalance = calculateBaseUnitBalance(pendingItem.selectedProduct, pendingItem.variant, pendingItem.quantity, prevItems);

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
        cost: pendingItem.unitCost,
        descount: pendingItem.descount,
        variant: pendingItem.variant,
        unitPrice: pendingItem.unitPrice,
        itemTotalCost: pendingItem.itemTotalCost,
        title: pendingItem.selectedProduct.title,
        productID: pendingItem.selectedProduct.id,
        commissionRate: pendingItem.productComission,
        balance: integerDivide(baseUnitBalance, pendingItem.variant.conversionRate),
      } as ItemDataInterface]
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
        cost: pendingItem.unitCost,
        descount: pendingItem.descount,
        variant: pendingItem.variant,
        unitPrice: pendingItem.unitPrice,
        itemTotalCost: pendingItem.itemTotalCost,
        title: pendingItem.selectedProduct.title,
        productID: pendingItem.selectedProduct.id,
        commissionRate: pendingItem.productComission,
        balance: integerDivide(baseUnitBalance, pendingItem.variant.conversionRate),
      } as ItemDataInterface]
    }

    formMethods.setValue("items", updatedItems)

    const prevCommission = formMethods.getValues("totalComission")
    const prevTotalCost = formMethods.getValues("totalCost")

    formMethods.setValue("totalComission", add(prevCommission, divide(multiply(pendingItem.productComission, pendingItem.itemTotalCost), 100)))
    formMethods.setValue("totalCost", add(prevTotalCost, pendingItem.itemTotalCost))

    // Clear the form and select next product
    clearLineItemForm(); 
    
    // Return a callback to focus the product selection (to be called by the component)
 
  }, [formMethods, calculateBaseUnitBalance, clearLineItemForm]);

  const submitItem = useCallback(() => {
    const prevItems = formMethods.getValues("items");
    const pendingItem = formMethods.getValues('pendingItem');

    const existingItem = prevItems.find(item => item.productID === pendingItem.selectedProduct.id && item.variant.unit.id === pendingItem.variant.unit.id);
    
    if (existingItem) {
      // Return true to indicate duplicate found (UI will handle dialog)
      return true;
    }

    // No duplicate, add normally
    addItemToForm();
    return false;
  }, [formMethods, addItemToForm]);


  const pendingItem = formMethods.watch('pendingItem')
  const paymentMethod = formMethods.watch('paymentMethod')


  React.useEffect(() => {
    if (pendingItem.selectedProduct && pendingItem.variant) {
      // Calculate available inventory for this variant
      const availableInventory = integerDivide(calculateBaseUnitInventory(pendingItem.selectedProduct), pendingItem.variant.conversionRate);
      // Update pendingItem with calculated values
      formMethods.setValue('pendingItem.inventory', availableInventory);
      formMethods.setValue('pendingItem.productComission', pendingItem.selectedProduct.sailsmanComission);
      formMethods.setValue('pendingItem.unitCost', pendingItem.variant.unitCost);
    }
  }, [pendingItem.selectedProduct, pendingItem.variant, paymentMethod, formMethods, calculateBaseUnitInventory]);

 
  const itemTotalCost = React.useMemo(() => {
    const totalCost = calcItemTotalCost({
      unitPrice: pendingItem.unitPrice,
      descount: pendingItem.descount,
      quantity: pendingItem.quantity ?? 0,
    })
    return totalCost

  }, [pendingItem.quantity, pendingItem.descount, pendingItem.unitPrice])

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
    onDelete,
    order,
    reset: formMethods.reset,
    calculateBaseUnitBalance,
    // Line item business logic
    calculateBaseUnitInventory,
    handleSelectProduct,
    handleSelectVariant,
    submitItem,
    addItemToForm,
  };
}
