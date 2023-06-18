import { FieldValue, FieldValues, useForm } from "react-hook-form";
import  useProductFormValidationSchema  from "./useProductFormValidationSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from "react";
import { Unit, createProduct } from "../../model/products";

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
    minInventory: string;
    title: string;
    description: string;
    productCategory: SelectField; //category entity later
}

const INITIAL_PRODUCT_FORM_STATE = {
    title: "",
    description: "",
    // sellingOptions: [],
    cost: null,
    productCategory: {
        label: "",
        value: "",
    },
    buyUnit: {
        label: "",
        value: "",
    },
} as ProductFormDataInterface;


export const useProductCreateForm = () => {

    const formValidationSchema = useProductFormValidationSchema();
  const formMethods = useForm<ProductFormDataInterface>({
    defaultValues: INITIAL_PRODUCT_FORM_STATE,
    mode: 'onChange',
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = useCallback((data: ProductFormDataInterface) => {

    createProduct({
        productCategory: data.productCategory.value,
        cost: data.cost,
        description: data.description,
        inventory: data.inventory,
        title: data.title,
        // buyUnit: data.buyUnit.value,
        buyUnit: {
            id: "",
            name: "",
        } as Unit,
        userID: "my-id",
        status: "active",
        sellPrices: [],
        weight: data.weight,
    })
  }, [])

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
  }
}