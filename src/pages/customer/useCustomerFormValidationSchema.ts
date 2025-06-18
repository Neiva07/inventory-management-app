import { useMemo } from "react"
import * as yup from "yup";
import { CustomerFormDataInterface } from "./useCustomerForm";


const useSupplierFormValidationSchema = (): yup.ObjectSchema<CustomerFormDataInterface> => {
  return useMemo(() => {
    return yup.object().shape({
      name: yup.string().required('O nome do fornecedor é obrigatório'),
      phone: yup.string().optional().transform(val => {
        if (!val) return val;
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'Telefone precisa ter 10 ou 11 digitos', val => !val || val.length === 10 || val.length === 11),
    }) as yup.ObjectSchema<CustomerFormDataInterface>;
  }, []);
};


export default useSupplierFormValidationSchema;
