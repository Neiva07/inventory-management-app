import { and, asc, count, eq, gt, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { makeDocSnapshot, makeQuerySnapshot } from "../db/firestoreCompat";
import { resolveOrganizationId } from "../db/scope";
import { customers } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { Address } from "./suppliers";

export interface Customer {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  name: string;
  cpf?: string;
  rg?: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  status: string;
  address?: Address;
  companyPhone?: string;
  contactPhone?: string;
  contactName?: string;
}

interface CustomerSearchParams {
  userID: string;
  organizationId?: string;
  name?: string;
  status?: string;
  cursor?: Customer;
  pageSize: number;
}

const CUSTOMER_COLLECTION = COLLECTION_NAMES.CUSTOMERS;

const mapCustomer = (row: typeof customers.$inferSelect): Customer => ({
  id: row.id,
  publicId: row.publicId ?? "",
  userID: row.userId,
  organizationId: row.organizationId,
  name: row.name,
  cpf: row.cpf ?? undefined,
  rg: row.rg ?? undefined,
  status: row.status,
  address: row.addressJson ? (JSON.parse(row.addressJson) as Address) : undefined,
  companyPhone: row.companyPhone ?? undefined,
  contactPhone: row.contactPhone ?? undefined,
  contactName: row.contactName ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const getCustomers = async (searchParams: CustomerSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const namePrefix = searchParams.name ?? "";
  const filters = [
    eq(customers.organizationId, scopeOrganizationId),
    like(customers.name, `${namePrefix}%`),
  ];

  if (searchParams.status && searchParams.status !== "") {
    filters.push(eq(customers.status, searchParams.status));
  }

  if (searchParams.cursor?.name) {
    filters.push(gt(customers.name, searchParams.cursor.name));
  }

  const rows = await db
    .select()
    .from(customers)
    .where(and(...filters))
    .orderBy(asc(customers.name))
    .limit(searchParams.pageSize);

  const countFilters = [
    eq(customers.organizationId, scopeOrganizationId),
    like(customers.name, `${namePrefix}%`),
  ];

  if (searchParams.status && searchParams.status !== "") {
    countFilters.push(eq(customers.status, searchParams.status));
  }

  const [{ value: totalCount }] = await db.select({ value: count() }).from(customers).where(and(...countFilters));

  const mapped = rows.map(mapCustomer);
  return [makeQuerySnapshot(mapped), { count: totalCount, isEstimated: false }] as const;
};

export const createCustomer = async (customerInfo: Customer) => {
  const db = createAppDb();
  const customerID = uuidv4();
  const publicId = await generatePublicId(CUSTOMER_COLLECTION);
  const timestamp = Date.now();

  const organizationId = resolveOrganizationId({
    userID: customerInfo.userID,
    organizationId: customerInfo.organizationId,
  });

  const customerData: Customer = {
    ...customerInfo,
    id: customerID,
    publicId,
    organizationId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const row = {
    id: customerID,
    publicId,
    userId: customerInfo.userID,
    organizationId,
    name: customerInfo.name,
    status: customerInfo.status,
    cpf: customerInfo.cpf,
    rg: customerInfo.rg,
    companyPhone: customerInfo.companyPhone,
    contactPhone: customerInfo.contactPhone,
    contactName: customerInfo.contactName,
    addressJson: customerInfo.address ? JSON.stringify(customerInfo.address) : null,
  };

  await db.insert(customers).values({
    ...row,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "customers",
    recordId: customerID,
    operation: "create",
    payload: row,
  });

  return customerData;
};

export const getCustomer = async (customerID: string) => {
  const db = createAppDb();
  const row = await db.select().from(customers).where(eq(customers.id, customerID)).limit(1);
  const customer = row.length ? mapCustomer(row[0]) : null;
  return makeDocSnapshot(customerID, customer);
};

export const deleteCustomer = async (customerID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: customers.organizationId }).from(customers).where(eq(customers.id, customerID)).limit(1);

  await db.delete(customers).where(eq(customers.id, customerID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "customers",
    recordId: customerID,
    operation: "delete",
    payload: { id: customerID },
  });
};

export const deactiveCustomer = async (customerID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: customers.organizationId }).from(customers).where(eq(customers.id, customerID)).limit(1);

  await db
    .update(customers)
    .set({
      updatedAt: Date.now(),
      status: "inactive",
    })
    .where(eq(customers.id, customerID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "customers",
    recordId: customerID,
    operation: "update",
    payload: { id: customerID, status: "inactive" },
  });
};

export const activeCustomer = async (customerID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: customers.organizationId }).from(customers).where(eq(customers.id, customerID)).limit(1);

  await db
    .update(customers)
    .set({
      updatedAt: Date.now(),
      status: "active",
    })
    .where(eq(customers.id, customerID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "customers",
    recordId: customerID,
    operation: "update",
    payload: { id: customerID, status: "active" },
  });
};

export const updateCustomer = async (customerID: string, customerInfo: Partial<Customer>) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: customers.organizationId }).from(customers).where(eq(customers.id, customerID)).limit(1);

  const changes = {
    name: customerInfo.name,
    status: customerInfo.status,
    cpf: customerInfo.cpf,
    rg: customerInfo.rg,
    companyPhone: customerInfo.companyPhone,
    contactPhone: customerInfo.contactPhone,
    contactName: customerInfo.contactName,
    addressJson: customerInfo.address ? JSON.stringify(customerInfo.address) : undefined,
  };

  await db
    .update(customers)
    .set({
      ...changes,
      updatedAt: Date.now(),
    })
    .where(eq(customers.id, customerID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "customers",
    recordId: customerID,
    operation: "update",
    payload: changes,
  });
};
