import { and, asc, count, eq, gt, inArray, isNull, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { makeDocSnapshot, makeQuerySnapshot } from "../db/firestoreCompat";
import { resolveOrganizationId } from "../db/scope";
import { productCategories, supplierProductCategories, suppliers } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { ProductCategory } from "./productCategories";

export interface Address {
  region: string;
  country: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface Supplier {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  tradeName: string;
  legalName?: string;
  entityID?: string;
  description?: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  deleted?: {
    date: Date | number;
    isDeleted: boolean;
  }
  status: string;
  address?: Address;
  daysToPay?: number;
  companyPhone?: string;
  contactPhone?: string;
  productCategories: Array<Partial<ProductCategory>>;
  contactName?: string;
}

interface SuppliersSearchParams {
  userID: string;
  organizationId?: string;
  tradeName?: string;
  status?: string;
  cursor?: Supplier;
  pageSize: number;
  productCategory?: ProductCategory;
}

const SUPPLIERS_COLLECTION = COLLECTION_NAMES.SUPPLIERS;

const mapSupplierBase = (row: typeof suppliers.$inferSelect): Supplier => ({
  id: row.id,
  publicId: row.publicId ?? "",
  userID: row.userId,
  organizationId: row.organizationId,
  tradeName: row.tradeName,
  legalName: row.legalName ?? undefined,
  entityID: row.entityId ?? undefined,
  description: row.notes ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deleted: {
    isDeleted: row.deletedAt !== null,
    date: row.deletedAt ?? 0,
  },
  status: row.status,
  address: row.addressJson ? (JSON.parse(row.addressJson) as Address) : undefined,
  daysToPay: row.daysToPay ?? undefined,
  companyPhone: row.companyPhone ?? undefined,
  contactPhone: row.contactPhone ?? undefined,
  contactName: row.contactName ?? undefined,
  productCategories: [],
});

const loadSupplierCategories = async (supplierIds: string[]) => {
  const db = createAppDb();
  if (!supplierIds.length) {
    return new Map<string, Array<Partial<ProductCategory>>>();
  }

  const rows = await db
    .select({
      supplierId: supplierProductCategories.supplierId,
      categoryId: productCategories.id,
      categoryName: productCategories.name,
    })
    .from(supplierProductCategories)
    .innerJoin(productCategories, eq(supplierProductCategories.categoryId, productCategories.id))
    .where(inArray(supplierProductCategories.supplierId, supplierIds));

  const map = new Map<string, Array<Partial<ProductCategory>>>();
  rows.forEach((row) => {
    const value = map.get(row.supplierId) ?? [];
    value.push({ id: row.categoryId, name: row.categoryName });
    map.set(row.supplierId, value);
  });

  return map;
};

export const getSuppliers = async (searchParams: SuppliersSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const title = searchParams.tradeName ?? "";
  const filters = [
    eq(suppliers.organizationId, scopeOrganizationId),
    isNull(suppliers.deletedAt),
    like(suppliers.tradeName, `${title}%`),
  ];

  if (searchParams.status && searchParams.status !== "") {
    filters.push(eq(suppliers.status, searchParams.status));
  }

  if (searchParams.cursor?.tradeName) {
    filters.push(gt(suppliers.tradeName, searchParams.cursor.tradeName));
  }

  if (searchParams.productCategory?.id) {
    const filteredSupplierIds = await db
      .select({ supplierId: supplierProductCategories.supplierId })
      .from(supplierProductCategories)
      .where(eq(supplierProductCategories.categoryId, searchParams.productCategory.id));

    const ids = filteredSupplierIds.map((row) => row.supplierId);
    if (!ids.length) {
      return [makeQuerySnapshot<Supplier>([]), { count: 0, isEstimated: false }] as const;
    }
    filters.push(inArray(suppliers.id, ids));
  }

  const rows = await db
    .select()
    .from(suppliers)
    .where(and(...filters))
    .orderBy(asc(suppliers.tradeName))
    .limit(searchParams.pageSize);

  const countFilters = [
    eq(suppliers.organizationId, scopeOrganizationId),
    isNull(suppliers.deletedAt),
    like(suppliers.tradeName, `${title}%`),
  ];

  if (searchParams.status && searchParams.status !== "") {
    countFilters.push(eq(suppliers.status, searchParams.status));
  }

  if (searchParams.productCategory?.id) {
    const filteredSupplierIds = await db
      .select({ supplierId: supplierProductCategories.supplierId })
      .from(supplierProductCategories)
      .where(eq(supplierProductCategories.categoryId, searchParams.productCategory.id));

    const ids = filteredSupplierIds.map((row) => row.supplierId);
    if (!ids.length) {
      return [makeQuerySnapshot<Supplier>([]), { count: 0, isEstimated: false }] as const;
    }
    countFilters.push(inArray(suppliers.id, ids));
  }

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(suppliers)
    .where(and(...countFilters));

  const mapped = rows.map(mapSupplierBase);
  const categoriesMap = await loadSupplierCategories(mapped.map((row) => row.id));
  mapped.forEach((supplier) => {
    supplier.productCategories = categoriesMap.get(supplier.id) ?? [];
  });

  return [makeQuerySnapshot(mapped), { count: totalCount, isEstimated: false }] as const;
};

export const createSupplier = async (supplierInfo: Supplier) => {
  const db = createAppDb();
  const supplierID = uuidv4();
  const publicId = await generatePublicId(SUPPLIERS_COLLECTION);
  const timestamp = Date.now();

  const organizationId = resolveOrganizationId({
    userID: supplierInfo.userID,
    organizationId: supplierInfo.organizationId,
  });

  await db.insert(suppliers).values({
    id: supplierID,
    publicId,
    userId: supplierInfo.userID,
    organizationId,
    tradeName: supplierInfo.tradeName,
    legalName: supplierInfo.legalName,
    entityId: supplierInfo.entityID,
    notes: supplierInfo.description,
    status: supplierInfo.status,
    daysToPay: supplierInfo.daysToPay,
    companyPhone: supplierInfo.companyPhone,
    contactPhone: supplierInfo.contactPhone,
    contactName: supplierInfo.contactName,
    addressJson: supplierInfo.address ? JSON.stringify(supplierInfo.address) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });

  if (supplierInfo.productCategories?.length) {
    await db.insert(supplierProductCategories).values(
      supplierInfo.productCategories
        .filter((category) => category.id)
        .map((category) => ({
          id: uuidv4(),
          supplierId: supplierID,
          categoryId: category.id,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
        }))
    );
  }

  await trackPendingSyncChange({
    organizationId,
    tableName: "suppliers",
    recordId: supplierID,
    operation: "create",
    payload: supplierInfo,
  });
};

export const getSupplier = async (supplierID: string) => {
  const db = createAppDb();
  const row = await db.select().from(suppliers).where(eq(suppliers.id, supplierID)).limit(1);

  if (!row.length) {
    return makeDocSnapshot<Supplier>(supplierID, null);
  }

  const supplier = mapSupplierBase(row[0]);
  const categoriesMap = await loadSupplierCategories([supplierID]);
  supplier.productCategories = categoriesMap.get(supplierID) ?? [];

  return makeDocSnapshot(supplierID, supplier);
};

export const deleteSupplier = async (supplierID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: suppliers.organizationId }).from(suppliers).where(eq(suppliers.id, supplierID)).limit(1);

  await db
    .update(suppliers)
    .set({
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
    .where(eq(suppliers.id, supplierID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "suppliers",
    recordId: supplierID,
    operation: "delete",
    payload: { id: supplierID },
  });
};

export const deactiveSupplier = async (supplierID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: suppliers.organizationId }).from(suppliers).where(eq(suppliers.id, supplierID)).limit(1);

  await db
    .update(suppliers)
    .set({
      updatedAt: Date.now(),
      status: "inactive",
    })
    .where(eq(suppliers.id, supplierID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "suppliers",
    recordId: supplierID,
    operation: "update",
    payload: { id: supplierID, status: "inactive" },
  });
};

