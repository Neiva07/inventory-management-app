# Sync Catalog Implant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated desktop/web sync table registries with one shared sync catalog that explicitly defines the domain tables participating in replication.

**Architecture:** Add a shared `@stockify/db-schema/sync-catalog` subpath that owns sync table names, table objects, scopes, and dependency order for shared domain tables only. Keep desktop-local tables in `apps/desktop` and cloud-only tables in `apps/web`, then make the existing app-level registry files thin compatibility wrappers around the shared catalog.

**Tech Stack:** TypeScript, pnpm workspaces, Drizzle SQLite table definitions, Electron desktop app, Next.js web app.

---

## File Structure

- Create `packages/db-schema/src/syncCatalog.ts`
  - Owns `SYNC_TABLE_ORDER`, `SYNC_CATALOG`, scope types, direction metadata, and helper functions.
  - Imports shared domain tables from `packages/db-schema/src/index.ts`.
  - Does not import or mention `sync_queue`, `sync_meta`, `sync_events`, `sync_control`, or runtime log tables.
- Modify `packages/db-schema/package.json`
  - Adds an export for `@stockify/db-schema/sync-catalog`.
- Modify `apps/desktop/src/db/syncTableMap.ts`
  - Replaces the duplicated hard-coded map with exports derived from `@stockify/db-schema/sync-catalog`.
  - Keeps `SYNC_TABLE_MAP`, `getSyncTableNames`, and `getTablesForScope` as compatibility exports.
- Modify `apps/web/lib/sync/tableRegistry.ts`
  - Replaces the duplicated hard-coded registry with exports derived from `@stockify/db-schema/sync-catalog`.
  - Keeps `TABLE_REGISTRY`, `isKnownTable`, and `getScopeForTable` as compatibility exports.
- Modify `apps/desktop/src/db/legacySyncBackfill.ts`
  - Replaces its local `tableOrder` array with `SYNC_TABLE_ORDER` from `syncTableMap`.
- Create `docs/sync-architecture.md`
  - Documents the three conceptual data domains: shared domain/syncable, desktop-local, cloud-only.

No Drizzle migrations should be generated for this work because table definitions are not changing.

---

### Task 1: Add the Shared Sync Catalog

**Files:**
- Create: `packages/db-schema/src/syncCatalog.ts`

- [ ] **Step 1: Create the catalog file**

Use this exact content:

```ts
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
```

---

### Task 2: Export the Catalog as a Package Subpath

**Files:**
- Modify: `packages/db-schema/package.json`

- [ ] **Step 1: Add the package export**

Change the `exports` block to:

```json
"exports": {
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./sync-catalog": {
    "types": "./src/syncCatalog.ts",
    "default": "./src/syncCatalog.ts"
  }
}
```

- [ ] **Step 2: Verify package subpath resolution**

Run:

```bash
pnpm desktop exec tsc --noEmit
```

Expected: this may still fail because existing desktop TypeScript errors are possible, but it must not fail with:

```text
Cannot find module '@stockify/db-schema/sync-catalog'
```

---

### Task 3: Replace the Desktop Sync Map with a Shared-Catalog Wrapper

**Files:**
- Modify: `apps/desktop/src/db/syncTableMap.ts`
- Modify: `apps/desktop/src/db/legacySyncBackfill.ts`

- [ ] **Step 1: Replace `syncTableMap.ts`**

Use this exact content:

```ts
export {
  SYNC_CATALOG as SYNC_TABLE_MAP,
  SYNC_TABLE_ORDER,
  getSyncTableNames,
  getSyncTablesForScope as getTablesForScope,
  type SyncScope,
  type SyncTableName,
} from "@stockify/db-schema/sync-catalog";
```

- [ ] **Step 2: Update the backfill import**

In `apps/desktop/src/db/legacySyncBackfill.ts`, change:

```ts
import { SYNC_TABLE_MAP } from "./syncTableMap";
```

to:

```ts
import { SYNC_TABLE_MAP, SYNC_TABLE_ORDER } from "./syncTableMap";
```

- [ ] **Step 3: Delete the local `tableOrder` constant**

Remove this whole block from `apps/desktop/src/db/legacySyncBackfill.ts`:

```ts
const tableOrder = [
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
```

- [ ] **Step 4: Use the shared order**

Change:

```ts
for (const tableName of tableOrder) {
```

to:

```ts
for (const tableName of SYNC_TABLE_ORDER) {
```

- [ ] **Step 5: Run desktop typecheck**

Run:

```bash
pnpm desktop exec tsc --noEmit
```

Expected: no new errors from `syncTableMap.ts`, `legacySyncBackfill.ts`, `syncMeta.ts`, or `syncDown.ts`.

---

### Task 4: Replace the Web Registry with a Shared-Catalog Wrapper

**Files:**
- Modify: `apps/web/lib/sync/tableRegistry.ts`

- [ ] **Step 1: Replace `tableRegistry.ts`**

Use this exact content:

