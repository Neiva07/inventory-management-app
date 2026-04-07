import { and, asc, eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { makeQuerySnapshot } from "../db/firestoreCompat";
import { resolveOrganizationId } from "../db/scope";
import { productCategories } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";

export interface ProductCategory {
  name: string;
  description: string;
  id: string;
  publicId: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  userID: string;
  organizationId?: string;
  status?: string;
}

const PRODUCT_CATEGORIES_COLLECTION = COLLECTION_NAMES.PRODUCT_CATEGORIES;

export const getProductCategories = async (userID: string, name = "", organizationId?: string) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({ userID, organizationId });

  const rows = await db
    .select()
    .from(productCategories)
    .where(
      and(
        eq(productCategories.organizationId, scopeOrganizationId),
        like(productCategories.name, `${name}%`)
      )
    )
    .orderBy(asc(productCategories.name));

  const categories: ProductCategory[] = rows.map((row) => ({
    id: row.id,
    publicId: row.publicId ?? "",
    name: row.name,
    description: row.description ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return makeQuerySnapshot(categories);
};

export const createProductCategories = async (productCategoryInfo: Partial<ProductCategory>) => {
  const db = createAppDb();
  const id = uuidv4();
  const publicId = await generatePublicId(PRODUCT_CATEGORIES_COLLECTION);
  const timestamp = Date.now();

  const userID = productCategoryInfo.userID ?? "";
  const organizationId = resolveOrganizationId({ userID, organizationId: productCategoryInfo.organizationId });

  await db.insert(productCategories).values({
    id,
    publicId,
    userId: userID,
    organizationId,
    name: productCategoryInfo.name ?? "",
    description: productCategoryInfo.description ?? "",
    status: productCategoryInfo.status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "product_categories",
    recordId: id,
    operation: "create",
    payload: productCategoryInfo,
  });
};

export const updateProductCategory = async (id: string, productCategoryInfo: Partial<ProductCategory>) => {
  const db = createAppDb();
  const existing = await db
    .select({ organizationId: productCategories.organizationId })
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);

  await db
    .update(productCategories)
    .set({
      name: productCategoryInfo.name,
      description: productCategoryInfo.description,
      updatedAt: Date.now(),
    })
    .where(eq(productCategories.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "product_categories",
    recordId: id,
    operation: "update",
    payload: productCategoryInfo,
  });
};

export const deleteProductCategory = async (id: string) => {
  const db = createAppDb();
  const existing = await db
    .select({ organizationId: productCategories.organizationId })
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);

  await db.delete(productCategories).where(eq(productCategories.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "product_categories",
    recordId: id,
    operation: "delete",
    payload: { id },
  });
};
