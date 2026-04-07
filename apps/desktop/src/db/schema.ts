import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const lifecycleColumns = {
  createdAt: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const users = sqliteTable(
  "users",
  {
    id: text("users_id").primaryKey(),
    email: text("email"),
    fullName: text("full_name"),
    ...lifecycleColumns,
  },
  (table) => ({
    userEmailIdx: uniqueIndex("users_email_uidx").on(table.email),
  })
);

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("organizations_id").primaryKey(),
    name: text("name").notNull(),
    createdBy: text("created_by").notNull(),
    status: text("status").notNull().default("active"),
    ...lifecycleColumns,
  },
  (table) => ({
    orgCreatedByIdx: index("organizations_created_by_idx").on(table.createdBy),
    orgStatusIdx: index("organizations_status_idx").on(table.status),
    orgCreatedAtIdx: index("organizations_created_at_idx").on(table.createdAt),
  })
);

export const userMemberships = sqliteTable(
  "user_memberships",
  {
    id: text("user_memberships_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    status: text("status").notNull().default("active"),
    ...lifecycleColumns,
  },
  (table) => ({
    membershipUserStatusIdx: index("user_memberships_user_status_idx").on(table.userId, table.status),
    membershipOrgStatusIdx: index("user_memberships_org_status_idx").on(table.organizationId, table.status),
  })
);

export const invitationCodes = sqliteTable(
  "invitation_codes",
  {
    id: text("invitation_codes_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    expiresAt: integer("expires_at", { mode: "number" }).notNull(),
    usedAt: integer("used_at", { mode: "number" }),
    usedBy: text("used_by"),
    ...lifecycleColumns,
  },
  (table) => ({
    invitationCodeIdx: uniqueIndex("invitation_codes_code_uidx").on(table.code),
    invitationOrgIdx: index("invitation_codes_org_idx").on(table.organizationId),
    invitationExpiryIdx: index("invitation_codes_expires_at_idx").on(table.expiresAt),
  })
);

export const joinRequests = sqliteTable(
  "join_requests",
  {
    id: text("join_requests_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: text("status").notNull().default("pending"),
    ...lifecycleColumns,
  },
  (table) => ({
    joinRequestsOrgStatusIdx: index("join_requests_org_status_idx").on(table.organizationId, table.status),
    joinRequestsUserIdx: index("join_requests_user_idx").on(table.userId),
  })
);

export const onboardingSessions = sqliteTable(
  "onboarding_sessions",
  {
    id: text("onboarding_sessions_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("in_progress"),
    step: integer("step").notNull().default(0),
    payloadJson: text("payload_json"),
    ...lifecycleColumns,
  },
  (table) => ({
    onboardingUserStatusIdx: index("onboarding_sessions_user_status_idx").on(table.userId, table.status),
  })
);

export const appSettings = sqliteTable(
  "app_settings",
  {
    id: text("app_settings_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    settingsJson: text("settings_json").notNull().default("{}"),
    ...lifecycleColumns,
  },
  (table) => ({
    appSettingsUserIdx: uniqueIndex("app_settings_user_uidx").on(table.userId),
  })
);

export const units = sqliteTable(
  "units",
  {
    id: text("units_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: text("public_id"),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    ...lifecycleColumns,
  },
  (table) => ({
    unitsOrgStatusIdx: index("units_org_status_idx").on(table.organizationId, table.status),
    unitsOrgNameIdx: index("units_org_name_idx").on(table.organizationId, table.name),
    unitsPublicIdIdx: uniqueIndex("units_public_id_uidx").on(table.publicId),
  })
);

export const productCategories = sqliteTable(
  "product_categories",
  {
    id: text("product_categories_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: text("public_id"),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    ...lifecycleColumns,
  },
  (table) => ({
    categoriesOrgStatusIdx: index("product_categories_org_status_idx").on(table.organizationId, table.status),
    categoriesOrgNameIdx: index("product_categories_org_name_idx").on(table.organizationId, table.name),
    categoriesPublicIdIdx: uniqueIndex("product_categories_public_id_uidx").on(table.publicId),
  })
);

export const customers = sqliteTable(
  "customers",
  {
    id: text("customers_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: text("public_id"),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    email: text("email"),
    phone: text("phone"),
    document: text("document"),
    notes: text("notes"),
    companyPhone: text("company_phone"),
    contactPhone: text("contact_phone"),
    contactName: text("contact_name"),
    cpf: text("cpf"),
    rg: text("rg"),
    addressJson: text("address_json"),
    ...lifecycleColumns,
  },
  (table) => ({
    customersOrgStatusIdx: index("customers_org_status_idx").on(table.organizationId, table.status),
    customersOrgNameIdx: index("customers_org_name_idx").on(table.organizationId, table.name),
    customersPublicIdIdx: uniqueIndex("customers_public_id_uidx").on(table.publicId),
  })
);

export const suppliers = sqliteTable(
  "suppliers",
  {
    id: text("suppliers_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: text("public_id"),
    tradeName: text("trade_name").notNull(),
    legalName: text("legal_name"),
    entityId: text("entity_id"),
    status: text("status").notNull().default("active"),
    email: text("email"),
    phone: text("phone"),
    document: text("document"),
    notes: text("notes"),
    companyPhone: text("company_phone"),
    contactPhone: text("contact_phone"),
    contactName: text("contact_name"),
    daysToPay: integer("days_to_pay", { mode: "number" }),
    addressJson: text("address_json"),
    ...lifecycleColumns,
  },
  (table) => ({
    suppliersOrgStatusIdx: index("suppliers_org_status_idx").on(table.organizationId, table.status),
    suppliersOrgTradeNameIdx: index("suppliers_org_trade_name_idx").on(table.organizationId, table.tradeName),
    suppliersPublicIdIdx: uniqueIndex("suppliers_public_id_uidx").on(table.publicId),
  })
);

export const supplierProductCategories = sqliteTable(
  "supplier_product_categories",
  {
    id: text("supplier_product_categories_id").primaryKey(),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id, { onDelete: "cascade" }),
    ...lifecycleColumns,
  },
  (table) => ({
    supplierCategorySupplierIdx: index("supplier_product_categories_supplier_idx").on(table.supplierId),
    supplierCategoryCategoryIdx: index("supplier_product_categories_category_idx").on(table.categoryId),
    supplierCategoryUnique: uniqueIndex("supplier_product_categories_unique_uidx").on(table.supplierId, table.categoryId),
  })
);

export const products = sqliteTable(
  "products",
  {
    id: text("products_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => productCategories.id, { onDelete: "set null" }),
    supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    baseUnitId: text("base_unit_id").references(() => units.id, { onDelete: "set null" }),
    publicId: text("public_id"),
    title: text("title").notNull(),
    status: text("status").notNull().default("active"),
    sku: text("sku"),
    barcode: text("barcode"),
    description: text("description"),
    inventoryBaseUnit: integer("inventory_base_unit", { mode: "number" }).notNull().default(0),
    costCents: integer("cost_cents", { mode: "number" }).notNull().default(0),
    sailsmanCommissionCents: integer("sailsman_commission_cents", { mode: "number" }).notNull().default(0),
    weight: integer("weight", { mode: "number" }).notNull().default(0),
    minInventory: integer("min_inventory", { mode: "number" }),
    baseUnitJson: text("base_unit_json"),
    suppliersJson: text("suppliers_json"),
    productCategoryJson: text("product_category_json"),
    variantsJson: text("variants_json"),
    ...lifecycleColumns,
  },
  (table) => ({
    productsOrgStatusIdx: index("products_org_status_idx").on(table.organizationId, table.status),
    productsOrgTitleIdx: index("products_org_title_idx").on(table.organizationId, table.title),
    productsOrgCategoryIdx: index("products_org_category_idx").on(table.organizationId, table.categoryId),
    productsPublicIdIdx: uniqueIndex("products_public_id_uidx").on(table.publicId),
  })
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("product_variants_id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    unitId: text("unit_id").references(() => units.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    conversionRate: integer("conversion_rate", { mode: "number" }).notNull().default(1),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    costCents: integer("cost_cents", { mode: "number" }).notNull().default(0),
    unitPriceCents: integer("unit_price_cents", { mode: "number" }).notNull().default(0),
    profitCents: integer("profit_cents", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    variantsProductIdx: index("product_variants_product_idx").on(table.productId),
    variantsProductDefaultIdx: index("product_variants_product_default_idx").on(table.productId, table.isDefault),
  })
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("orders_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerJson: text("customer_json"),
    publicId: text("public_id"),
    status: text("status").notNull().default("request"),
    paymentMethodId: text("payment_method_id"),
    paymentMethodLabel: text("payment_method_label"),
    orderDate: integer("order_date", { mode: "number" }).notNull(),
    dueDate: integer("due_date", { mode: "number" }),
    totalCommissionCents: integer("total_commission_cents", { mode: "number" }).notNull().default(0),
    totalCostCents: integer("total_cost_cents", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    ordersOrgStatusIdx: index("orders_org_status_idx").on(table.organizationId, table.status),
    ordersOrgCustomerIdx: index("orders_org_customer_idx").on(table.organizationId, table.customerId),
    ordersOrgCreatedAtIdx: index("orders_org_created_at_idx").on(table.organizationId, table.createdAt),
    ordersPublicIdIdx: uniqueIndex("orders_public_id_uidx").on(table.publicId),
  })
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("order_items_id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    variantJson: text("variant_json"),
    title: text("title").notNull(),
    quantity: integer("quantity", { mode: "number" }).notNull(),
    balance: integer("balance", { mode: "number" }).notNull().default(0),
    discountPercent: integer("discount_percent", { mode: "number" }).notNull().default(0),
    commissionRate: integer("commission_rate", { mode: "number" }).notNull().default(0),
    unitPriceCents: integer("unit_price_cents", { mode: "number" }).notNull().default(0),
    costCents: integer("cost_cents", { mode: "number" }).notNull().default(0),
    itemTotalCostCents: integer("item_total_cost_cents", { mode: "number" }).notNull().default(0),
    productBaseUnitInventory: integer("product_base_unit_inventory", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    orderItemsOrderIdx: index("order_items_order_idx").on(table.orderId),
    orderItemsProductIdx: index("order_items_product_idx").on(table.productId),
  })
);

export const inboundOrders = sqliteTable(
  "inbound_order",
  {
    id: text("inbound_order_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    supplierJson: text("supplier_json"),
    publicId: text("public_id"),
    status: text("status").notNull().default("request"),
    orderDate: integer("order_date", { mode: "number" }).notNull(),
    dueDate: integer("due_date", { mode: "number" }),
    totalCostCents: integer("total_cost_cents", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    inboundOrdersOrgStatusIdx: index("inbound_order_org_status_idx").on(table.organizationId, table.status),
    inboundOrdersOrgSupplierIdx: index("inbound_order_org_supplier_idx").on(table.organizationId, table.supplierId),
    inboundOrdersOrgCreatedAtIdx: index("inbound_order_org_created_at_idx").on(table.organizationId, table.createdAt),
    inboundOrdersPublicIdIdx: uniqueIndex("inbound_order_public_id_uidx").on(table.publicId),
  })
);

export const inboundOrderItems = sqliteTable(
  "inbound_order_items",
  {
    id: text("inbound_order_items_id").primaryKey(),
    inboundOrderId: text("inbound_order_id")
      .notNull()
      .references(() => inboundOrders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    variantJson: text("variant_json"),
    title: text("title").notNull(),
    quantity: integer("quantity", { mode: "number" }).notNull(),
    balance: integer("balance", { mode: "number" }).notNull().default(0),
    unitCostCents: integer("unit_cost_cents", { mode: "number" }).notNull().default(0),
    itemTotalCostCents: integer("item_total_cost_cents", { mode: "number" }).notNull().default(0),
    productBaseUnitInventory: integer("product_base_unit_inventory", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    inboundOrderItemsOrderIdx: index("inbound_order_items_order_idx").on(table.inboundOrderId),
    inboundOrderItemsProductIdx: index("inbound_order_items_product_idx").on(table.productId),
  })
);

export const inboundOrderPayments = sqliteTable(
  "inbound_order_payments",
  {
    id: text("inbound_order_payments_id").primaryKey(),
    inboundOrderId: text("inbound_order_id")
      .notNull()
      .references(() => inboundOrders.id, { onDelete: "cascade" }),
    methodId: text("method_id"),
    methodLabel: text("method_label"),
    amountCents: integer("amount_cents", { mode: "number" }).notNull().default(0),
    dueDate: integer("due_date", { mode: "number" }),
    ...lifecycleColumns,
  },
  (table) => ({
    inboundOrderPaymentsOrderIdx: index("inbound_order_payments_order_idx").on(table.inboundOrderId),
  })
);

export const supplierBills = sqliteTable(
  "supplier_bills",
  {
    id: text("supplier_bills_id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    supplierJson: text("supplier_json"),
    inboundOrderId: text("inbound_order_id").references(() => inboundOrders.id, { onDelete: "set null" }),
    inboundOrderJson: text("inbound_order_json"),
    publicId: text("public_id"),
    status: text("status").notNull().default("pending"),
    dueDate: integer("due_date", { mode: "number" }),
    totalAmountCents: integer("total_amount_cents", { mode: "number" }).notNull().default(0),
    paidAmountCents: integer("paid_amount_cents", { mode: "number" }).notNull().default(0),
    ...lifecycleColumns,
  },
  (table) => ({
    supplierBillsOrgStatusIdx: index("supplier_bills_org_status_idx").on(table.organizationId, table.status),
    supplierBillsOrgSupplierIdx: index("supplier_bills_org_supplier_idx").on(table.organizationId, table.supplierId),
    supplierBillsOrgCreatedAtIdx: index("supplier_bills_org_created_at_idx").on(table.organizationId, table.createdAt),
    supplierBillsPublicIdIdx: uniqueIndex("supplier_bills_public_id_uidx").on(table.publicId),
  })
);

export const installmentPayments = sqliteTable(
  "installment_payments",
  {
    id: text("installment_payments_id").primaryKey(),
    supplierBillId: text("supplier_bill_id")
      .notNull()
      .references(() => supplierBills.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: text("public_id"),
    status: text("status").notNull().default("pending"),
    installmentNumber: integer("installment_number", { mode: "number" }).notNull().default(1),
    dueDate: integer("due_date", { mode: "number" }).notNull(),
    paidDate: integer("paid_date", { mode: "number" }),
    amountCents: integer("amount_cents", { mode: "number" }).notNull().default(0),
    paidAmountCents: integer("paid_amount_cents", { mode: "number" }).notNull().default(0),
    paymentMethodId: text("payment_method_id"),
    paymentMethodLabel: text("payment_method_label"),
    ...lifecycleColumns,
  },
  (table) => ({
    installmentsOrgStatusIdx: index("installment_payments_org_status_idx").on(table.organizationId, table.status),
    installmentsOrgDueDateIdx: index("installment_payments_org_due_date_idx").on(table.organizationId, table.dueDate),
    installmentsBillIdx: index("installment_payments_bill_idx").on(table.supplierBillId),
    installmentsPublicIdIdx: uniqueIndex("installment_payments_public_id_uidx").on(table.publicId),
  })
);

// Tracks local writes that still need cloud replication.
export const syncQueue = sqliteTable(
  "sync_queue",
  {
    id: text("sync_queue_id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    operation: text("operation").notNull(), // create | update | delete
    payloadJson: text("payload_json").notNull(),
    status: text("status").notNull().default("pending"), // pending | syncing | failed | synced
    attempts: integer("attempts", { mode: "number" }).notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: integer("next_attempt_at", { mode: "number" }),
    ...lifecycleColumns,
  },
  (table) => ({
    syncQueueStatusIdx: index("sync_queue_status_idx").on(table.status, table.nextAttemptAt),
    syncQueueOrgIdx: index("sync_queue_org_idx").on(table.organizationId),
    syncQueueEntityIdx: index("sync_queue_entity_idx").on(table.tableName, table.recordId),
  })
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const inboundOrdersRelations = relations(inboundOrders, ({ many, one }) => ({
  items: many(inboundOrderItems),
  payments: many(inboundOrderPayments),
  supplier: one(suppliers, { fields: [inboundOrders.supplierId], references: [suppliers.id] }),
}));

export const inboundOrderItemsRelations = relations(inboundOrderItems, ({ one }) => ({
  inboundOrder: one(inboundOrders, { fields: [inboundOrderItems.inboundOrderId], references: [inboundOrders.id] }),
  product: one(products, { fields: [inboundOrderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [inboundOrderItems.variantId], references: [productVariants.id] }),
}));

export const inboundOrderPaymentsRelations = relations(inboundOrderPayments, ({ one }) => ({
  inboundOrder: one(inboundOrders, { fields: [inboundOrderPayments.inboundOrderId], references: [inboundOrders.id] }),
}));

export const supplierBillsRelations = relations(supplierBills, ({ many, one }) => ({
  installments: many(installmentPayments),
  supplier: one(suppliers, { fields: [supplierBills.supplierId], references: [suppliers.id] }),
}));

export const installmentPaymentsRelations = relations(installmentPayments, ({ one }) => ({
  supplierBill: one(supplierBills, { fields: [installmentPayments.supplierBillId], references: [supplierBills.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  productCategories: many(supplierProductCategories),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  suppliers: many(supplierProductCategories),
}));

export const supplierProductCategoriesRelations = relations(supplierProductCategories, ({ one }) => ({
  supplier: one(suppliers, { fields: [supplierProductCategories.supplierId], references: [suppliers.id] }),
  category: one(productCategories, { fields: [supplierProductCategories.categoryId], references: [productCategories.id] }),
}));
