/**
 * Form-shaped fake data for dev fill buttons.
 *
 * Each factory returns the subset of fields safe to auto-populate for a
 * given form. Select fields that require real DB references (categories,
 * suppliers, units, customers, products) are intentionally left empty so
 * the user still picks them manually.
 */
import { states, citiesByState } from "../model/region";
import type { CustomerFormDataInterface } from "../pages/customer/useCustomerForm";
import type {
  FormPrice,
  FormVariant,
  ProductFormDataInterface,
  SelectField,
} from "../pages/product/useProductCreateForm";
import type { SupplierFormDataInterface } from "../pages/supplier/useSupplierCreateForm";
import type { OrganizationOnboardingData } from "../model/organizationOnboardingSession";
import type { ProductCategory } from "../model/productCategories";
import type { Supplier } from "../model/suppliers";
import type { Unit } from "../model/units";
import { paymentMethods } from "../model/paymentMethods";
import {
  formatCEP,
  formatCNPJ,
  formatPhoneBR,
  pickOne,
  pickSome,
  randInt,
  randomCEP,
  randomCNPJ,
  randomCPF,
  randomCompanyName,
  randomDigits,
  randomEmail,
  randomLandlinePhone,
  randomLegalName,
  randomPersonName,
  randomPhone,
  randomProductTitle,
  randomRG,
  randomStreet,
} from "./factories";

interface PickedLocation {
  stateCode: string;
  stateName: string;
  cityName: string;
}

const pickLocation = (): PickedLocation => {
  const state = pickOne(states);
  const cities = citiesByState.get(state.code) ?? [];
  const cityName = cities.length ? pickOne(cities) : "";
  return { stateCode: state.code, stateName: state.name, cityName };
};

export const makeProductFormValues = (): Partial<ProductFormDataInterface> => {
  const title = randomProductTitle();
  const inventory = randInt(0, 500);
  return {
    title,
    description: `Descrição automática — ${title}`,
    weight: randInt(100, 5000),
    inventory,
    cost: randInt(1, 100),
    minInventory: randInt(0, 20),
    sailsmanComission: randInt(0, 15),
  };
};

interface ProductFormRefs {
  categories: ReadonlyArray<ProductCategory>;
  suppliers: ReadonlyArray<Supplier>;
  units: ReadonlyArray<Unit>;
}

const categoryToSelect = (c: ProductCategory): SelectField => ({
  label: c.name,
  value: c.id,
});

const supplierToSelect = (s: Supplier): SelectField => ({
  label: s.tradeName,
  value: s.id,
});

const unitToSelect = (u: Unit): SelectField => ({
  label: u.name,
  value: u.id,
});

const buildPricesForVariant = (unitCost: number, count: number): Array<FormPrice> => {
  const pickedPaymentMethods = pickSome(
    paymentMethods,
    Math.min(count, paymentMethods.length),
  );
  return pickedPaymentMethods.map((pm) => {
    const profit = randInt(10, 80);
    return {
      profit,
      value: Math.round(unitCost * (1 + profit / 100)),
      paymentMethod: { label: pm.label, value: pm.id },
    };
  });
};

const buildVariant = (unit: Unit | null, cost: number): FormVariant => {
  // Variants represent larger pack sizes (6, 12, 24, 48 of the base unit).
  // Skipping 1 avoids the "unit matches baseUnit -> force conversionRate=1"
  // effect in Variants.tsx stomping on our value.
  const conversionRate = pickOne([6, 12, 24, 48]);
  const unitCost = cost * conversionRate;
  const priceCount = randInt(1, Math.min(3, paymentMethods.length));
  const prices = buildPricesForVariant(unitCost, priceCount);
  return {
    unit: unit ? unitToSelect(unit) : null,
    conversionRate,
    unitCost,
    prices: prices.length ? prices : [{ profit: 0, value: 0, paymentMethod: null }],
  };
};

/**
 * Full product form example including DB-backed selects (category, base
 * unit, suppliers) and 1–3 variants, each with 1–3 priced rows drawn from
 * real payment methods. Variant units are distinct and excluded from the
 * base unit when possible. Falls back to nulls/empty arrays when the
 * matching lookup array is empty.
 */
