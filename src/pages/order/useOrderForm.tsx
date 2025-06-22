import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useOrderFormValidationSchema from './useOrderFormValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { createOrder, Order, OrderStatus, deleteOrder, getOrder, Item, updateOrder } from 'model/orders';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';
import { Product, Variant } from 'model/products';
import { paymentMethodById } from 'model/paymentMethods';
import { multiply, subtract } from 'lib/math';

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

export interface OrderFormDataInterface {
  customer: SelectField;
  paymentMethod: SelectField;
  dueDate: Date;
  orderDate: Date;
  totalComission: number;
  status: SelectField;
  items: Array<ItemDataInterface>;
  totalCost: number;
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

};

export const useOrderForm = (orderID?: string) => {
  const { user } = useAuth();
  const [fetchedOrderForm, setFetchedOrderForm] = React.useState<OrderFormDataInterface>();
  const [order, setOrder] = React.useState<Order>();

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
    const { customer, dueDate, status, paymentMethod, items, orderDate, ...rest } = data;

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

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onDelete,
    order,
    reset: formMethods.reset,
    calculateBaseUnitBalance,
  };
}
