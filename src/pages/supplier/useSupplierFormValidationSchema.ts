import { useMemo } from "react"
import * as yup from "yup";
import { SupplierFormDataInterface } from "./useSupplierCreateForm";


const useSupplierFormValidationSchema = () : yup.ObjectSchema<SupplierFormDataInterface>=> {
    return useMemo(() => {
      return yup.object().shape({
        productCategories: yup.object().shape({
          label: yup.string().required('A categoria é obrigatória'),
          value: yup.string().required('A categoria é obrigatória'),
        }),
        tradeName: yup.string().required('O nome do fornecedor é obrigatório'),
        contactPhone: yup.string().required('Telefone do vendedor é obrigatório'),
        companyPhone: yup.string().required('Telefone do fornecedor é obrigatório'),

        daysToPay:yup.number().required('Prazo de credito é obrigatório'),
      }) as yup.ObjectSchema<SupplierFormDataInterface>;
    }, []);
  };
  

export default useSupplierFormValidationSchema;