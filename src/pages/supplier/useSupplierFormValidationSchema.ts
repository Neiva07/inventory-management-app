import { useMemo } from "react"
import * as yup from "yup";
import { SupplierFormDataInterface } from "./useSupplierCreateForm";


const useSupplierFormValidationSchema = (): yup.ObjectSchema<SupplierFormDataInterface> => {
  return useMemo(() => {
    return yup.object().shape({
      productCategories: yup.array().of(
        yup.object().shape({
          label: yup.string().required('A categoria é obrigatória'),
          value: yup.string().required('A categoria é obrigatória'),
        })),
      tradeName: yup.string().required('O nome do fornecedor é obrigatório'),
      contactPhone: yup.string().transform(val => {
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'Telefone precisa ter 10 ou 11 digitos', val => val.length === 10 || val.length === 11),

      companyPhone: yup.string().transform(val => {
        return val.replace(/[^0-9]/gi, "");
      })
        .test('len', 'Telefone precisa ter 10 ou 11 digitos', val => val.length === 10 || val.length === 11),
      //Maybe implement it conditionally when user fill something
      // entityID: yup.string().transform(val => {
      //   return val.replace(/[^0-9]/gi, "");
      // })
      //   .test('len', 'CNPJ precisa ter 14 digitos', val => val.length === 14),
      // address: yup.object().shape({
      //   postalCode: yup.string().transform(val => {
      //     return val.replace(/[^0-9]/gi, "");
      //   })
      //     .test('len', 'CEP precisa ter 8 digitos', val => val.length === 8),
      // }),
      //
      daysToPay: yup.number().required('Prazo de credito é obrigatório'),
    }) as yup.ObjectSchema<SupplierFormDataInterface>;
  }, []);
};


export default useSupplierFormValidationSchema;
