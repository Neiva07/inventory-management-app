import { and, asc, count, eq, gt, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { resolveOrganizationId } from "../db/scope";
import { productCategories, products } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { divide, multiply } from "lib/math";
import { PaymentMethod } from "./paymentMethods";
import { ProductCategory } from "./productCategories";

export interface Variant {
  unit: ProductUnit;
  conversionRate: number;
  unitCost: number;
  prices: Array<Price>;
  totalCost?: number;
}

export interface Price {
  profit: number;
  value: number;
  paymentMethod: PaymentMethod;
}

export interface ProductUnit {
  name: string;
  id: string;
}

export interface ProductSupplier {
  supplierID: string;
  name: string;
  description: string;
  status: string;
}

export interface Product {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  title: string;
  description: string;
  ean?: string;
  ncm?: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  status: string;
  inventory: number;
  baseUnit: ProductUnit;
  variants: Array<Variant>;
  weight: number;
  minInventory?: number;
  cost: number;
  sailsmanComission?: number;
  suppliers: Array<ProductSupplier>;
  productCategory: Partial<ProductCategory>;
}

export interface ProductSearchParams {
  userID: string;
  organizationId?: string;
  cursor?: Product;
  pageSize: number;
  title?: string;
  productCategory?: ProductCategory;
  status?: string;
}

const PRODUCTS_COLLECTION = COLLECTION_NAMES.PRODUCTS;

const convertProductUnitsStore = (productInfo: Partial<Product>): Partial<Product> => {
  return {
    ...productInfo,
    cost: multiply(productInfo.cost ?? 0, 100),
    sailsmanComission: multiply(productInfo.sailsmanComission ?? 0, 100),
    variants: (productInfo.variants ?? []).map((so) => ({
      ...so,
      unitCost: multiply(so.unitCost ?? 0, 100),
      totalCost: multiply(so.totalCost ?? 0, 100),
      prices: (so.prices ?? []).map((p) => ({
        ...p,
        value: multiply(p.value ?? 0, 100),
        profit: multiply(p.profit ?? 0, 100),
      })),
    })),
  };
};

const convertProductUnitsDisplay = (productInfo: Partial<Product>): Partial<Product> => {
  return {
    ...productInfo,
    cost: divide(productInfo.cost ?? 0, 100),
    sailsmanComission: divide(productInfo.sailsmanComission ?? 0, 100),
    variants: (productInfo.variants ?? []).map((so) => ({
      ...so,
      unitCost: divide(so.unitCost ?? 0, 100),
      totalCost: divide(so.totalCost ?? 0, 100),
      prices: (so.prices ?? []).map((p) => ({
        ...p,
        value: divide(p.value ?? 0, 100),
        profit: divide(p.profit ?? 0, 100),
      })),
    })),
  };
};

const mapProductRow = (row: typeof products.$inferSelect): Product => {
  const category = row.productCategoryJson ? (JSON.parse(row.productCategoryJson) as Partial<ProductCategory>) : {};
  const baseUnit = row.baseUnitJson ? (JSON.parse(row.baseUnitJson) as ProductUnit) : ({ id: "", name: "" } as ProductUnit);
  const suppliersData = row.suppliersJson ? (JSON.parse(row.suppliersJson) as Array<ProductSupplier>) : [];
  const variantsData = row.variantsJson ? (JSON.parse(row.variantsJson) as Array<Variant>) : [];

  const product = {
    id: row.id,
    publicId: row.publicId ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description ?? "",
    ean: row.barcode ?? undefined,
    ncm: row.sku ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: row.status,
    inventory: row.inventoryBaseUnit,
    baseUnit,
    variants: variantsData,
    weight: row.weight,
    minInventory: row.minInventory ?? undefined,
    cost: row.costCents,
    sailsmanComission: row.sailsmanCommissionCents,
    suppliers: suppliersData,
    productCategory: category,
  } as Product;

  return convertProductUnitsDisplay(product) as Product;
};

export const getProducts = async (searchParams: ProductSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });
  const title = searchParams.title ?? "";

  const filters = [
    eq(products.organizationId, scopeOrganizationId),
    like(products.title, `${title}%`),
  ];

  if (searchParams.productCategory?.id) {
    filters.push(eq(products.categoryId, searchParams.productCategory.id));
  }

  if (searchParams.status && searchParams.status !== "") {
    filters.push(eq(products.status, searchParams.status));
  }

  if (searchParams.cursor?.title) {
    filters.push(gt(products.title, searchParams.cursor.title));
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...filters))
    .orderBy(asc(products.title))
    .limit(searchParams.pageSize);

  const countFilters = [
    eq(products.organizationId, scopeOrganizationId),
    like(products.title, `${title}%`),
  ];

  if (searchParams.productCategory?.id) {
    countFilters.push(eq(products.categoryId, searchParams.productCategory.id));
  }

  if (searchParams.status && searchParams.status !== "") {
    countFilters.push(eq(products.status, searchParams.status));
  }

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(products)
    .where(and(...countFilters));

  return [rows.map(mapProductRow), { count: totalCount, isEstimated: false }] as const;
};