export const activeSupplier = async (supplierID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: suppliers.organizationId }).from(suppliers).where(eq(suppliers.id, supplierID)).limit(1);

  await db
    .update(suppliers)
    .set({
      updatedAt: Date.now(),
      status: "active",
    })
    .where(eq(suppliers.id, supplierID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "suppliers",
    recordId: supplierID,
    operation: "update",
    payload: { id: supplierID, status: "active" },
  });
};

export const updateSupplier = async (supplierID: string, supplierInfo: Partial<Supplier>) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: suppliers.organizationId }).from(suppliers).where(eq(suppliers.id, supplierID)).limit(1);

  await db
    .update(suppliers)
    .set({
      updatedAt: Date.now(),
      tradeName: supplierInfo.tradeName,
      legalName: supplierInfo.legalName,
      entityId: supplierInfo.entityID,
      notes: supplierInfo.description,
      status: supplierInfo.status,
      daysToPay: supplierInfo.daysToPay,
      companyPhone: supplierInfo.companyPhone,
      contactPhone: supplierInfo.contactPhone,
      contactName: supplierInfo.contactName,
      addressJson: supplierInfo.address ? JSON.stringify(supplierInfo.address) : undefined,
    })
    .where(eq(suppliers.id, supplierID));

  if (supplierInfo.productCategories) {
    await db.delete(supplierProductCategories).where(eq(supplierProductCategories.supplierId, supplierID));

    const categoriesToInsert = supplierInfo.productCategories.filter((category) => category.id);
    if (categoriesToInsert.length) {
      const timestamp = Date.now();
      await db.insert(supplierProductCategories).values(
        categoriesToInsert.map((category) => ({
          id: uuidv4(),
          supplierId: supplierID,
          categoryId: category.id,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
        }))
      );
    }
  }

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "suppliers",
    recordId: supplierID,
    operation: "update",
    payload: supplierInfo,
  });
};
