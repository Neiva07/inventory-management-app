import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import useProductFormValidationSchema from "./useProductFormValidationSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from "react";
import { Product, ProductSupplier, ProductUnit, Variant, createProduct, getProduct, updateProduct, deleteProduct, deactiveProduct, activeProduct } from "../../model/products";
import { ProductCategory } from "../../model/productCategories";
import { PaymentMethod, paymentMethods } from "../../model/paymentMethods";
import { toast } from "react-toastify";
import { useAuth } from "context/auth";

export interface SelectField<T = string> {
  label: string;
  value: T;
}

export interface FormPrice {
  profit: number;
  value: number;
  paymentMethod: SelectField | null;
}

export interface FormVariant {
  unit: SelectField | null;
  conversionRate: number;
  unitCost: number;
  prices: Array<FormPrice>;
}

export interface ProductFormDataInterface {
  variants: Array<FormVariant>;
  weight: number;
  inventory: number; // Inventory in base units
  baseUnit: SelectField | null; // The base unit for inventory tracking
  cost: number; // Cost per base unit
  minInventory: number;
  title: string;
  description: string;
  sailsmanComission: number;
  productCategory: SelectField | null; //category entity later
  suppliers: Array<SelectField>;
}

export const DEFAULT_PRICE: FormPrice = {
  profit: 0,
  value: 0,
  paymentMethod: null,
}

export const DEFAULT_VARIANT_VALUE: FormVariant = {
  unit: null,
  conversionRate: 0,
  unitCost: 0,
  prices: [DEFAULT_PRICE],
}

const INITIAL_PRODUCT_FORM_STATE = {
  title: "",
  description: "",
  variants: [DEFAULT_VARIANT_VALUE],
  cost: 0,
  productCategory: null,
  baseUnit: null,
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
      baseUnit: {
        label: queriedProduct.baseUnit?.name,
        value: queriedProduct.baseUnit?.id,
      },
      inventory: queriedProduct.inventory ?? 0,
      variants: queriedProduct.variants.map(so => {
        return ({
          ...so,
          unit: {
            ...so.unit,
            label: so.unit.name,
            value: so.unit.id,
          },
          prices: so.prices.map(price => {
            return {
              ...price,
              paymentMethod: {
                label: price.paymentMethod?.label,
                value: price.paymentMethod?.id,
              },
            };
          })
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

    const smallestUnit = data.variants.reduce((highest, current) => {
      return (current.conversionRate > highest.conversionRate) ? current : highest;
    }, data.variants[0]);
    try {
      createProduct({
        productCategory: data.productCategory ? {
          name: data.productCategory.label,
          id: data.productCategory.value,
        } as ProductCategory : null,
        cost: Number(data.cost) ?? 0,
        description: data.description,
        inventory: Number(data.inventory) ?? 0,
        title: data.title,
        sailsmanComission: Number(data.sailsmanComission) ?? 0,
        baseUnit: data.baseUnit ? {
          id: data.baseUnit.value,
          name: data.baseUnit.label,
        } as ProductUnit : null,
        status: "active",
        userID: user.id,
        variants: data.variants.map(so => {
          const { unit, ...rest } = so;
          return {
            unit: {
              id: unit.value,
              name: unit.label,
            } as ProductUnit,
            ...rest,
            prices: rest.prices.map(price => ({
              profit: price.profit,
              value: price.value,
              paymentMethod: {
                label: price.paymentMethod.label,
                id: price.paymentMethod.value,
              } as PaymentMethod,
            })),
          } as Variant
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
        baseUnit: data.baseUnit ? {
          id: data.baseUnit.value,
          name: data.baseUnit.label,
        } as ProductUnit : null,
        status: "active",
        variants: data.variants.map(so => {
          const { unit, ...rest } = so;
          return {
            unit: {
              id: unit.value,
              name: unit.label,
            } as ProductUnit,
            ...rest,
            prices: rest.prices.map(price => ({
              profit: price.profit,
              value: price.value,
              paymentMethod: {
                label: price.paymentMethod.label,
                id: price.paymentMethod.value,
              },
            })),
          } as Variant
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
