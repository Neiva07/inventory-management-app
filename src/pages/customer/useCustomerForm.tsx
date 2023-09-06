import { useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useCustomerFormValidationSchema from './useCustomerFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback } from 'react';
import { activeCustomer, createCustomer, Customer, deactiveCustomer, deleteCustomer, getCustomer, updateCustomer } from '../../model/customer';
import { AddressFormDataInterface } from '../supplier/useSupplierCreateForm';
import { regionByCode } from '../../model/region';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';


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
  const { user } = useAuth();
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
          label: regionByCode.get(queriedCustomer.address.region),
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
    try {
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
        userID: user.id,
        cpf: cleanedCPF,
        rg: cleanedRG,
      } as Customer);

      toast.success('Cliente registrado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }
  }, []);

  const onUpdate = useCallback((data: CustomerFormDataInterface) => {
    const { address, phone, rg, cpf, name } = data;

    const { region, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedCPF = cpf.replace(/[^0-9]/gi, "");
    const cleanedRG = rg.replace(/[^0-9]/gi, "");
    const cleanedPhone = phone.replace(/[^0-9]/gi, "");


    try {
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
      toast.success('Cliente atualizado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })

    }


  }, [customerID]);


  const onDelete = useCallback(() => {
    try {
      deleteCustomer(customerID)
      toast.success('Cliente deletado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }
  }, [customerID])

  const onDeactivate = useCallback(() => {
    try {
      deactiveCustomer(customerID)
      toast.success('Cliente desativado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }

  }, [customerID])

  const onActivate = useCallback(() => {
    try {
      activeCustomer(customerID)
      toast.success('Cliente ativado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }

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
