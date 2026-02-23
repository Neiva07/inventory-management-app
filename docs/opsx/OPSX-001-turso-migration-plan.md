# OPSX-001: Firestore -> Turso Local-First Migration Plan

Date: 2026-02-21
Status: Draft
Owner: App/Core

## Why this plan
The current app uses Firestore across all domain models and relies on Firestore's offline cache in the renderer (`src/firebase.ts`). For desktop offline-first behavior and stronger control over sync/migrations, we will migrate to Turso with a local SQLite-first runtime model.

## Decision Summary
1. Runtime DB model: Turso local-first (SQLite on device + cloud sync), not Firestore cache-first.
2. Source of truth during runtime: local SQLite file.
3. Sync model: explicit push/pull with observable sync status in UI.
4. Conflict baseline: last-write-wins only for non-critical records; inventory uses deterministic ledger/transactions.
5. Subscription offline policy: signed entitlement token with term expiry plus shorter check-in expiry.

## Current Firestore Surface (to migrate)
Primary collections currently used in `src/model/*`:
- `users`
- `organizations`
- `user_memberships`
- `invitation_codes`
- `join_requests`
- `onboarding_sessions`
- `app_settings`
- `products`
- `product_categories`
- `units`
- `customers`
- `suppliers`
- `orders`
- `inbound_orders`
- `supplier_bills`
- `installment_payments`

Important current behaviors to preserve:
- Soft delete pattern (`deleted.isDeleted`, `deleted.date`).
- Search/pagination filters by `userID`, status, and date fields.
- Inventory mutation side-effects on order/inbound-order create/update/delete.
- Monetary values stored in minor units (cents) in many models.

## Target Turso Architecture
1. App process model:
- DB access moves behind a repository layer (single service boundary).
- Renderer does not talk directly to Firestore/Turso SDKs.
- Main process owns DB connection and sync orchestration.

2. Storage model:
- Local DB file per signed-in user (or per organization workspace if required).
- Cloud Turso database for backup/cross-device sync.
- `sync_state` metadata table to track last successful push/pull and pending ops.

3. Sync UX:
- Always show sync status (synced, pending changes, offline, sync error).
- Manual "Sync now" action in settings.
- Retry with exponential backoff when reconnecting.

## Data Model Strategy
Use relational normalization for nested Firestore structures.

Core table mapping:
- `products` + `product_variants` (variant array normalized)
- `orders` + `order_items`
- `inbound_orders` + `inbound_order_items` + `inbound_order_payments`
- `supplier_bills` + `installment_payments`
- `customers`, `suppliers`, `product_categories`, `units`
- `organizations`, `user_memberships`, `invitation_codes`, `join_requests`, `onboarding_sessions`
- `app_settings`

Shared columns on mutable business tables:
- `id TEXT PRIMARY KEY`
- `organization_id TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `deleted_at INTEGER NULL`
- `version INTEGER NOT NULL DEFAULT 1`

Indexes (minimum):
- `(organization_id, status)`
- `(organization_id, created_at)` for order-like entities
- `(organization_id, due_date)` for installments
- `(organization_id, name/trade_name/title)` for search lists

## Critical Inventory Rule (must change)
Current logic updates product inventory with incremental side-effects in write batches. That is fragile under concurrent/offline edits and conflict resolution.

Target rule:
1. Introduce `inventory_movements` append-only table:
- `id`, `organization_id`, `product_id`, `source_type`, `source_id`, `delta_base_unit`, `created_at`.
2. Inventory is computed from movements (materialized projection optional).
3. Order/inbound-order edits create compensating movements instead of mutating stock directly in-place.

This avoids corruption when two devices sync changes in different orders.

## Subscription + Offline Policy
Use signed entitlement tokens validated offline in the app.

Token payload (minimum):
- `sub` (user id)
- `org_id`
- `plan` (`monthly`, `annual`, etc.)
- `term_expires_at` (billing entitlement end)
- `check_in_by` (required online refresh deadline)
- `issued_at`, `token_id`

Validation behavior:
1. If now <= `term_expires_at` and now <= `check_in_by`: full access.
2. If now > `check_in_by` but within grace (ex: 7 days): warn + limited grace.
3. If beyond grace: lock paid features until reconnect.

Recommended defaults:
- Monthly plans: `check_in_by` every 30 days.
- Annual plans: can use 90-day check-in (or 30-day if stricter anti-abuse needed).
- Yes, annual subscribers can receive 1-year entitlement (`term_expires_at`) while still enforcing periodic check-ins.

Anti-tamper:
- Persist `last_trusted_server_time` and reject backward clock jumps for entitlement checks.

## Migration Phases
### Phase 0 - Preparation
- Freeze Firestore schema changes.
- Add repository interface layer without behavior changes.
- Add observability: sync status, failed write queue metrics, migration metrics.

Exit criteria:
- All data access routed through repositories.

### Phase 1 - Turso Schema + Local DB
- Create SQL migrations for all core tables and indexes.
- Implement local DB bootstrap and migration runner.
- Implement CRUD for low-risk entities first (`units`, `categories`, `customers`, `suppliers`).

Exit criteria:
- These entities fully run from local SQLite.

### Phase 2 - Transactional Entities + Inventory Ledger
- Migrate `orders`, `inbound_orders`, `supplier_bills`, `installment_payments`.
- Implement inventory movement ledger and projection.
- Validate parity with existing inventory outcomes.

Exit criteria:
- No direct stock mutation paths remain.

### Phase 3 - Sync + Entitlements
- Implement push/pull sync and conflict policy.
- Add subscription entitlement verifier and refresh flow.
- Add offline grace-state UX.

Exit criteria:
- App works offline for full business flows with entitlement checks.

### Phase 4 - Backfill + Dual Run
- One-time export/import from Firestore into Turso.
- Optional short dual-write period for confidence.
- Reconciliation scripts for row count and financial totals.

Exit criteria:
- Data parity checks pass for pilot organizations.

### Phase 5 - Cutover
- Stop Firestore writes.
- Keep Firestore read-only fallback for rollback window.
- Remove Firestore SDK dependencies after stabilization.

Exit criteria:
- Production on Turso only.

## Testing Matrix
- Unit: repository and entitlement verifier.
- Integration: order/inbound-order stock movements under offline/reconnect.
- Sync: concurrent edits from two devices on same org.
- Migration: Firestore export -> Turso import parity checks.
- Chaos: clock skew, reconnect storms, duplicate sync replay.

## Risks and Mitigations
1. Inventory drift after conflict resolution.
- Mitigation: movement ledger + reconciliation job.

2. Subscription bypass while offline.
- Mitigation: signed token + `check_in_by` + trusted server time.

3. Query regression/performance vs Firestore indexes.
- Mitigation: early index profiling with realistic dataset snapshots.

## First Implementation Slice (recommended)
1. Build repository interface and wire one entity (`units`) end-to-end on SQLite.
2. Add entitlement token validator in parallel (read-only enforcement path).
3. Build migration scripts and run on staging snapshot.

## Open Decisions Needed
1. Check-in policy for annual plan: 30 vs 90 days?
2. DB scope: per-user file or per-organization file?
3. Rollout style: direct cutover or 2-week dual-write?
