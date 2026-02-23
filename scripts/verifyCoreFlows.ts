import "dotenv/config";
import { bootstrapDatabase } from "../src/db/bootstrap";
import { createAppDb } from "../src/db/client";
import { organizations, users } from "../src/db/schema";
import { createCustomer, Customer, getCustomers } from "../src/model/customer";
import {
  calcInboundOrderItemTotalCost,
  calcInboundOrderTotalCost,
  createInboundOrder,
  InboundOrder,
  InboundOrderItem,
  InboundOrderPayment,
} from "../src/model/inboundOrder";
import { calcItemTotalCost, calcOrderTotalCost, createOrder, getOrders, Item, Order } from "../src/model/orders";
import { PaymentMethod, paymentMethodById } from "../src/model/paymentMethods";
import { createProduct, getProduct, getProducts, Product, ProductUnit, Variant } from "../src/model/products";
import { createProductCategories, getProductCategories, ProductCategory } from "../src/model/productCategories";
import { createSupplier, getSuppliers, Supplier } from "../src/model/suppliers";
import { createUnit, getUnits, Unit } from "../src/model/units";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureScope(userId: string, organizationId: string): Promise<void> {
  const db = createAppDb();
  const now = Date.now();

  await db.insert(users).values({
    id: userId,
    email: `${userId}@example.com`,
    fullName: "Parity Verification User",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  await db.insert(organizations).values({
    id: organizationId,
    name: `Parity Verification Org ${organizationId}`,
    createdBy: userId,
    status: "active",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });
}

function requiredPaymentMethod(id: string): PaymentMethod {
  return {
    id,
    label: paymentMethodById.get(id) ?? id,
  };
}

async function main(): Promise<void> {
  await bootstrapDatabase();

  const runId = Date.now().toString();
  const userId = `parity-user-${runId}`;
  const organizationId = `parity-org-${runId}`;

  await ensureScope(userId, organizationId);

  const unitName = `Parity Unit ${runId}`;
  await createUnit({
    userID: userId,
    organizationId,
    name: unitName,
    description: "Parity check unit",
    status: "active",
  });

  const unitsSnapshot = await getUnits(userId, "Parity Unit", organizationId);
  const baseUnit = unitsSnapshot.docs.map((doc) => doc.data() as Unit).find((unit) => unit.name === unitName);
  assert(baseUnit, "Unit was not created.");

  const categoryName = `Parity Category ${runId}`;
  await createProductCategories({
    userID: userId,
    organizationId,
    name: categoryName,
    description: "Parity check category",
    status: "active",
  });

  const categoriesSnapshot = await getProductCategories(userId, "Parity Category", organizationId);
  const category = categoriesSnapshot.docs
    .map((doc) => doc.data() as ProductCategory)
    .find((item) => item.name === categoryName);
  assert(category, "Product category was not created.");

  const supplierTradeName = `Parity Supplier ${runId}`;
  await createSupplier({
    userID: userId,
    organizationId,
    tradeName: supplierTradeName,
    status: "active",
    productCategories: [{ id: category.id, name: category.name }],
  } as Supplier);

  const [suppliersSnapshot] = await getSuppliers({
    userID: userId,
    organizationId,
    tradeName: "Parity Supplier",
    pageSize: 20,
  });
  const supplier = suppliersSnapshot.docs
    .map((doc) => doc.data() as Supplier)
    .find((item) => item.tradeName === supplierTradeName);
  assert(supplier, "Supplier was not created.");

  const customer = await createCustomer({
    userID: userId,
    organizationId,
    name: `Parity Customer ${runId}`,
    status: "active",
  } as Customer);
  assert(customer.id, "Customer creation did not return an ID.");

  const productTitle = `Parity Product ${runId}`;
  const baseVariant: Variant = {
    unit: {
      id: baseUnit.id,
      name: baseUnit.name,
    },
    conversionRate: 1,
    unitCost: 8,
    totalCost: 8,
    prices: [
      {
        paymentMethod: requiredPaymentMethod("pix"),
        profit: 2,
        value: 10,
      },
    ],
  };

  await createProduct({
    userID: userId,
    organizationId,
    title: productTitle,
    description: "Parity product",
    status: "active",
    inventory: 100,
    cost: 8,
    sailsmanComission: 0,
    baseUnit: {
      id: baseUnit.id,
      name: baseUnit.name,
    } as ProductUnit,
    productCategory: {
      id: category.id,
      name: category.name,
    },
    suppliers: [
      {
        supplierID: supplier.id,
        name: supplier.tradeName,
        description: "",
        status: "active",
      },
    ],
    variants: [baseVariant],
    weight: 1,
    minInventory: 1,
  } as Product);

  const [productRows] = await getProducts({
    userID: userId,
    organizationId,
    pageSize: 20,
    title: "Parity Product",
    status: "active",
  });
  const product = productRows.find((row) => row.title === productTitle);
  assert(product, "Product was not created.");

  const makeOrderItem = (quantity: number): Item => {
    const unitPrice = baseVariant.prices[0].value;
    const itemTotalCost = calcItemTotalCost({
      unitPrice,
      quantity,
      descount: 0,
    });

    return {
      productID: product.id,
      productBaseUnitInventory: product.inventory,
      variant: product.variants[0],
      title: product.title,
      balance: product.inventory - quantity,
      quantity,
      cost: 8,
      unitPrice,
      itemTotalCost,
      descount: 0,
      commissionRate: 0,
    };
  };

  const createOrderByStatus = async (status: "request" | "complete", quantity: number): Promise<void> => {
    const items = [makeOrderItem(quantity)];
    const order: Partial<Order> = {
      userID: userId,
      organizationId,
      customer: { id: customer.id, name: customer.name },
      paymentMethod: requiredPaymentMethod("pix"),
      orderDate: Date.now(),
      dueDate: Date.now() + 86_400_000,
      status,
      items,
      totalComission: 0,
      totalCost: calcOrderTotalCost({ items } as Order),
    };
    await createOrder(order);
  };

  await createOrderByStatus("complete", 2);
  await sleep(10);
  await createOrderByStatus("request", 1);
  await sleep(10);
  await createOrderByStatus("request", 1);

  const productAfterOrders = await getProduct(product.id);
  assert(productAfterOrders, "Product lookup failed after order creation.");
  assert(productAfterOrders.inventory === 98, `Expected inventory 98 after complete order, got ${productAfterOrders.inventory}.`);

  const inboundItem: InboundOrderItem = {
    productID: product.id,
    productBaseUnitInventory: productAfterOrders.inventory,
    variant: product.variants[0],
    title: product.title,
    balance: productAfterOrders.inventory + 5,
    quantity: 5,
    unitCost: 7,
    itemTotalCost: calcInboundOrderItemTotalCost({ unitCost: 7, quantity: 5 }),
  };

  const inboundOrder: Partial<InboundOrder> = {
    userID: userId,
    organizationId,
    supplier: { id: supplier.id, name: supplier.tradeName },
    status: "complete",
    orderDate: Date.now(),
    dueDate: Date.now() + 86_400_000,
    items: [inboundItem],
    payments: [
      {
        method: requiredPaymentMethod("pix"),
        amount: calcInboundOrderItemTotalCost({ unitCost: 7, quantity: 5 }),
      } as InboundOrderPayment,
    ],
    totalCost: calcInboundOrderTotalCost({ items: [inboundItem], payments: [] } as InboundOrder),
  };
  await createInboundOrder(inboundOrder);

  const productAfterInbound = await getProduct(product.id);
  assert(productAfterInbound.inventory === 103, `Expected inventory 103 after inbound order, got ${productAfterInbound.inventory}.`);

  const requestOrdersPageOne = await getOrders({
    userID: userId,
    organizationId,
    status: "request",
    pageSize: 1,
  });
  assert(requestOrdersPageOne.count.count >= 2, `Expected at least 2 request orders, got ${requestOrdersPageOne.count.count}.`);
  assert(requestOrdersPageOne.orders.length === 1, "Request order pagination page 1 should return exactly 1 order.");

  const requestOrdersPageTwo = await getOrders({
    userID: userId,
    organizationId,
    status: "request",
    pageSize: 1,
    cursor: requestOrdersPageOne.orders[0],
  });
  assert(requestOrdersPageTwo.orders.length >= 1, "Request order pagination page 2 did not return records.");

  const customerFilteredOrders = await getOrders({
    userID: userId,
    organizationId,
    status: "request",
    customerID: customer.id,
    pageSize: 20,
  });
  assert(
    customerFilteredOrders.orders.every((order) => order.customer.id === customer.id),
    "Customer filter returned orders from a different customer."
  );

  const [customersSnapshot] = await getCustomers({
    userID: userId,
    organizationId,
    pageSize: 20,
    name: "Parity Customer",
  });
  const parityCustomers = customersSnapshot.docs.map((doc) => doc.data() as Customer);
  assert(parityCustomers.some((item) => item.id === customer.id), "Customer list filter did not include created customer.");

  console.log("✅ Core migration parity checks passed.");
}

main().catch((error) => {
  console.error("❌ Core flow verification failed:", error);
  process.exit(1);
});
