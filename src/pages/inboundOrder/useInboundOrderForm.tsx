import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useInboundOrderFormValidationSchema from './useInboundOrderFormValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { createInboundOrder, InboundOrder, InboundOrderStatus, deleteInboundOrder, getInboundOrder, InboundOrderItem, updateInboundOrder, InboundOrderPayment } from 'model/inboundOrder';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';
import { Product, Variant } from 'model/products';
import { paymentMethodById } from 'model/paymentMethods';
import { multiply, subtract, add } from 'lib/math';

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
};

export const useInboundOrderForm = (inboundOrderID?: string) => {
  const { user } = useAuth();
  const [fetchedInboundOrderForm, setFetchedInboundOrderForm] = React.useState<InboundOrderFormDataInterface>();
  const [inboundOrder, setInboundOrder] = React.useState<InboundOrder>();

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
    const { supplier, dueDate, status, payments, items, orderDate, ...rest } = data;

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

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onSubmit,
    onDelete,
    inboundOrder,
    reset: formMethods.reset,
    calculateBaseUnitBalance,
  };
} 