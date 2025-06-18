import { Resolver, useForm } from 'react-hook-form';
import { SelectField } from '../product/useProductCreateForm';
import useSupplierFormValidationSchema from './useSupplierFormValidationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useState, useEffect } from 'react';
import { Supplier, createSupplier, getSupplier, updateSupplier, deleteSupplier, deactiveSupplier, activeSupplier } from '../../model/suppliers';
import { ProductCategory } from '../../model/productCategories';
import { regionByCode, citiesByState } from '../../model/region';
import { toast } from 'react-toastify';
import { useAuth } from 'context/auth';

export interface AddressFormDataInterface {
  city: SelectField;
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
      label: 'Pará',
      value: 'PA',
    } as SelectField,
    city: {
      label: '',
      value: '',
    } as SelectField,
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
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [fetchedSupplierForm, setFetchedSupplierForm] = useState<SupplierFormDataInterface | null>(null);
  const [availableCities, setAvailableCities] = useState<Array<SelectField>>([]);

  const form = useForm<SupplierFormDataInterface>({
    resolver: yupResolver(useSupplierFormValidationSchema()) as Resolver<SupplierFormDataInterface>,
    defaultValues: INITIAL_SUPPLIER_FORM_STATE,
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
      if (!fetchedSupplierForm) {
        form.setValue('address.city', { label: '', value: '' });
      }
    } else {
      setAvailableCities([]);
    }
  }, [watchedRegion, form.setValue, fetchedSupplierForm]);

  // Populate cities when form is reset with fetched data
  useEffect(() => {
    if (fetchedSupplierForm?.address?.region?.value) {
      const cities = citiesByState.get(fetchedSupplierForm.address.region.value) || [];
      const cityOptions = cities.map(city => ({
        label: city,
        value: city,
      }));
      setAvailableCities(cityOptions);
    }
  }, [fetchedSupplierForm]);

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
        city: {
          value: queriedSupplier.address.city,
          label: queriedSupplier.address.city,
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
    form.reset(fetchedSupplierForm)
  }, [fetchedSupplierForm, form.reset])



  const onSubmit = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, contactPhone, companyPhone, entityID, ...restData } = data;

    const { region, city, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedEntityID = entityID.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");

    try {
      createSupplier({
        address: {
          ...restAddress,

          country: 'Brazil',
          region: region.value,
          city: city.value,
          postalCode: cleanedPostalCode,
        },
        status: 'active',
        entityID: cleanedEntityID,
        userID: user.id,
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

      toast.success('Fornecedor registrado com sucesso', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        icon: false,
        theme: "colored",
      })

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        icon: false,
        theme: "colored",
      })
    }

  }, []);

  const onUpdate = useCallback((data: SupplierFormDataInterface) => {
    const { productCategories, address, contactPhone, companyPhone, entityID, ...restData } = data;

    const { region, city, postalCode, ...restAddress } = address;

    const cleanedPostalCode = postalCode.replace(/[^0-9]/gi, "");
    const cleanedEntityID = entityID.replace(/[^0-9]/gi, "");
    const cleanedCompanyPhone = companyPhone.replace(/[^0-9]/gi, "");
    const cleanedContactPhone = contactPhone.replace(/[^0-9]/gi, "");

    try {

      updateSupplier(supplierID, {
        address: {
          country: 'Brazil',
          region: region?.value ?? '',
          city: city?.value ?? '',
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

      toast.success('Fornecedor atualizado com sucesso'
      )

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }
  }, [supplierID]);


  const onDelete = useCallback((onSuccess?: () => void) => {
    try {
      deleteSupplier(supplierID)
      toast.success('Fornecedor deletado com sucesso')
      // Call the success callback (navigation) after successful deletion
      onSuccess?.()

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [supplierID])

  const onDeactivate = useCallback(async () => {
    try {
      await deactiveSupplier(supplierID)
      // Re-fetch supplier data to update UI
      await getSupplierFormData(supplierID)
      toast.success('Fornecedor desativado com sucesso'
      )

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [supplierID, getSupplierFormData])

  const onActivate = useCallback(async () => {
    try {
      await activeSupplier(supplierID)
      // Re-fetch supplier data to update UI
      await getSupplierFormData(supplierID)
      toast.success('Fornecedor ativado com sucesso')

    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }, [supplierID, getSupplierFormData])


  return {
    form,
    supplier,
    availableCities,
    onFormSubmit: form.handleSubmit(onSubmit),
    onFormUpdate: form.handleSubmit(onUpdate),
    onDelete,
    onDeactivate,
    onActivate,
    getSupplierFormData,
    fetchedSupplierForm,
  };
};
