import { useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useSupplierFormValidationSchema from './useSupplierFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { Supplier, createSupplier, getSupplier, updateSupplier, deleteSupplier, deactiveSupplier, activeSupplier } from '../../model/suppliers';
import { ProductCategory } from '../../model/productCategories';
import { regionByCode } from '../../model/region';

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

export const useSupplierCreateForm = (supplierID?: string) => {
  const [fetchedSupplierForm, setFetchedSupplierForm] = React.useState<SupplierFormDataInterface>();
  const [supplier, setSupplier] = React.useState<Supplier>();

  const formValidationSchema = useSupplierFormValidationSchema();
  const formMethods = useForm<SupplierFormDataInterface>({
    defaultValues: INITIAL_SUPPLIER_FORM_STATE,
    mode: 'onBlur',
    resolver: yupResolver(formValidationSchema),
  });


  const getSupplierFormData = React.useCallback(async (supplierID?: string) => {

    const doc = await getSupplier(supplierID)
    const queriedSupplier = doc.data() as Supplier
    setSupplier(queriedSupplier);

    const supplierForm = {
      ...queriedSupplier,
      address: {
        ...queriedSupplier.address,
        region: {
          value: queriedSupplier.address.region,
          label: regionByCode.get(queriedSupplier.address.region),
        },
      },
      productCategories: queriedSupplier.productCategories.map(pc => ({
        value: pc.id,
        label: pc.name,
      })),
    } as SupplierFormDataInterface

    setFetchedSupplierForm(supplierForm);
  }, [supplierID]);

  React.useEffect(() => {
    if (supplierID) {
      getSupplierFormData(supplierID)
    }

  }, [supplierID])
  React.useEffect(() => {
    formMethods.reset(fetchedSupplierForm)
  }, [fetchedSupplierForm])



  const onSubmit = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, contactPhone, companyPhone, entityID, ...restData } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedEntityID = entityID.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");


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
        name: pc.label,
      } as Partial<ProductCategory>),
      ),
      ...restData,
    } as Supplier);
  }, []);

  const onUpdate = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, contactPhone, companyPhone, entityID, ...restData } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedEntityID = entityID.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");


    updateSupplier(supplierID, {
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
        name: pc.label,
      } as Partial<ProductCategory>),
      ),
      ...restData,
    } as Supplier);
  }, [supplierID]);


  const onDelete = useCallback(() => {
    deleteSupplier(supplierID)
  }, [supplierID])

  const onDeactivate = useCallback(() => {
    deactiveSupplier(supplierID)
  }, [supplierID])

  const onActivate = useCallback(() => {
    activeSupplier(supplierID)
  }, [supplierID])


  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onFormUpdate: formMethods.handleSubmit(onUpdate),
    onDelete,
    onDeactivate,
    onActivate,
    supplier,
  };
};
