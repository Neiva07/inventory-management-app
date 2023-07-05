import { useMemo } from "react"
import * as yup from "yup";
import { ProductFormDataInterface } from "./useProductCreateForm";


const useProductFormValidationSchema = () : yup.ObjectSchema<ProductFormDataInterface>=> {
    return useMemo(() => {
      return yup.object().shape({
        productCategory: yup.object().shape({
          label: yup.string().required('A categoria é obrigatória'),
          value: yup.string().required('A categoria é obrigatória'),
        }),
        title: yup.string().required('O nome do produto é obrigatório'),
        buyUnit: yup.object().shape({
            label: yup.string().required('A unidade de compra é obrigatória'),
            value: yup.string().required('A unidade de compra é obrigatória'),
          }),
      }) as yup.ObjectSchema<ProductFormDataInterface>;
    }, []);
  };
  

export default useProductFormValidationSchema;
