## 1. Foundation and Tooling

- [x] 1.1 Add Turso/libsql and Drizzle dependencies and remove Firestore runtime dependency from the persistence path
- [x] 1.2 Add Drizzle configuration and migration scripts for local development and CI
- [x] 1.3 Create database bootstrap module for local SQLite initialization and migration execution

## 2. Schema and Migration Setup

- [x] 2.1 Define normalized schema tables and relations for core reference entities (units, product categories, customers, suppliers)
- [x] 2.2 Define normalized schema tables and relations for transactional entities (orders/order_items, inbound_orders/inbound_order_items/payments, supplier_bills, installment_payments)
- [x] 2.3 Add required indexes for existing query patterns (owner/status/date/search)
- [x] 2.4 Implement soft-delete and timestamp conventions in schema (`created_at`, `updated_at`, `deleted_at`)

## 3. Repository Layer Migration

- [x] 3.1 Introduce repository interfaces for data operations currently using Firestore
- [x] 3.2 Implement Drizzle repositories for reference entities and wire them into existing model call sites
- [x] 3.3 Implement Drizzle repositories for transactional entities and wire them into existing model call sites
- [x] 3.4 Preserve monetary minor-unit handling and status semantics during repository migration

## 4. Local-First Runtime and Sync

- [x] 4.1 Implement local-first read/write flow where all runtime operations target local SQLite first
- [x] 4.2 Add pending-change tracking needed for cloud replication
- [x] 4.3 Implement online-triggered sync execution with retry behavior for transient failures
- [x] 4.4 Expose sync state for UI/status reporting (synced, pending, error)

## 5. Firestore Decommissioning and Verification

- [x] 5.1 Remove/disable Firestore data-path imports and runtime usage in migrated modules
- [x] 5.2 Add automated checks for behavior parity on core flows (CRUD, list filters, pagination, stock-affecting operations)
- [x] 5.3 Add targeted tests for offline writes, reconnect sync, and retry behavior
- [x] 5.4 Validate end-to-end desktop flows under offline and intermittent connectivity conditions

## 6. Documentation and Follow-ups

- [x] 6.1 Document operational runbook for local DB, migrations, and sync troubleshooting
- [x] 6.2 Document deferred subscription revalidation implementation scope (monthly online check-in policy)
