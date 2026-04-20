import { Autocomplete } from 'components/ui/autocomplete';
import { Trash2, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from "react";
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
import { modKey } from "lib/platform";
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';

const PRICE_DOT_COLORS = [
  'bg-emerald-400',
  'bg-blue-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-cyan-400',
];

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
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const profitRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (registerVariantRef) {
      registerVariantRef(paymentMethodRef);
      registerVariantRef(profitRef);
      registerVariantRef(priceRef);
    }

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

  const unitCost = formMethods.watch(`variants.${parentIndex}.unitCost`) ?? 0;
  const currentPrices = formMethods.watch(`variants.${parentIndex}.prices`) ?? [];

  React.useEffect(() => {
    const usedPaymentMethodsIDs = currentPrices
      .map((price, priceIndex) => {
        if (priceIndex === index) {
          return null;
        }
        return price.paymentMethod?.value;
      })
      .filter(id => id !== undefined && id !== null && id !== "");

    let availableMethods = paymentMethods.map(pm => ({
      label: pm.label,
      value: pm.id,
    } as SelectField));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitCost, parentIndex, index]);

  const dotColor = PRICE_DOT_COLORS[index % PRICE_DOT_COLORS.length];

  return (
    <div className="flex items-center gap-3 border border-border/50 rounded-lg px-4 py-3 group hover:bg-muted/50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
      <div className="grid grid-cols-3 gap-3 flex-1">
        <div>
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
        <div>
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
                  <div className="relative">
                    <Input
                      {...props}
                      ref={profitRef}
                      value={profit}
                      onChange={onChange}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
            name={`variants.${parentIndex}.prices.${index}.profit`}
          />
        </div>

        <div>
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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">R$</span>
                    <Input
                      {...props}
                      ref={priceRef}
                      className="pl-9 font-medium"
                      onChange={onChange}
                      aria-invalid={fieldState.invalid}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
            name={`variants.${parentIndex}.prices.${index}.value`}
          />
        </div>
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1.5 rounded-md hover:bg-destructive/10 shrink-0"
        onClick={handleRemovePrice}
        title="Remover preço"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const VariantItem = ({ formMethods, index, focusNextField, focusPreviousField, registerVariantRef, unregisterVariantRef }: VariantProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const unitRef = useRef<HTMLDivElement>(null);
  const conversionRateRef = useRef<HTMLInputElement>(null);
  const unitCostRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (registerVariantRef) {
      registerVariantRef(unitRef);
      registerVariantRef(conversionRateRef);
      registerVariantRef(unitCostRef);
    }

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

  const mainCost = formMethods.watch('cost') ?? 0;
  const baseUnit = formMethods.watch('baseUnit');
  const currentUnit = formMethods.watch(`variants.${index}.unit`);
  const conversionRate = formMethods.watch(`variants.${index}.conversionRate`);
  const unitCost = formMethods.watch(`variants.${index}.unitCost`);
  const prices = formMethods.watch(`variants.${index}.prices`) ?? [];

  React.useEffect(() => {
    if (currentUnit?.value && baseUnit?.value && currentUnit.value === baseUnit.value) {
      const current = formMethods.getValues(`variants.${index}.conversionRate`);
      if (current !== 1) {
        formMethods.setValue(`variants.${index}.conversionRate`, 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUnit?.value, baseUnit?.value, index]);

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

  const handleConversionRateChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const conversionRate = !isNaN(Number(event.target.value)) ? Number(event.target.value) : 0;
    const newUnitCost = multiply(mainCost, conversionRate);
    formMethods.setValue(`variants.${index}.unitCost`, newUnitCost);
  };

  const unitLabel = currentUnit?.label || 'Nova variante';
  const priceCount = prices.length;

  return (
    <div className="border border-border rounded-xl mb-3 overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        tabIndex={-1}
        className="flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-muted/50 transition-colors select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="font-medium text-sm">{unitLabel}</span>
          {conversionRate !== undefined && conversionRate !== null && (
            <span className="text-xs text-muted-foreground font-mono">x{conversionRate}</span>
          )}
          {unitCost !== undefined && unitCost > 0 && (
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              R$ {unitCost}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {priceCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {priceCount} {priceCount === 1 ? 'preço' : 'preços'}
            </span>
          )}
        </div>
      </button>

      {/* Expandable body */}
      {isExpanded && (
        <div className="border-t border-border/50">
          <div className="p-5">
            {/* Variant fields row */}
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4">
                <Controller
                  control={formMethods.control}
                  render={({ field: { value: unit, ...props } }) => {
                    const handleChange = (
                      _: React.SyntheticEvent<Element, Event>,
                      value: SelectField | null
                    ) => {
                      props.onChange(value);
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
              <div className="col-span-2">
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
              <div className="col-span-3">
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
              <div className="col-span-3 flex justify-end pb-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                  onClick={handleRemoveVariant}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remover variante
                </Button>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="my-5 border-t border-dashed border-border" />

            {/* Prices */}
            <div className="space-y-2">
              <Controller
                control={formMethods.control}
                name={`variants.${index}.prices`}
                render={(formControlProps) => {
                  return (
                    <>
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
                    </>
                  );
                }}
              />

              {/* Add price button */}
              <button
                type="button"
                tabIndex={-1}
                className="w-full border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50 transition-all"
                onClick={handleAddPrice}
              >
                + Adicionar preço sugerido
              </button>
            </div>
          </div>
        </div>
      )}
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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        handleAddNewVariant();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
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

  const variants = formMethods.watch('variants') ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Variantes</p>
          {variants.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {variants.length}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">{modKey}+O</kbd> variante
          <span className="mx-2 text-border">|</span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">{modKey}+P</kbd> preço
        </span>
      </div>

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

      {/* Add variant button */}
      <button
        type="button"
        tabIndex={-1}
        className="w-full border border-dashed border-border rounded-xl py-3.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
        onClick={handleAddNewVariant}
      >
        + Nova variante
      </button>
    </div>
  );
};
