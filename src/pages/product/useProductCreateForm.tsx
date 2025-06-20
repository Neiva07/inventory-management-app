import { useForm, UseFormReturn, SubmitHandler, Resolver } from "react-hook-form";
import useProductFormValidationSchema from "./useProductFormValidationSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from "react";
import { Product, Price, ProductSupplier, ProductUnit, SellingOption, createProduct, getProduct, updateProduct, deleteProduct, deactiveProduct, activeProduct } from "../../model/products";
import { ProductCategory } from "../../model/productCategories";
import { toast } from "react-toastify";
import { useAuth } from "context/auth";

export interface SelectField<T = string> {
  label: string;
  value: T;
}

export interface FormSellingOption {
  unit: SelectField;
  conversionRate: number;
  inventory: number;
  unitCost: number;
  prices: Array<Price>;
}

export interface ProductFormDataInterface {
  sellingOptions: Array<FormSellingOption>;
  weight: number;
  inventory: number;
  buyUnit: SelectField;
  cost: number;
  minInventory: number;
  title: string;
  description: string;
  sailsmanComission: number;
  productCategory: SelectField; //category entity later
  suppliers: Array<SelectField>;
}

export const DEFAULT_PRICE: Price = {
  profit: 0,
  value: 0,
  title: "",
}

export const DEFAULT_SELLING_OPTION_VALUE: FormSellingOption = {
  unit: {
    label: "",
    value: "",
  },
  inventory: 0,
  conversionRate: 0,
  unitCost: 0,
  prices: [DEFAULT_PRICE],

}

const INITIAL_PRODUCT_FORM_STATE = {
  title: "",
  description: "",
  sellingOptions: [DEFAULT_SELLING_OPTION_VALUE],
  cost: 0,
  productCategory: {
    label: "",
    value: "",
  },
  buyUnit: {
    label: "",
    value: "",
  },
  weight: 0,
  inventory: 0,
  minInventory: 0,
  sailsmanComission: 0,
  suppliers: [],
} as ProductFormDataInterface;

export const useProductCreateForm = (productID?: string) => {
  const { user } = useAuth();
  const [fetchedProductForm, setFetchedProductForm] = React.useState<ProductFormDataInterface>();
  const [product, setProduct] = React.useState<Product>();

  const formValidationSchema = useProductFormValidationSchema();
  const formMethods = useForm<ProductFormDataInterface>({
    defaultValues: INITIAL_PRODUCT_FORM_STATE,
    mode: 'onChange',
    resolver: yupResolver(formValidationSchema) as Resolver<ProductFormDataInterface>,
  });


  const getFormProductData = React.useCallback(async (productID?: string) => {

    const queriedProduct = await getProduct(productID) as Product

    setProduct(queriedProduct)

    const productForm = {
      ...queriedProduct,
      productCategory: {
        label: queriedProduct.productCategory?.name,
        value: queriedProduct.productCategory?.id,
      },
      buyUnit: {
        label: queriedProduct.buyUnit?.name,
        value: queriedProduct.buyUnit?.id,
      },
      sellingOptions: queriedProduct.sellingOptions.map(so => {
        return ({
          ...so,
          unit: {
            ...so.unit,
            label: so.unit.name,
            value: so.unit.id,
          }

        })

      }),
      suppliers: queriedProduct.suppliers.map(s => ({ value: s.supplierID, label: s.name }))

    } as ProductFormDataInterface

    setFetchedProductForm(productForm);
  }, [productID]);



  React.useEffect(() => {
    if (productID) {
      getFormProductData(productID)
    }

  }, [productID])
  React.useEffect(() => {
    formMethods.reset(fetchedProductForm)
  }, [fetchedProductForm])


  const onSubmit: SubmitHandler<ProductFormDataInterface> = useCallback((data) => {

    try {
      createProduct({
        productCategory: {
          name: data.productCategory.label,
          id: data.productCategory.value,
        } as ProductCategory,
        cost: data.cost,
        description: data.description,
        inventory: Number(data.inventory) ?? 0,
        title: data.title,
        sailsmanComission: data.sailsmanComission,
        buyUnit: {
          id: data.buyUnit.value,
          name: data.buyUnit.label,
        } as ProductUnit,
        status: "active",
        userID: user.id,
        sellingOptions: data.sellingOptions.map(so => {
          const { unit, inventory, ...rest } = so;
          return {
            unit: {
              id: unit.value,
              name: unit.label,
            } as ProductUnit,
            ...rest,
            inventory: Number(inventory) ?? 0,
          } as SellingOption
        }),
        weight: Number(data.weight) ?? 0,
        minInventory: Number(data.minInventory) ?? 0,
        suppliers: data.suppliers.map(s => {
          return {
            name: s.label,
            supplierID: s.value,
          } as ProductSupplier
        })
      })

      toast.success('Produto criado com sucesso')

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [])


  const onUpdate = useCallback((data: ProductFormDataInterface) => {
    try {
      updateProduct(productID, {
        productCategory: {
          name: data.productCategory.label,
          id: data.productCategory.value,
        } as ProductCategory,
        cost: data.cost,
        description: data.description,
        inventory: Number(data.inventory) ?? 0,
        title: data.title,
        sailsmanComission: data.sailsmanComission,
        buyUnit: {
          id: data.buyUnit.value,
          name: data.buyUnit.label,
        } as ProductUnit,
        status: "active",
        sellingOptions: data.sellingOptions.map(so => {
          const { unit, inventory, ...rest } = so;
          return {
            unit: {
              id: unit.value,
              name: unit.label,
            } as ProductUnit,
            ...rest,
            inventory: Number(inventory) ?? 0,
          } as SellingOption
        }),
        weight: Number(data.weight) ?? 0,
        minInventory: Number(data.minInventory) ?? 0,
        suppliers: data.suppliers.map(s => {
          return {
            name: s.label,
            supplierID: s.value,
          } as ProductSupplier
        })
      })
      toast.success('Produto ativado com sucesso')

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [productID])


  const onDelete = useCallback((onSuccess?: () => void) => {
    try {
      deleteProduct(productID);
      toast.success('Produto deletado com sucesso')
      onSuccess?.()

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [productID])

  const onDeactiveProduct = useCallback(async () => {
    try {
      deactiveProduct(productID);
      getFormProductData(productID)
      toast.success('Produto desativado com sucesso')

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [productID, getFormProductData])

  const onActivateProduct = useCallback(async () => {
    try {
      activeProduct(productID);
      getFormProductData(productID)
      toast.success('Produto ativado com sucesso')

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [productID, getFormProductData])


  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onFormUpdate: formMethods.handleSubmit(onUpdate),
    onDelete,
    onDeactiveProduct,
    product,
    onActivateProduct,
  }
}
