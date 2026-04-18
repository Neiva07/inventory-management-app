import * as schema from "../db/schema";

type SyncScope = "user" | "organization";

interface TableRegistryEntry {
  table: typeof schema.users | typeof schema.organizations | typeof schema.userMemberships
    | typeof schema.invitationCodes | typeof schema.joinRequests | typeof schema.onboardingSessions
    | typeof schema.appSettings | typeof schema.units | typeof schema.productCategories
    | typeof schema.customers | typeof schema.suppliers | typeof schema.supplierProductCategories
    | typeof schema.products | typeof schema.productVariants | typeof schema.orders
    | typeof schema.orderItems | typeof schema.inboundOrders | typeof schema.inboundOrderItems
    | typeof schema.inboundOrderPayments | typeof schema.supplierBills | typeof schema.installmentPayments;
  scope: SyncScope;
}

/**
 * Maps SQLite table names to their Drizzle schema objects and sync scope.
 * Used by push handler for validation and by the scope resolver.
 */
export const TABLE_REGISTRY: Record<string, TableRegistryEntry> = {
  // User-scoped
  users:                        { table: schema.users,                      scope: "user" },
  app_settings:                 { table: schema.appSettings,                scope: "user" },
  onboarding_sessions:          { table: schema.onboardingSessions,         scope: "user" },

  // Org-scoped
  organizations:                { table: schema.organizations,              scope: "organization" },
  user_memberships:             { table: schema.userMemberships,            scope: "organization" },
  invitation_codes:             { table: schema.invitationCodes,            scope: "organization" },
  join_requests:                { table: schema.joinRequests,               scope: "organization" },
  units:                        { table: schema.units,                      scope: "organization" },
  product_categories:           { table: schema.productCategories,          scope: "organization" },
  customers:                    { table: schema.customers,                  scope: "organization" },
  suppliers:                    { table: schema.suppliers,                  scope: "organization" },
  supplier_product_categories:  { table: schema.supplierProductCategories,  scope: "organization" },
  products:                     { table: schema.products,                   scope: "organization" },
  product_variants:             { table: schema.productVariants,            scope: "organization" },
  orders:                       { table: schema.orders,                     scope: "organization" },
  order_items:                  { table: schema.orderItems,                 scope: "organization" },
  inbound_order:                { table: schema.inboundOrders,              scope: "organization" },
  inbound_order_items:          { table: schema.inboundOrderItems,          scope: "organization" },
  inbound_order_payments:       { table: schema.inboundOrderPayments,       scope: "organization" },
  supplier_bills:               { table: schema.supplierBills,              scope: "organization" },
  installment_payments:         { table: schema.installmentPayments,        scope: "organization" },
};

export const isKnownTable = (tableName: string): boolean => tableName in TABLE_REGISTRY;

export const getScopeForTable = (tableName: string): SyncScope | null =>
  TABLE_REGISTRY[tableName]?.scope ?? null;