export const makeProductFormValuesFull = (
  refs: ProductFormRefs,
): ProductFormDataInterface => {
  const base = makeProductFormValues();
  const { categories, suppliers, units } = refs;

  const cost = base.cost ?? randInt(1, 100);

  const baseUnit = units.length ? pickOne(units) : null;
  const variantUnitPool = baseUnit
    ? units.filter((u) => u.id !== baseUnit.id)
    : [...units];
  const maxVariants = Math.max(1, Math.min(3, variantUnitPool.length));
  const variantCount = randInt(1, maxVariants);
  const pickedVariantUnits = variantUnitPool.length
    ? pickSome(variantUnitPool, Math.min(variantCount, variantUnitPool.length))
    : [];

  // If the pool is empty (e.g., only one unit exists), still produce one
  // variant so the Variants section isn't blank — it just reuses the base
  // unit and will end up with conversionRate=1 via the sync effect.
  const variants: Array<FormVariant> =
    pickedVariantUnits.length > 0
      ? pickedVariantUnits.map((u) => buildVariant(u, cost))
      : [buildVariant(baseUnit, cost)];

  return {
    title: base.title ?? "",
    description: base.description ?? "",
    weight: base.weight ?? 0,
    inventory: base.inventory ?? 0,
    cost,
    minInventory: base.minInventory ?? 0,
    sailsmanComission: base.sailsmanComission ?? 0,
    productCategory: categories.length ? categoryToSelect(pickOne(categories)) : null,
    suppliers: suppliers.length
      ? pickSome(suppliers, randInt(1, Math.min(2, suppliers.length))).map(supplierToSelect)
      : [],
    baseUnit: baseUnit ? unitToSelect(baseUnit) : null,
    variants,
  };
};

export const makeCustomerFormValues = (): CustomerFormDataInterface => {
  const name = randomPersonName();
  const { stateCode, stateName, cityName } = pickLocation();
  return {
    name,
    address: {
      street: randomStreet(),
      postalCode: formatCEP(randomCEP()),
      region: { label: stateName, value: stateCode },
      city: { label: cityName, value: cityName },
    },
    companyPhone: formatPhoneBR(randomLandlinePhone()),
    contactPhone: formatPhoneBR(randomPhone()),
    contactName: randomPersonName(),
    cpf: randomCPF(),
    rg: randomRG(),
  };
};

export const makeSupplierFormValues = (): Partial<SupplierFormDataInterface> => {
  const tradeName = randomCompanyName();
  const { stateCode, stateName, cityName } = pickLocation();
  return {
    tradeName,
    legalName: randomLegalName(),
    description: `Descrição automática — ${tradeName}`,
    address: {
      street: randomStreet(),
      postalCode: formatCEP(randomCEP()),
      region: { label: stateName, value: stateCode },
      city: { label: cityName, value: cityName },
    },
    companyPhone: formatPhoneBR(randomLandlinePhone()),
    contactPhone: formatPhoneBR(randomPhone()),
    contactName: randomPersonName(),
    entityID: formatCNPJ(randomCNPJ()),
    daysToPay: pickOne([7, 15, 21, 30, 45]),
  };
};

export const makeOrganizationSetupValues = (): OrganizationOnboardingData["organization"] => {
  const orgName = randomCompanyName();
  const pocName = randomPersonName();
  const { stateName, cityName } = pickLocation();
  const domainBase = orgName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  return {
    name: orgName,
    domain: `${domainBase}.com.br`,
    employeeCount: String(randInt(5, 200)),
    address: randomStreet(),
    city: cityName,
    state: stateName,
    zipCode: formatCEP(randomCEP()),
    organizationPhoneNumber: formatPhoneBR(randomPhone()),
    organizationEmail: randomEmail(orgName),
    pocName,
    pocRole: pickOne(["Gerente", "Sócio", "Diretor", "Proprietário", "Supervisor"]),
    pocPhoneNumber: formatPhoneBR(randomPhone()),
    pocEmail: randomEmail(pocName),
  };
};

export const makeTaxDataSetupValues = (): NonNullable<OrganizationOnboardingData["taxData"]> => ({
  razaoSocial: randomLegalName(),
  cnpj: formatCNPJ(randomCNPJ()),
  ie: randomDigits(9),
  im: randomDigits(9),
  a1Certificate: "",
});

export const makeInviteTeamSetupValues = (): NonNullable<OrganizationOnboardingData["invitations"]> => {
  const count = randInt(2, 4);
  return Array.from({ length: count }, () => {
    const name = randomPersonName();
    return {
      name,
      email: randomEmail(name),
      role: pickOne(["manager", "operator", "viewer"]),
    };
  });
};
