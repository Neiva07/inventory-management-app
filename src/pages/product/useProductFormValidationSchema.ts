import { useMemo } from "react"
import * as yup from "yup";
import { ProductFormDataInterface } from "./useProductCreateForm";

const useProductFormValidationSchema = () : yup.ObjectSchema<ProductFormDataInterface> => {
    return useMemo(() => {
      return yup.object().shape({
        productCategory: yup.object().shape({
          label: yup.string().required('A categoria é obrigatória'),
          value: yup.string().required('A categoria é obrigatória'),
        }),
        title: yup.string().required('O nome do produto é obrigatório'),
        baseUnit: yup.object().shape({
            label: yup.string().required('A unidade base é obrigatória'),
            value: yup.string().required('A unidade base é obrigatória'),
          }),
        inventory: yup.number().min(0, 'O estoque deve ser maior ou igual a 0').required('O estoque é obrigatório'),
      }) as yup.ObjectSchema<ProductFormDataInterface>;
    }, []);
  };
  

export default useProductFormValidationSchema;
