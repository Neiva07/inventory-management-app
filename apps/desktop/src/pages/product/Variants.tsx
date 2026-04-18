import { Autocomplete } from 'components/ui/autocomplete';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useRef } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  FormPrice,
  DEFAULT_PRICE,
  DEFAULT_VARIANT_VALUE,
  ProductFormDataInterface,
  SelectField,
  FormVariant,
} from "./useProductCreateForm";
import { paymentMethods } from "../../model/paymentMethods";
import { getUnits, Unit } from "model/units";
import { useAuth } from "context/auth";
import { add, divide, multiply, subtract } from "lib/math";
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';


type VariantProps = {
  variant: FormVariant;
  formMethods: UseFormReturn<ProductFormDataInterface>;
  index: number;
  focusNextField?: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField?: (currentRef: React.RefObject<HTMLElement>) => void;
  registerVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
  unregisterVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
};

type PriceProps = {
  price: FormPrice;
  formMethods: UseFormReturn<ProductFormDataInterface>;
  index: number;
  parentIndex: number;
  focusNextField?: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField?: (currentRef: React.RefObject<HTMLElement>) => void;
  registerVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
  unregisterVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
};

const Price = ({ formMethods, index, parentIndex, focusNextField, focusPreviousField, registerVariantRef, unregisterVariantRef }: PriceProps) => {
  // Create refs for price fields
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const profitRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  // Register refs when component mounts
  React.useEffect(() => {
    if (registerVariantRef) {
      registerVariantRef(paymentMethodRef);
      registerVariantRef(profitRef);
      registerVariantRef(priceRef);
    }

    // Cleanup when component unmounts
    return () => {
      if (unregisterVariantRef) {
        unregisterVariantRef(paymentMethodRef);
        unregisterVariantRef(profitRef);
        unregisterVariantRef(priceRef);
      }
    };
  }, [registerVariantRef, unregisterVariantRef]);

  const handleRemovePrice = () => {
    const currentPrices = formMethods.getValues(`variants.${parentIndex}.prices`);
    const newPrices = currentPrices.filter((_, i) => i !== index);
    formMethods.setValue(`variants.${parentIndex}.prices`, newPrices);
  };
  const [availablePaymentMethods, setAvailablePaymentMethods] = React.useState<SelectField[]>([]);

  // Watch for unit cost changes to recalculate profit percentages
  const unitCost = formMethods.watch(`variants.${parentIndex}.unitCost`) ?? 0;
  
  // Watch all prices in the current variant to filter payment methods
  const currentPrices = formMethods.watch(`variants.${parentIndex}.prices`) ?? [];
  
  React.useEffect(() => {
    // Get all payment methods that are already used in this variant (excluding current price)
    const usedPaymentMethodsIDs = currentPrices
      .map((price, priceIndex) => {
        if (priceIndex === index) {
          return null; // Don't exclude current price's payment method
        }
        return price.paymentMethod?.value;
      })
      .filter(id => id !== undefined && id !== null && id !== "");
  
    // Start with all available payment methods
    let availableMethods = paymentMethods.map(pm => ({
      label: pm.label,
      value: pm.id,
    } as SelectField));

    // Remove used payment methods (except current one)
    availableMethods = availableMethods.filter(pm => !usedPaymentMethodsIDs.includes(pm.value));

    setAvailablePaymentMethods(availableMethods);
  }, [currentPrices, index]);

  React.useEffect(() => {
    if (unitCost > 0) {
      const currentPrices = formMethods.getValues(`variants.${parentIndex}.prices`);
      let changed = false;
      const updatedPrices = currentPrices.map((price, i) => {
        if (i === index && price.profit !== undefined) {
          const profit = !isNaN(Number(price.profit)) ? Number(price.profit) : 0;
          const newValue = divide(multiply(unitCost, add(profit, 100)), 100);
          if (newValue !== price.value) {
            changed = true;
            return { ...price, value: newValue };
          }
        }
        return price;
      });
      if (changed) {
        formMethods.setValue(`variants.${parentIndex}.prices`, updatedPrices);
      }
    }
    // formMethods is an unstable composite ref from useProductCreateForm;
    // its methods are stable, so it's safe to exclude from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitCost, parentIndex, index]);

  return (
    <div
      className="grid grid-cols-12 gap-2"
      style={{
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      <div className="col-span-3">
        <Controller
          control={formMethods.control}
          render={({ field: { value: paymentMethod, ...props } }) => {
            const handleChange = (
              _: React.SyntheticEvent<Element, Event>,
              value: SelectField | null
            ) => {
              props.onChange(value);
            };
            return (
              <Autocomplete
                {...props}
                id={`variants.${parentIndex}.prices.${index}.paymentMethod`}
                options={availablePaymentMethods}
                isOptionEqualToValue={(option: SelectField, value: SelectField | null) => {
                  // Handle null/undefined values
                  if (!value || !option) {
                    return false;
                  }
                  const isEqual = option.value === value.value;
                  return isEqual;
                }}
                onChange={handleChange}
                value={paymentMethod}
                label="Método de Pagamento"
                ref={paymentMethodRef}
                onNextField={() => focusNextField(paymentMethodRef)}
                onPreviousField={() => focusPreviousField(paymentMethodRef)}
                getOptionLabel={(option: SelectField) => option?.label || ''}
              />
            );
          }}
          name={`variants.${parentIndex}.prices.${index}.paymentMethod`}
        />
      </div>
      <div className="col-span-4">
        <Controller
          control={formMethods.control}
          render={({ field: { value: profit, ...props }, fieldState }) => {
            const currentCost = formMethods.watch(`variants.${parentIndex}.unitCost`) ?? 0
            const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
              props.onChange(event)

              const value = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0
              const finalValue = divide(multiply(currentCost, add(value, 100)), 100)
              formMethods.setValue(`variants.${parentIndex}.prices.${index}.value`, finalValue)
            }
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Lucro %</FieldLabel>
                <Input
                  {...props}
                  ref={profitRef}
                  value={profit}
                  onChange={onChange}
                  aria-invalid={fieldState.invalid}
                  onFocus={(e) => e.target.select()}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
          name={`variants.${parentIndex}.prices.${index}.profit`}
        />
      </div>

      <div className="col-span-4">
        <Controller
          control={formMethods.control}
          render={({ field: props, fieldState }) => {
            const currentCost = formMethods.watch(`variants.${parentIndex}.unitCost`) || 0
            const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
              props.onChange(event)

              const value = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0
              const finalValue = divide(multiply(subtract(value, currentCost), 100),  currentCost)
              formMethods.setValue(`variants.${parentIndex}.prices.${index}.profit`, finalValue)
            }

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Preço</FieldLabel>
                <Input
                  {...props}
                  ref={priceRef}
                  onChange={onChange}
                  aria-invalid={fieldState.invalid}
                  onFocus={(e) => e.target.select()}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
          name={`variants.${parentIndex}.prices.${index}.value`}
        />
      </div>
      <div className="col-span-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive"
          onClick={handleRemovePrice}
          style={{ marginTop: '8px' }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const VariantItem = ({ formMethods, index, focusNextField, focusPreviousField, registerVariantRef, unregisterVariantRef }: VariantProps) => {
  // Create refs for variant fields
  const unitRef = useRef<HTMLDivElement>(null);
  const conversionRateRef = useRef<HTMLInputElement>(null);
  const unitCostRef = useRef<HTMLInputElement>(null);

  // Register refs when component mounts
  React.useEffect(() => {
    if (registerVariantRef) {
      registerVariantRef(unitRef);
      registerVariantRef(conversionRateRef);
      registerVariantRef(unitCostRef);
    }

    // Cleanup when component unmounts
    return () => {
      if (unregisterVariantRef) {
        unregisterVariantRef(unitRef);
        unregisterVariantRef(conversionRateRef);
        unregisterVariantRef(unitCostRef);
      }
    };
  }, [registerVariantRef, unregisterVariantRef]);

  const handleAddPrice = () => {
    formMethods.setValue(`variants.${index}.prices`, [
      ...formMethods.getValues(`variants.${index}.prices`),
      DEFAULT_PRICE,
    ]);
  };

  const handleRemoveVariant = () => {
    const currentOptions = formMethods.getValues('variants');
    const newOptions = currentOptions.filter((_, i) => i !== index);
    formMethods.setValue('variants', newOptions);
  };

  const [units, setUnits] = React.useState<Array<Unit>>([]);
  const { user, organization } = useAuth();

  React.useEffect(() => {
    getUnits(user.id, "", organization?.id).then(qr => setUnits(qr.docs.map(d => d.data() as Unit)));
  }, [organization?.id, user.id])

  // Watch the main cost value
  const mainCost = formMethods.watch('cost') ?? 0;
  const baseUnit = formMethods.watch('baseUnit');
  const currentUnit = formMethods.watch(`variants.${index}.unit`);

  // Auto-set conversion rate to 1 when unit matches base unit
  React.useEffect(() => {
    if (currentUnit?.value && baseUnit?.value && currentUnit.value === baseUnit.value) {
      const current = formMethods.getValues(`variants.${index}.conversionRate`);
      if (current !== 1) {
        formMethods.setValue(`variants.${index}.conversionRate`, 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUnit?.value, baseUnit?.value, index]);

  // Recalculate unit cost when main cost changes
  React.useEffect(() => {
    const conversionRate = formMethods.getValues(`variants.${index}.conversionRate`) ?? 0;
    if (conversionRate > 0) {
      const newUnitCost = multiply(mainCost, conversionRate);
      const current = formMethods.getValues(`variants.${index}.unitCost`);
      if (current !== newUnitCost) {
        formMethods.setValue(`variants.${index}.unitCost`, newUnitCost);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainCost, index]);

  // Calculate unit cost when conversion rate changes
  const handleConversionRateChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const conversionRate = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
    
    // Calculate new unit cost using multiplication (since we're selling larger units)
    const newUnitCost = multiply(mainCost, conversionRate);
    
    // Update the form values
    formMethods.setValue(`variants.${index}.unitCost`, newUnitCost);
  };

  return (
    <div>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <Controller
            control={formMethods.control}
            render={({ field: { value: unit, ...props } }) => {
              const handleChange = (
                _: React.SyntheticEvent<Element, Event>,
                value: SelectField | null
              ) => {
                props.onChange(value);

                // Auto-set conversion rate to 1 if unit matches buy unit
                if (value?.value && baseUnit?.value && value.value === baseUnit.value) {
                  formMethods.setValue(`variants.${index}.conversionRate`, 1);
                }
              };
              return (
                <Autocomplete
                  {...props}
                  id={`variants.${index}.unit`}
                  options={units.map((c) => {
                    return {
                      label: c.description ? `${c.name} (${c.description})` : c.name,
                      value: c.id,
                    } as SelectField;
                  })}
                  getOptionLabel={(option: SelectField) => option.label}
                  isOptionEqualToValue={(option: SelectField, value: SelectField | null) =>
                    option.value === value?.value
                  }
                  onChange={handleChange}
                  value={unit}
                  label="Unidade"
                  ref={unitRef}
                  onNextField={focusNextField ? () => focusNextField(unitRef) : undefined}
                  onPreviousField={focusPreviousField ? () => focusPreviousField(unitRef) : undefined}
                />
              );
            }}
            name={`variants.${index}.unit`}
          />
        </div>
        <div className="col-span-3">
          <Controller
            control={formMethods.control}
            render={({ field: { ...props }, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Conversão</FieldLabel>
                  <Input
                    {...props}
                    ref={conversionRateRef}
                    aria-invalid={fieldState.invalid}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      props.onChange(e);
                      handleConversionRateChange(e);
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
            name={`variants.${index}.conversionRate`}
          />
        </div>
        <div className="col-span-5">
          <Controller
            control={formMethods.control}
            render={({ field: { ...props }, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Custo da unidade</FieldLabel>
                  <Input
                    {...props}
                    ref={unitCostRef}
                    readOnly
                    aria-invalid={fieldState.invalid}
                    onFocus={(e) => e.target.select()}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
            name={`variants.${index}.unitCost`}
          />
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveVariant}
            style={{ marginTop: '8px' }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="col-span-12">
          <Controller
            control={formMethods.control}
            name={`variants.${index}.prices`}
            render={(formControlProps) => {
              return (
                <div
                  style={{
                    marginTop: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {formControlProps.field.value.map((price, i) => {
                    return (
                      <Price
                        key={i}
                        index={i}
                        price={price}
                        formMethods={formMethods}
                        parentIndex={index}
                        focusNextField={focusNextField}
                        focusPreviousField={focusPreviousField}
                        registerVariantRef={registerVariantRef}
                        unregisterVariantRef={unregisterVariantRef}
                      />
                    );
                  })}
                </div>
              );
            }}
          />
        </div>

        <div className="col-span-6" style={{ marginBottom: '16px' }}>
          <Button variant="ghost" onClick={handleAddPrice}>+ preço sugerido</Button>
        </div>
      </div>
    </div>
  );
};

interface VariantsProps extends UseFormReturn<ProductFormDataInterface> {
  focusNextField?: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField?: (currentRef: React.RefObject<HTMLElement>) => void;
  registerVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
  unregisterVariantRef?: (ref: React.RefObject<HTMLElement>) => void;
}

export const Variants = ({
  focusNextField,
  focusPreviousField,
  registerVariantRef,
  unregisterVariantRef,
  ...formMethods
}: VariantsProps) => {
  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + O: Add new variant
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        handleAddNewVariant();
        return;
      }

      // Ctrl/Cmd + P: Add new price to current variant
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        // Add price to the last variant (or first if none exists)
        const currentVariants = formMethods.getValues('variants');
        if (currentVariants.length > 0) {
          const lastVariantIndex = currentVariants.length - 1;
          const currentPrices = formMethods.getValues(`variants.${lastVariantIndex}.prices`);
          formMethods.setValue(`variants.${lastVariantIndex}.prices`, [
            ...currentPrices,
            DEFAULT_PRICE,
          ]);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formMethods]);
  const handleAddNewVariant = () => {
    formMethods.setValue("variants", [
      ...formMethods.getValues("variants"),
      DEFAULT_VARIANT_VALUE,
    ]);
  };

  return (
    <div>
      <h3 className="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">
        Variantes
      </h3>
      <Controller
        control={formMethods.control}
        name="variants"
        render={(formControlProps) => {
          return (
            <>
              {formControlProps.field.value?.map((v, index) => {
                return (
                  <VariantItem
                    key={index}
                    index={index}
                    variant={v}
                    formMethods={formMethods}
                    focusNextField={focusNextField}
                    focusPreviousField={focusPreviousField}
                    registerVariantRef={registerVariantRef}
                    unregisterVariantRef={unregisterVariantRef}
                  />
                );
              })}
            </>
          );
        }}
      />
      <Button variant="ghost" onClick={handleAddNewVariant}>+ variante</Button>
    </div>
  );
};