```ts
import {
  SYNC_CATALOG,
  getSyncScopeForTable,
  isSyncTableName,
  type SyncScope,
} from "@stockify/db-schema/sync-catalog";

export const TABLE_REGISTRY = SYNC_CATALOG;

export const isKnownTable = (tableName: string): boolean => isSyncTableName(tableName);

export const getScopeForTable = (tableName: string): SyncScope | null =>
  getSyncScopeForTable(tableName);
```

- [ ] **Step 2: Run web typecheck**

Run:

```bash
pnpm web exec tsc --noEmit
```

Expected: no new errors from `apps/web/lib/sync/tableRegistry.ts` or `apps/web/lib/sync/pushHandler.ts`.

---

### Task 5: Document the Three Data Domains

**Files:**
- Create: `docs/sync-architecture.md`

- [ ] **Step 1: Add architecture documentation**

Use this exact content:

```md
# Sync Architecture

Stockify has two physical database environments today:

- Desktop local SQLite, owned by `apps/desktop`.
- Web/cloud Turso SQLite, owned by `apps/web`.

The important architecture boundary is not only physical. The codebase treats
data as three conceptual domains.

## 1. Shared Domain / Syncable

These tables represent product data and account data that can replicate between
desktop and cloud. They are defined in `packages/db-schema/src/index.ts`.

The sync contract for these tables lives in
`packages/db-schema/src/syncCatalog.ts` and is exported as
`@stockify/db-schema/sync-catalog`.

Every syncable table must declare:

- table name
- Drizzle table object
- sync scope: `user` or `organization`
- sync direction: currently `push-pull`
- owner: currently `shared-domain`

The catalog is the single source of truth for push validation, pull apply, sync
metadata checks, and legacy sync backfill ordering.

## 2. Desktop Local

These tables exist only in the desktop SQLite database and are declared in
`apps/desktop/src/db/schema.ts`.

Current examples:

- `sync_meta`
- `sync_queue`

They are operational state for this device. They should not be added to the
shared sync catalog.

## 3. Cloud Only

These tables exist only in the web/cloud database and are declared in
`apps/web/lib/db/schema.ts`.

Current examples:

- `sync_events`
- `sync_control`
- `runtime_log_entries`
- `runtime_log_launches`
- `runtime_log_meta`

They are server-side control, audit, or observability state. They should not be
added to the shared sync catalog.

## Rule for New Tables

Before adding a table, classify it:

- If both desktop and web store it as product/account data, add it to
  `packages/db-schema/src/index.ts` and classify it in the sync catalog.
- If it is local device state, add it only to `apps/desktop/src/db/schema.ts`.
- If it is cloud control, audit, or observability state, add it only to
  `apps/web/lib/db/schema.ts`.

Do not generate migrations for sync catalog-only changes. Generate migrations
only when Drizzle table definitions change.
```

- [ ] **Step 2: Check the doc contains no app-specific table in the shared catalog section**

Run:

```bash
rg -n "sync_queue|sync_meta|sync_events|sync_control|runtime_log" packages/db-schema/src/syncCatalog.ts
```

Expected: no output.

---

### Task 6: Run Final Verification

**Files:**
- Read: `packages/db-schema/src/syncCatalog.ts`
- Read: `apps/desktop/src/db/syncTableMap.ts`
- Read: `apps/web/lib/sync/tableRegistry.ts`
- Read: `apps/desktop/src/db/legacySyncBackfill.ts`
- Read: `docs/sync-architecture.md`

- [ ] **Step 1: Verify there is one domain sync catalog**

Run:

```bash
rg -n "const (SYNC_TABLE_MAP|TABLE_REGISTRY) = \\{" apps packages
```

Expected: no output.

- [ ] **Step 2: Verify compatibility names still exist**

Run:

```bash
rg -n "SYNC_TABLE_MAP|TABLE_REGISTRY|getSyncTableNames|getTablesForScope|getScopeForTable|isKnownTable" apps packages
```

Expected: existing callers still resolve to compatibility exports.

- [ ] **Step 3: Run desktop TypeScript validation**

Run:

```bash
pnpm desktop exec tsc --noEmit
```

Expected: no new sync-catalog-related errors.

- [ ] **Step 4: Run web TypeScript validation**

Run:

```bash
pnpm web exec tsc --noEmit
```

Expected: no new sync-catalog-related errors.

- [ ] **Step 5: Confirm no migrations were created**

Run:

```bash
git status --short apps/desktop/drizzle apps/web/drizzle
```

Expected: no output.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff -- packages/db-schema apps/desktop/src/db apps/web/lib/sync docs
```

Expected:

- one new shared catalog
- desktop and web registries reduced to wrappers
- legacy backfill using shared order
- architecture doc added
- no table definition changes
- no migration changes

---

## Self-Review

- Spec coverage: the plan creates a single shared sync catalog, keeps app-specific tables app-owned, preserves existing public names, documents the three conceptual domains, and avoids physical SQLite file splitting.
- Placeholder scan: no task depends on undefined files, undefined commands, or future design decisions.
- Type consistency: `SyncScope`, `SyncTableName`, `SYNC_CATALOG`, and compatibility exports are defined once and reused by desktop and web.
