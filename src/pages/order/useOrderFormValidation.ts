import { useMemo } from "react"
import * as yup from "yup";
import { OrderFormDataInterface } from "./useOrderForm";


const useOrderFormValidationSchema = (): yup.ObjectSchema<OrderFormDataInterface> => {
  return useMemo(() => {
    return yup.object().shape({
      customer: yup.object().shape({
        label: yup.string().required('O cliente é obrigatória'),
        value: yup.string().required('O cliente é obrigatória'),
      }),
      // items: yup.array().required(''),
      paymentType: yup.object().shape({
        label: yup.string().required('O tipo de pagamento é obrigatório'),
        value: yup.string().required('O tipo de pagamento é obrigatório'),
      }),
      status: yup.object().shape({
        label: yup.string().required('O status é obrigatório'),
        value: yup.string().required('O status é obrigatório'),
      }),
    }) as yup.ObjectSchema<OrderFormDataInterface>;
  }, []);
};


export default useOrderFormValidationSchema;
