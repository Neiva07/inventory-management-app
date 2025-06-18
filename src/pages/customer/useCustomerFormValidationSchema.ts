import { useMemo } from "react"
import * as yup from "yup";
import { CustomerFormDataInterface } from "./useCustomerForm";


const useSupplierFormValidationSchema = (): yup.ObjectSchema<CustomerFormDataInterface> => {
  return useMemo(() => {
    return yup.object().shape({
      name: yup.string().required('O nome do cliente é obrigatório'),
      address: yup.object().optional().shape({
        postalCode: yup.string().optional().transform(val => {
          return val.replace(/[^0-9]/gi, "");
        })
          .test('len', 'CEP precisa ter 8 digitos', val => !val || val.length === 8),
        region: yup.object().optional().shape({
          label: yup.string().optional(),
          value: yup.string().optional(),
        }),
        city: yup.object().optional().shape({
          label: yup.string().optional(),
          value: yup.string().optional(),
        }),
        street: yup.string().optional(),
      }),
      companyPhone: yup.string().optional().transform(val => {
        if (!val) return val;
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'Telefone precisa ter 10 ou 11 digitos', val => !val || val.length === 10 || val.length === 11),
      contactPhone: yup.string().optional().transform(val => {
        if (!val) return val;
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'Telefone precisa ter 10 ou 11 digitos', val => !val || val.length === 10 || val.length === 11),
      contactName: yup.string().optional(),
      cpf: yup.string().optional().transform(val => {
        if (!val) return val;
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'CPF precisa ter 11 digitos', val => !val || val.length === 11),
      rg: yup.string().optional().transform(val => {
        if (!val) return val;
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'RG precisa ter 9 digitos', val => !val || val.length === 9),
    }) as yup.ObjectSchema<CustomerFormDataInterface>;
  }, []);
};


export default useSupplierFormValidationSchema;
