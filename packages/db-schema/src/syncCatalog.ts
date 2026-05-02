import {
  appSettings,
  customers,
  inboundOrderItems,
  inboundOrderPayments,
  inboundOrders,
  installmentPayments,
  invitationCodes,
  joinRequests,
  onboardingSessions,
  orderItems,
  orders,
  organizations,
  productCategories,
  productVariants,
  products,
  supplierBills,
  supplierProductCategories,
  suppliers,
  units,
  userMemberships,
  users,
} from "./index";

export type SyncScope = "user" | "organization";
export type SyncDirection = "push-pull";
export type SyncOwner = "shared-domain";

export const SYNC_TABLE_ORDER = [
  "users",
  "organizations",
  "user_memberships",
  "app_settings",
  "onboarding_sessions",
  "invitation_codes",
  "join_requests",
  "units",
  "product_categories",
  "customers",
  "suppliers",
  "supplier_product_categories",
  "products",
  "product_variants",
  "orders",
  "order_items",
  "inbound_order",
  "inbound_order_items",
  "inbound_order_payments",
  "supplier_bills",
  "installment_payments",
] as const;

export type SyncTableName = (typeof SYNC_TABLE_ORDER)[number];

type SyncableTable =
  | typeof users
  | typeof organizations
  | typeof userMemberships
  | typeof invitationCodes
  | typeof joinRequests
  | typeof onboardingSessions
  | typeof appSettings
  | typeof units
  | typeof productCategories
  | typeof customers
  | typeof suppliers
  | typeof supplierProductCategories
  | typeof products
  | typeof productVariants
  | typeof orders
  | typeof orderItems
  | typeof inboundOrders
  | typeof inboundOrderItems
  | typeof inboundOrderPayments
  | typeof supplierBills
  | typeof installmentPayments;

export interface SyncCatalogEntry {
  table: SyncableTable;
  scope: SyncScope;
  direction: SyncDirection;
  owner: SyncOwner;
}

const entry = (table: SyncableTable, scope: SyncScope): SyncCatalogEntry => ({
  table,
  scope,
  direction: "push-pull",
  owner: "shared-domain",
});

export const SYNC_CATALOG = {
  users: entry(users, "user"),
  organizations: entry(organizations, "organization"),
  user_memberships: entry(userMemberships, "organization"),
  app_settings: entry(appSettings, "user"),
  onboarding_sessions: entry(onboardingSessions, "user"),
  invitation_codes: entry(invitationCodes, "organization"),
  join_requests: entry(joinRequests, "organization"),
  units: entry(units, "organization"),
  product_categories: entry(productCategories, "organization"),
  customers: entry(customers, "organization"),
  suppliers: entry(suppliers, "organization"),
  supplier_product_categories: entry(supplierProductCategories, "organization"),
  products: entry(products, "organization"),
  product_variants: entry(productVariants, "organization"),
  orders: entry(orders, "organization"),
  order_items: entry(orderItems, "organization"),
  inbound_order: entry(inboundOrders, "organization"),
  inbound_order_items: entry(inboundOrderItems, "organization"),
  inbound_order_payments: entry(inboundOrderPayments, "organization"),
  supplier_bills: entry(supplierBills, "organization"),
  installment_payments: entry(installmentPayments, "organization"),
} satisfies Record<SyncTableName, SyncCatalogEntry>;

export const isSyncTableName = (tableName: string): tableName is SyncTableName =>
  tableName in SYNC_CATALOG;

export const getSyncCatalogEntry = (tableName: string): SyncCatalogEntry | null =>
  isSyncTableName(tableName) ? SYNC_CATALOG[tableName] : null;

export const getSyncScopeForTable = (tableName: string): SyncScope | null =>
  getSyncCatalogEntry(tableName)?.scope ?? null;

export const getSyncTableNames = (): SyncTableName[] => [...SYNC_TABLE_ORDER];

export const getSyncTablesForScope = (scope: SyncScope): SyncTableName[] =>
  SYNC_TABLE_ORDER.filter((tableName) => SYNC_CATALOG[tableName].scope === scope);
