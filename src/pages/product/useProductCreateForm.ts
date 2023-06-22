import { FieldValue, FieldValues, useForm } from "react-hook-form";
import  useProductFormValidationSchema  from "./useProductFormValidationSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from "react";
import { Price, ProductCategory, ProductSupplier, ProductUnit, SellingOption, createProduct } from "../../model/products";
import { Supplier } from "../../model/suppliers";

export interface SelectField {
    label: string;
    value: string;
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

export const DEFAULT_PRICE : Price = {
    profit: 0,
    value: 0,
    title: "",
}

export const DEFAULT_SELLING_OPTION_VALUE: FormSellingOption = {
    unit: {
        label: "",
        value: "",
    } ,
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


export const useProductCreateForm = () => {

    const formValidationSchema = useProductFormValidationSchema();
  const formMethods = useForm<ProductFormDataInterface>({
    defaultValues: INITIAL_PRODUCT_FORM_STATE,
    mode: 'onChange',
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = useCallback((data: ProductFormDataInterface) => {

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
        sellingOptions: data.sellingOptions.map(so => {

            const {unit, ...rest} = so;
            return {
                unit: {
                    id: unit.value,
                    name: unit.label,
                } as ProductUnit,
                ...rest,

            } as SellingOption
        }),
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