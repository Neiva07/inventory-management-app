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

const INITIAL_SUPPLIER_FORM_STATE: SupplierFormDataInterface = {
  tradeName: '',
  legalName: '',
  description: '',
  address: {
    postalCode: '',
    region: {
      label: '',
      value: '',
    } as SelectField,
    city: '',
    street: '',
  } as AddressFormDataInterface,
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
    mode: 'onBlur',
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, contactPhone, companyPhone, entityID, ...restData } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedEntityID = entityID.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");

    console.log(data)

    createSupplier({
      address: {
        country: 'Brazil',
        region: region.value,
        postalCode: cleanedPostalCode,
        ...restAddress,
      },
      status: 'active',
      entityID: cleanedEntityID,
      companyPhone: cleanedCompanyPhone,
      contactPhone: cleanedContactPhone,
      productCategories: productCategories.map(pc =>
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
