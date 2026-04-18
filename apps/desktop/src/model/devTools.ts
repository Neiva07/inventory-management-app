import { eq } from "drizzle-orm";
import { createAppDb } from "../db/client";
import {
  customers,
  inboundOrders,
  onboardingSessions,
  orders,
  productCategories,
  products,
  suppliers,
  supplierBills,
  units,
  userMemberships,
  organizations,
} from "../db/schema";
import {
  pickOne,
  pickSome,
  randInt,
  randomCompanyName,
  randomDateOffset,
  randomLandlinePhone,
  randomLegalName,
  randomPersonName,
  randomPhone,
  randomProductTitle,
  randomStreet,
} from "../dev/factories";
import { states } from "./region";
import { createCustomer, deleteCustomer, getCustomers, type Customer } from "./customer";
import {
  createProductCategories,
  deleteProductCategory,
  getProductCategories,
  type ProductCategory,
} from "./productCategories";
import { createProduct, deleteProduct, getProducts, type Product, type Variant } from "./products";
import { createSupplier, deleteSupplier, getSuppliers, type Supplier } from "./suppliers";
import { createUnit, deleteUnit, getUnits, type Unit } from "./units";
import { createOrder, deleteOrder, type Item, type OrderStatus } from "./orders";
import { deleteInboundOrder } from "./inboundOrder";
import { createSupplierBill, deleteSupplierBill, type SupplierBill } from "./supplierBill";
import { paymentMethods } from "./paymentMethods";

interface OrgScope {
  userId: string;
  organizationId: string;
}

/**
 * Dev-only: wipe a user back to a fresh onboarding state.
 *
 * Deletes the user's memberships, any organizations they created (cascades
 * remove units/categories/products/etc.), and any onboarding sessions. After
 * calling this and reloading the app, the user lands in OrganizationSelection
 * and can start the onboarding flow from scratch.
 */
export const resetUserOnboarding = async (userID: string): Promise<void> => {
  const db = createAppDb();

  await db.delete(userMemberships).where(eq(userMemberships.userId, userID));
  await db.delete(organizations).where(eq(organizations.createdBy, userID));
  await db.delete(onboardingSessions).where(eq(onboardingSessions.userId, userID));
};

/**
 * Dev-only: wipe all business data inside an organization while keeping
 * the organization row, memberships, and onboarding session intact.
 *
 * Deletes go through the model delete functions so the sync queue gets
 * populated and the cloud eventually mirrors the cleanup.
 */
export const wipeOrganizationData = async (organizationId: string): Promise<void> => {
  const db = createAppDb();

  const billRows = await db
    .select({ id: supplierBills.id })
    .from(supplierBills)
    .where(eq(supplierBills.organizationId, organizationId));
  for (const { id } of billRows) {
    await deleteSupplierBill(id);
  }

  const orderRows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.organizationId, organizationId));
  for (const { id } of orderRows) {
    await deleteOrder(id);
  }

  const inboundRows = await db
    .select({ id: inboundOrders.id })
    .from(inboundOrders)
    .where(eq(inboundOrders.organizationId, organizationId));
  for (const { id } of inboundRows) {
    await deleteInboundOrder(id);
  }

  const productRows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.organizationId, organizationId));
  for (const { id } of productRows) {
    await deleteProduct(id);
  }

  const customerRows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.organizationId, organizationId));
  for (const { id } of customerRows) {
    await deleteCustomer(id);
  }

  const supplierRows = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(eq(suppliers.organizationId, organizationId));
  for (const { id } of supplierRows) {
    await deleteSupplier(id);
  }

  const categoryRows = await db
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(eq(productCategories.organizationId, organizationId));
  for (const { id } of categoryRows) {
    await deleteProductCategory(id);
  }

  const unitRows = await db
    .select({ id: units.id })
    .from(units)
    .where(eq(units.organizationId, organizationId));
  for (const { id } of unitRows) {
    await deleteUnit(id);
  }
};

const ensureUnits = async ({ userId, organizationId }: OrgScope): Promise<Unit[]> => {
  const snap = await getUnits(userId, "", organizationId);
  const existing = snap.docs.map((d) => d.data() as Unit);
  if (existing.length > 0) {
    return existing;
  }

  const names = ["Unidade", "Caixa", "Pacote", "Quilograma"];
  for (const name of names) {
    await createUnit({
      userID: userId,
      organizationId,
      name,
      description: `${name} — semeado automaticamente`,
      status: "active",
    });
  }
  const reloaded = await getUnits(userId, "", organizationId);
  return reloaded.docs.map((d) => d.data() as Unit);
};

