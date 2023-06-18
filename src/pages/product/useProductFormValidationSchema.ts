import { useMemo } from "react"
import * as yup from "yup";
import { ProductFormDataInterface } from "./useProductCreateForm";


const useProductFormValidationSchema = () : yup.ObjectSchema<ProductFormDataInterface>=> {
    return useMemo(() => {
      return yup.object().shape({
        productCategory: yup.object().shape({
          label: yup.string().required('A category is required'),
          value: yup.string().required('A category is required'),
        }),
      }) as yup.ObjectSchema<ProductFormDataInterface>;
    }, []);
  };
  

export default useProductFormValidationSchema;