export const getProduct = async (productID: string) => {
  const db = createAppDb();
  const rows = await db.select().from(products).where(eq(products.id, productID)).limit(1);
  return rows.length ? mapProductRow(rows[0]) : (null as unknown as Product);
};

export const createProduct = async (productInfo: Partial<Product>) => {
  const db = createAppDb();
  const productID = uuidv4();
  const publicId = await generatePublicId(PRODUCTS_COLLECTION);
  const timestamp = Date.now();
  const converted = convertProductUnitsStore(productInfo);

  const userID = productInfo.userID ?? "";
  const organizationId = resolveOrganizationId({ userID, organizationId: productInfo.organizationId });

  const row = {
    id: productID,
    publicId,
    userId: userID,
    organizationId,
    categoryId: productInfo.productCategory?.id,
    supplierId: productInfo.suppliers?.[0]?.supplierID,
    baseUnitId: productInfo.baseUnit?.id,
    title: productInfo.title ?? "",
    sku: productInfo.ncm,
    barcode: productInfo.ean,
    description: productInfo.description ?? "",
    status: productInfo.status ?? "active",
    inventoryBaseUnit: productInfo.inventory ?? 0,
    costCents: (converted.cost as number) ?? 0,
    sailsmanCommissionCents: (converted.sailsmanComission as number) ?? 0,
    weight: productInfo.weight ?? 0,
    minInventory: productInfo.minInventory,
    baseUnitJson: productInfo.baseUnit ? JSON.stringify(productInfo.baseUnit) : null,
    suppliersJson: JSON.stringify(productInfo.suppliers ?? []),
    productCategoryJson: productInfo.productCategory ? JSON.stringify(productInfo.productCategory) : null,
    variantsJson: JSON.stringify(converted.variants ?? []),
  };

  await db.insert(products).values({
    ...row,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "products",
    recordId: productID,
    operation: "create",
    payload: row,
  });
};

export const deleteProduct = async (productID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: products.organizationId }).from(products).where(eq(products.id, productID)).limit(1);

  await db.delete(products).where(eq(products.id, productID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "products",
    recordId: productID,
    operation: "delete",
    payload: { id: productID },
  });
};

export const deactiveProduct = async (productID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: products.organizationId }).from(products).where(eq(products.id, productID)).limit(1);
  await db
    .update(products)
    .set({
      updatedAt: Date.now(),
      status: "inactive",
    })
    .where(eq(products.id, productID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "products",
    recordId: productID,
    operation: "update",
    payload: { id: productID, status: "inactive" },
  });
};

export const activeProduct = async (productID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: products.organizationId }).from(products).where(eq(products.id, productID)).limit(1);
  await db
    .update(products)
    .set({
      updatedAt: Date.now(),
      status: "active",
    })
    .where(eq(products.id, productID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "products",
    recordId: productID,
    operation: "update",
    payload: { id: productID, status: "active" },
  });
};

export const updateProduct = async (productID: string, productInfo: Partial<Product>) => {
  const db = createAppDb();
  const converted = convertProductUnitsStore(productInfo);
  const existing = await db.select({ organizationId: products.organizationId }).from(products).where(eq(products.id, productID)).limit(1);

  const changes = {
    categoryId: productInfo.productCategory?.id,
    supplierId: productInfo.suppliers?.[0]?.supplierID,
    baseUnitId: productInfo.baseUnit?.id,
    title: productInfo.title,
    sku: productInfo.ncm,
    barcode: productInfo.ean,
    description: productInfo.description,
    status: productInfo.status,
    inventoryBaseUnit: productInfo.inventory,
    costCents: converted.cost as number,
    sailsmanCommissionCents: converted.sailsmanComission as number,
    weight: productInfo.weight,
    minInventory: productInfo.minInventory,
    baseUnitJson: productInfo.baseUnit ? JSON.stringify(productInfo.baseUnit) : undefined,
    suppliersJson: productInfo.suppliers ? JSON.stringify(productInfo.suppliers) : undefined,
    productCategoryJson: productInfo.productCategory ? JSON.stringify(productInfo.productCategory) : undefined,
    variantsJson: converted.variants ? JSON.stringify(converted.variants) : undefined,
  };

  await db
    .update(products)
    .set({
      ...changes,
      updatedAt: Date.now(),
    })
    .where(eq(products.id, productID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "products",
    recordId: productID,
    operation: "update",
    payload: changes,
  });
};

export const adjustProductInventory = async (productID: string, deltaBaseUnit: number) => {
  const db = createAppDb();
  const current = await db.select().from(products).where(eq(products.id, productID)).limit(1);
  if (!current.length) {
    return;
  }

  const newInventoryBaseUnit = (current[0].inventoryBaseUnit ?? 0) + deltaBaseUnit;

  await db
    .update(products)
    .set({
      inventoryBaseUnit: newInventoryBaseUnit,
      updatedAt: Date.now(),
    })
    .where(eq(products.id, productID));

  await trackPendingSyncChange({
    organizationId: current[0].organizationId,
    tableName: "products",
    recordId: productID,
    operation: "update",
    payload: { inventoryBaseUnit: newInventoryBaseUnit },
  });
};