const ensureCategories = async ({ userId, organizationId }: OrgScope): Promise<ProductCategory[]> => {
  const snap = await getProductCategories(userId, "", organizationId);
  const existing = snap.docs.map((d) => d.data() as ProductCategory);
  if (existing.length > 0) {
    return existing;
  }

  const names = ["Mercearia", "Bebidas", "Limpeza", "Laticínios", "Padaria"];
  for (const name of names) {
    await createProductCategories({
      userID: userId,
      organizationId,
      name,
      description: `${name} — semeado automaticamente`,
      status: "active",
    });
  }
  const reloaded = await getProductCategories(userId, "", organizationId);
  return reloaded.docs.map((d) => d.data() as ProductCategory);
};

const seededAddress = () => {
  const state = pickOne(states);
  return {
    region: state.code,
    country: "Brazil",
    street: randomStreet(),
    city: state.name,
    postalCode: "",
  };
};

const seedSuppliers = async (
  scope: OrgScope,
  availableCategories: ProductCategory[],
  count: number
): Promise<Supplier[]> => {
  for (let i = 0; i < count; i++) {
    const tradeName = randomCompanyName();
    await createSupplier({
      userID: scope.userId,
      organizationId: scope.organizationId,
      tradeName,
      legalName: randomLegalName(),
      entityID: "",
      description: `Fornecedor semeado — ${tradeName}`,
      status: "active",
      address: seededAddress(),
      companyPhone: randomLandlinePhone(),
      contactPhone: randomPhone(),
      contactName: randomPersonName(),
      daysToPay: pickOne([7, 15, 21, 30, 45]),
      productCategories: pickSome(availableCategories, randInt(1, Math.min(3, availableCategories.length))).map((c) => ({
        id: c.id,
        name: c.name,
      })),
    } as Supplier);
  }
  const snap = await getSuppliers({ pageSize: 1000, userID: scope.userId, organizationId: scope.organizationId });
  return snap[0].docs.map((d) => d.data() as Supplier);
};

const seedCustomers = async (scope: OrgScope, count: number): Promise<Customer[]> => {
  for (let i = 0; i < count; i++) {
    const name = randomPersonName();
    await createCustomer({
      userID: scope.userId,
      organizationId: scope.organizationId,
      name,
      status: "active",
      address: seededAddress(),
      companyPhone: randomLandlinePhone(),
      contactPhone: randomPhone(),
      contactName: name,
      cpf: "",
      rg: "",
    } as Customer);
  }
  const snap = await getCustomers({ pageSize: 1000, userID: scope.userId, organizationId: scope.organizationId });
  return snap[0].docs.map((d) => d.data() as Customer);
};

const buildDefaultVariant = (unit: Unit, unitCost: number, unitPrice: number): Variant => ({
  unit: { id: unit.id, name: unit.name },
  conversionRate: 1,
  unitCost,
  totalCost: unitCost,
  prices: [
    {
      profit: Math.max(unitPrice - unitCost, 0),
      value: unitPrice,
      paymentMethod: pickOne(paymentMethods),
    },
  ],
});

const seedProducts = async (
  scope: OrgScope,
  availableUnits: Unit[],
  availableCategories: ProductCategory[],
  availableSuppliers: Supplier[],
  count: number,
  options: { inventoryOverride?: number; minInventoryOverride?: number } = {}
): Promise<Product[]> => {
  for (let i = 0; i < count; i++) {
    const title = randomProductTitle();
    const baseUnit = pickOne(availableUnits);
    const category = availableCategories.length ? pickOne(availableCategories) : null;
    const supplier = availableSuppliers.length ? pickOne(availableSuppliers) : null;
    const unitCost = randInt(2, 40);
    const unitPrice = unitCost + randInt(1, 20);
    const inventory = options.inventoryOverride ?? randInt(10, 500);
    const minInventory = options.minInventoryOverride ?? randInt(5, 30);

    await createProduct({
      userID: scope.userId,
      organizationId: scope.organizationId,
      title,
      description: `Produto semeado — ${title}`,
      status: "active",
      inventory,
      baseUnit: { id: baseUnit.id, name: baseUnit.name },
      weight: randInt(100, 5000),
      minInventory,
      cost: unitCost,
      sailsmanComission: 0,
      productCategory: category ? { id: category.id, name: category.name } : {},
      suppliers: supplier
        ? [{ supplierID: supplier.id, name: supplier.tradeName, description: "", status: "active" }]
        : [],
      variants: [buildDefaultVariant(baseUnit, unitCost, unitPrice)],
    });
  }
  const [productRows] = await getProducts({ pageSize: 1000, userID: scope.userId, organizationId: scope.organizationId });
  return productRows;
};

