import { useMemo } from "react"
import * as yup from "yup";
import { InboundOrderFormDataInterface } from "./useInboundOrderForm";

const useInboundOrderFormValidationSchema = (): yup.ObjectSchema<InboundOrderFormDataInterface> => {
  return useMemo(() => {
    return yup.object().shape({
      supplier: yup.object().shape({
        label: yup.string().required('O fornecedor é obrigatório'),
        value: yup.string().required('O fornecedor é obrigatório'),
      }),
      payments: yup.array().of(
        yup.object().shape({
          method: yup.object().shape({
            label: yup.string().required('O método de pagamento é obrigatório'),
            value: yup.string().required('O método de pagamento é obrigatório'),
          }),
          amount: yup.number().required('O valor é obrigatório').min(0, 'O valor deve ser maior que zero'),
          dueDate: yup.date().optional(),
        })
      ),
      status: yup.object().shape({
        label: yup.string().required('O status é obrigatório'),
        value: yup.string().required('O status é obrigatório'),
      }),
    }) as yup.ObjectSchema<InboundOrderFormDataInterface>;
  }, []);
};

export default useInboundOrderFormValidationSchema; 