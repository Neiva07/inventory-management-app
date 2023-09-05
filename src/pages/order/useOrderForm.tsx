import { useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useOrderFormValidationSchema from './useOrderFormValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { createOrder, Order, OrderStatus, deleteOrder, getOrder, Item, updateOrder } from 'model/orders';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';
import { ProductUnit } from 'model/products';
import { statuses } from './OrderFormHeader';

export interface ItemDataInterface {
  productID: string;
  title: string;
  balance: number;
  quantity: number;
  cost: number;
  unitPrice: number;
  unit: ProductUnit;
  itemTotalCost: number;
  descount: number;
  commissionRate: number;
}

export interface OrderFormDataInterface {
  customer: SelectField;
  paymentType: SelectField;
  dueDate: Date;
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
  paymentType: {
    label: '',
    value: '',
  },
  items: [],
  status: {
    label: '',
    value: ''
  },
  totalComission: 0,
  dueDate: new Date(),
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
    resolver: yupResolver(formValidationSchema),
  });

  const getOrderFormData = React.useCallback(async (orderID?: string) => {

    const doc = await getOrder(orderID)
    const queriedOrder = doc.data() as Order
    setOrder(queriedOrder);

    const orderForm = {
      ...queriedOrder,
      dueDate: new Date(queriedOrder.dueDate),
      customer: {
        label: queriedOrder.customer.name,
        value: queriedOrder.customer.id,
      },
      status: {
        ...statuses.find(s => s.value === queriedOrder.status),
      },
      paymentType: {
        label: queriedOrder.paymentType.name,
        value: queriedOrder.paymentType.id,
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
    const { customer, dueDate, status, paymentType, items, ...rest } = data;

    const order = {
      customer: {
        name: customer.label,
        id: customer.value,
      },
      paymentType: {
        name: paymentType.label,
        id: paymentType.value,
      },
      userID: user.id,
      status: status.value as OrderStatus,
      dueDate: dueDate.getTime(),
      items: items.map(i => ({
        ...i
      } as Item)),
      ...rest
    } as Order
    console.log(orderID, order)

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

  const onDelete = useCallback(() => {
    try {
      deleteOrder(orderID)
      toast.success('Venda deletada com sucesso', {
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
  }, [orderID])

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onDelete,
    order,
  };
}