const buildOrderItem = (product: Product): Item => {
  const variant = product.variants[0];
  const quantity = randInt(1, 10);
  const unitPrice = variant.prices[0]?.value ?? product.cost;
  const cost = product.cost;
  const itemTotalCost = unitPrice * quantity;
  return {
    productID: product.id,
    productBaseUnitInventory: product.inventory,
    variant,
    title: product.title,
    balance: 0,
    quantity,
    cost,
    unitPrice,
    itemTotalCost,
    descount: 0,
    commissionRate: 0,
  };
};

const seedOrders = async (
  scope: OrgScope,
  availableCustomers: Customer[],
  availableProducts: Product[],
  count: number
): Promise<void> => {
  if (!availableProducts.length || !availableCustomers.length) {
    return;
  }

  for (let i = 0; i < count; i++) {
    const customer = pickOne(availableCustomers);
    const items = pickSome(availableProducts, randInt(1, 4)).map(buildOrderItem);
    const totalCost = items.reduce((acc, item) => acc + item.itemTotalCost, 0);
    const orderDate = randomDateOffset(-90, -1);
    const status: OrderStatus = pickOne(["request", "complete"]);

    await createOrder({
      userID: scope.userId,
      organizationId: scope.organizationId,
      customer: { id: customer.id, name: customer.name },
      status,
      paymentMethod: { id: "dinheiro", label: "Dinheiro" },
      orderDate,
      dueDate: orderDate + 7 * 24 * 60 * 60 * 1000,
      totalComission: 0,
      items,
      totalCost,
    });
  }
};

/**
 * Seeds a small bakery-style dataset into the org: units, categories,
 * suppliers, customers, products, and a few months of orders.
 */
export const seedSmallBakery = async (scope: OrgScope): Promise<void> => {
  const orgUnits = await ensureUnits(scope);
  const orgCategories = await ensureCategories(scope);
  const orgSuppliers = await seedSuppliers(scope, orgCategories, 5);
  const orgCustomers = await seedCustomers(scope, 10);
  const orgProducts = await seedProducts(scope, orgUnits, orgCategories, orgSuppliers, 12);
  await seedOrders(scope, orgCustomers, orgProducts, 8);
};

/**
 * Creates a handful of supplier bills with due dates already in the past,
 * so the overdue-bills UI can be exercised without real data.
 */
export const seedOverdueBills = async (scope: OrgScope): Promise<void> => {
  const orgCategories = await ensureCategories(scope);
  const snap = await getSuppliers({ pageSize: 1000, userID: scope.userId, organizationId: scope.organizationId });
  let orgSuppliers = snap[0].docs.map((d) => d.data() as Supplier);
  if (orgSuppliers.length === 0) {
    orgSuppliers = await seedSuppliers(scope, orgCategories, 2);
  }

  for (let i = 0; i < 3; i++) {
    const supplier = pickOne(orgSuppliers);
    const totalValue = randInt(200, 3000);
    await createSupplierBill({
      userID: scope.userId,
      organizationId: scope.organizationId,
      supplier: {
        supplierID: supplier.id,
        publicID: supplier.publicId,
        supplierName: supplier.tradeName,
      },
      inboundOrder: { id: "", publicId: "" },
      totalValue,
      initialCashInstallment: 0,
      remainingValue: totalValue,
      startDate: randomDateOffset(-60, -5),
      status: "overdue",
    } as Partial<SupplierBill>);
  }
};

/**
 * Creates a few products whose inventory is below their minimum stock
 * threshold — useful for verifying the out-of-stock listing and alerts.
 */
export const seedOutOfStockProducts = async (scope: OrgScope): Promise<void> => {
  const orgUnits = await ensureUnits(scope);
  const orgCategories = await ensureCategories(scope);
  const snap = await getSuppliers({ pageSize: 1000, userID: scope.userId, organizationId: scope.organizationId });
  const orgSuppliers = snap[0].docs.map((d) => d.data() as Supplier);
  await seedProducts(scope, orgUnits, orgCategories, orgSuppliers, 3, {
    inventoryOverride: 0,
    minInventoryOverride: 10,
  });
};
