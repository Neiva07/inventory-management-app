import { FieldValue, FieldValues, useForm } from "react-hook-form";
import  useProductFormValidationSchema  from "./useProductFormValidationSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from "react";
import { ProductCategory, ProductSupplier, ProductUnit, createProduct } from "../../model/products";
import { Supplier } from "../../model/suppliers";

export interface SelectField {
    label: string;
    value: string;
}

export interface Price {
    profit: number;
    price: number;
}

export interface SellingOption {
    unit: SelectField;
    conversionRate: number;
    unitCost: number;
    prices: Array<Price>;
}

export interface ProductFormDataInterface {
    // sellingOptions: Array<SellingOption>;
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

const INITIAL_PRODUCT_FORM_STATE = {
    title: "",
    description: "",
    // sellingOptions: [],
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


export const useProductCreateForm = () => {

    const formValidationSchema = useProductFormValidationSchema();
  const formMethods = useForm<ProductFormDataInterface>({
    defaultValues: INITIAL_PRODUCT_FORM_STATE,
    mode: 'onChange',
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = useCallback((data: ProductFormDataInterface) => {

    console.log('test')
    createProduct({
        productCategory: {
            name: data.productCategory.label,
            id: data.productCategory.value,
        } as ProductCategory,
        cost: data.cost,
        description: data.description,
        inventory: data.inventory,
        title: data.title,
        sailsmanComission: data.sailsmanComission,
        buyUnit: {
            id: data.buyUnit.value,
            name: data.buyUnit.label,
        } as ProductUnit,
        userID: "my-id",
        status: "active",
        sellPrices: [],
        weight: data.weight,
        minInventory: data.minInventory,
        suppliers: data.suppliers.map(s => {
            return {
                name: s.label,
                supplierID: s.value,
            } as ProductSupplier
        })
    })
  }, [])

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
  }
}