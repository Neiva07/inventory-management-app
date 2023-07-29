import { useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useCustomerFormValidationSchema from './useCustomerFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { activeCustomer, createCustomer, Customer, deactiveCustomer, deleteCustomer, getCustomer, updateCustomer } from '../../model/customer';
import { AddressFormDataInterface } from '../supplier/useSupplierCreateForm';


export interface CustomerFormDataInterface {
  name: string;
  address: AddressFormDataInterface;
  phone: string;
  cpf: string;
  rg: string;
}

const INITIAL_CUSTOMER_VALUES: CustomerFormDataInterface = {
  name: '',
  address: {
    postalCode: '',
    region: {
      label: '',
      value: '',
    } as SelectField,
    city: '',
    street: '',
  } as AddressFormDataInterface,
  phone: '',
  rg: '',
  cpf: '',
};

export const useCustomerCreateForm = (customerID?: string) => {
  const [fetchedCustomerForm, setFetchedCustomerForm] = React.useState<CustomerFormDataInterface>();
  const [customer, setCustomer] = React.useState<Customer>();

  const formValidationSchema = useCustomerFormValidationSchema();
  const formMethods = useForm<CustomerFormDataInterface>({
    defaultValues: INITIAL_CUSTOMER_VALUES,
    mode: 'onBlur',
    resolver: yupResolver(formValidationSchema),
  });

  const getCustomerFormData = React.useCallback(async (customerID?: string) => {

    const doc = await getCustomer(customerID)
    const queriedCustomer = doc.data() as Customer
    setCustomer(queriedCustomer);

    const customerForm = {
      ...queriedCustomer,
      address: {
        ...queriedCustomer.address,
        region: {
          value: queriedCustomer.address.region,
          label: '',
        },
      },
    } as CustomerFormDataInterface

    setFetchedCustomerForm(customerForm);
  }, [customerID]);

  React.useEffect(() => {
    if (customerID) {
      getCustomerFormData(customerID)
    }

  }, [customerID])

  React.useEffect(() => {
    formMethods.reset(fetchedCustomerForm)
  }, [fetchedCustomerForm])

  const onSubmit = useCallback((data: CustomerFormDataInterface) => {
    const { address, phone, rg, cpf, name } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedCPF = cpf.replace(/[^0-9]/gi, "");
    const cleanedRG = rg.replace(/[^0-9]/gi, "");
    const cleanedPhone = phone.replace(/[^0-9]/gi, "");

    createCustomer({
      address: {
        country: 'Brazil',
        region: region.value,
        postalCode: cleanedPostalCode,
        ...restAddress,
      },
      name,
      status: 'active',
      phone: cleanedPhone,
      cpf: cleanedCPF,
      rg: cleanedRG,
    } as Customer);
  }, []);

  const onUpdate = useCallback((data: CustomerFormDataInterface) => {
    const { address, phone, rg, cpf, name } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedCPF = cpf.replace(/[^0-9]/gi, "");
    const cleanedRG = rg.replace(/[^0-9]/gi, "");
    const cleanedPhone = phone.replace(/[^0-9]/gi, "");


    updateCustomer(customerID, {
      address: {
        country: 'Brazil',
        region: region.value,
        postalCode: cleanedPostalCode,
        ...restAddress,
      },
      name,
      status: 'active',
      phone: cleanedPhone,
      cpf: cleanedCPF,
      rg: cleanedRG,
    } as Customer);

  }, [customerID]);


  const onDelete = useCallback(() => {
    deleteCustomer(customerID)
  }, [customerID])

  const onDeactivate = useCallback(() => {
    deactiveCustomer(customerID)
  }, [customerID])

  const onActivate = useCallback(() => {
    activeCustomer(customerID)
  }, [customerID])


  return {
    ...formMethods,
    onFormSubmit: formMethods.handleSubmit(onSubmit),
    onFormUpdate: formMethods.handleSubmit(onUpdate),
    onDelete,
    onDeactivate,
    onActivate,
    customer,
  };
}
