import { useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useSupplierFormValidationSchema from './useSupplierFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { Supplier, createSupplier } from '../../model/suppliers';
import { ProductCategory } from '../../model/products';

export interface AddressFormDataInterface {
  city: string;
  region: SelectField; //state
  street: string;
  postalCode: string;
}

export interface SupplierFormDataInterface {
  tradeName: string;
  legalName: string;
  description: string;
  address: AddressFormDataInterface;

  productCategories: Array<SelectField>;
  contactPhone: string;
  companyPhone: string;
  contactName: string;

  entityID: string;
  daysToPay: number;
}

const INITIAL_SUPPLIER_FORM_STATE = {
  tradeName: '',
  legalName: '',
  description: '',
  address: {
    postalCode: '',
    country: '',
    region: {
      label: '',
      value: '',
    },
    city: '',
  },
  productCategories: [] as Array<SelectField>,
  contactName: '',
  entityID: '',
  companyPhone: '',
  contactPhone: '',
  daysToPay: 0,
};

export const useSupplierCreateForm = () => {
  const formValidationSchema = useSupplierFormValidationSchema();
  const formMethods = useForm<SupplierFormDataInterface>({
    defaultValues: INITIAL_SUPPLIER_FORM_STATE,
    mode: 'onChange',
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, ...restData } = data;

    const { region, ...restAddress } = address;

    createSupplier({
      address: {
        country: 'Brazil',
        region: region.value,
        ...restAddress,
      },
      userID: 'my-id',
      status: 'active',
      productCategories: productCategories.map(
        pc =>
          ({
            id: pc.value,
            name: pc.value,
          } as Partial<ProductCategory>),
      ),
      ...restData,
    } as Supplier);
  }, []);

  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
  };
};
