import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useCustomerFormValidationSchema from './useCustomerFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useState, useEffect } from 'react';
import { activeCustomer, createCustomer, Customer, deactiveCustomer, deleteCustomer, getCustomer, updateCustomer } from '../../model/customer';
import { AddressFormDataInterface } from '../supplier/useSupplierCreateForm';
import { regionByCode, citiesByState } from '../../model/region';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'context/auth';


export interface CustomerFormDataInterface {
  name: string;
  address: AddressFormDataInterface;
  companyPhone?: string;
  contactPhone?: string;
  contactName?: string;
  cpf?: string;
  rg?: string;
}

const INITIAL_CUSTOMER_VALUES: CustomerFormDataInterface = {
  name: '',
  address: {
    postalCode: '',
    region: {
      label: 'Pará',
      value: 'PA',
    } as SelectField,
    city: {
      label: '',
      value: '',
    } as SelectField,
    street: '',
  } as AddressFormDataInterface,
  companyPhone: '',
  contactPhone: '',
  contactName: '',
  rg: '',
  cpf: '',
};

export const useCustomerCreateForm = (customerID?: string) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer>();
  const [fetchedCustomerForm, setFetchedCustomerForm] = useState<CustomerFormDataInterface | null>(null);
  const [availableCities, setAvailableCities] = useState<Array<SelectField>>([]);

  const form = useForm<CustomerFormDataInterface>({
    resolver: yupResolver(useCustomerFormValidationSchema()) as Resolver<CustomerFormDataInterface>,
    defaultValues: INITIAL_CUSTOMER_VALUES,
    mode: 'onBlur',
    shouldFocusError: false,
  });

  const watchedRegion = form.watch('address.region');

  // Update available cities when region changes or when form is reset with fetched data
  useEffect(() => {
    if (watchedRegion?.value) {
      const cities = citiesByState.get(watchedRegion.value) || [];
      const cityOptions = cities.map(city => ({
        label: city,
        value: city,
      }));
      setAvailableCities(cityOptions);
      
      // Clear city selection when region changes (but not when loading existing data)
      if (!fetchedCustomerForm) {
        form.setValue('address.city', { label: '', value: '' });
      }
    } else {
      setAvailableCities([]);
    }
  }, [watchedRegion, form.setValue, fetchedCustomerForm]);

  // Populate cities when form is reset with fetched data
  useEffect(() => {
    if (fetchedCustomerForm?.address?.region?.value) {
      const cities = citiesByState.get(fetchedCustomerForm.address.region.value) || [];
      const cityOptions = cities.map(city => ({
        label: city,
        value: city,
      }));
      setAvailableCities(cityOptions);
    }
  }, [fetchedCustomerForm]);

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
        city: {
          value: queriedCustomer.address.city,
          label: queriedCustomer.address.city,
        },
      },
      companyPhone: queriedCustomer.companyPhone,
      contactPhone: queriedCustomer.contactPhone,
      contactName: queriedCustomer.contactName,
    } as CustomerFormDataInterface

    setFetchedCustomerForm(customerForm);
  }, [customerID]);

  React.useEffect(() => {
    if (customerID) {
      getCustomerFormData(customerID)
    }

  }, [customerID])

  React.useEffect(() => {
    form.reset(fetchedCustomerForm)
  }, [fetchedCustomerForm, form.reset])

  const onSubmit = useCallback((data: CustomerFormDataInterface) => {
    const { address, companyPhone, contactPhone, contactName, rg, cpf, name } = data;

    const { region, city, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedCPF = cpf.replace(/[^0-9]/gi, "");
    const cleanedRG = rg.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");
    try {
      createCustomer({
        address: {
          country: 'Brazil',
          region: region.value,
          city: city.value,
          postalCode: cleanedPostalCode,
          ...restAddress,
        },
        name,
        status: 'active',
        companyPhone: cleanedCompanyPhone,
        contactPhone: cleanedContactPhone,
        contactName,
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
    const { address, companyPhone, contactPhone, contactName, rg, cpf, name } = data;

    const { region, city, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedCPF = cpf.replace(/[^0-9]/gi, "");
    const cleanedRG = rg.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");

    try {
      updateCustomer(customerID, {
        address: {
          country: 'Brazil',
          region: region?.value ?? '',
          city: city?.value ?? '',
          postalCode: cleanedPostalCode,
          ...restAddress,
        },
        name,
        status: 'active',
        companyPhone: cleanedCompanyPhone,
        contactPhone: cleanedContactPhone,
        contactName,
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


  const onDelete = useCallback((onSuccess?: () => void) => {
    try {
      deleteCustomer(customerID)
      toast.success('Cliente deletado com sucesso', {
        position: "bottom-right",
        theme: "colored",
      })
      onSuccess?.()

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        theme: "colored",
      })
    }
  }, [customerID])

  const onDeactivate = useCallback(async () => {
    try {
      await deactiveCustomer(customerID)
      // Re-fetch customer data to update UI
      await getCustomerFormData(customerID)
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

  }, [customerID, getCustomerFormData])

  const onActivate = useCallback(async () => {
    try {
      await activeCustomer(customerID)
      // Re-fetch customer data to update UI
      await getCustomerFormData(customerID)
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

  }, [customerID, getCustomerFormData])


  return {
    form,
    customer,
    availableCities,
    onFormSubmit: form.handleSubmit(onSubmit),
    onFormUpdate: form.handleSubmit(onUpdate),
    onDelete,
    onDeactivate,
    onActivate,
  };
}
