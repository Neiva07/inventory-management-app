# Offline/Intermittent Connectivity Validation

This checklist validates desktop end-to-end behavior for local-first Turso/Drizzle flows under offline and unstable connectivity.

## Preconditions

- Run local migration/bootstrap once:
  - `pnpm db:migrate:local`
- Seed test data scope:
  - `pnpm run verify:core-flows`
- Ensure cloud URL/token are configured for sync scenarios:
  - `TURSO_DATABASE_URL`
  - `TURSO_AUTH_TOKEN`

## Scenario 1: Offline CRUD (Reference + Transactional)

1. Disconnect network.
2. Open app and verify lists still load:
   - Units, Categories, Products, Suppliers, Customers.
3. Create records while offline:
   - Product
   - Order (status `complete`)
   - Inbound order (status `complete`)
4. Verify immediate local effects:
   - New records appear in lists/details without reconnect.
   - Inventory is decremented by order and incremented by inbound order.
5. Verify pending sync state:
   - `sync_queue` has new `pending` rows for each write.

## Scenario 2: Reconnect + Automatic Retry

1. Re-enable network.
2. Wait for sync interval trigger (or app online event).
3. Verify queue transitions:
   - `pending/failed -> syncing -> synced`.
4. Simulate transient failure (invalid cloud token or temporary disconnect).
5. Confirm failed rows are retained with backoff:
   - status `failed`
   - `attempts` incremented
   - `next_attempt_at` in the future.
6. Restore valid network/token and confirm retry eventually marks rows `synced`.

## Scenario 3: Organization Scoping

1. In organization A, create records for each core domain.
2. Switch to organization B and repeat.
3. Validate list views and searches only return current-organization data.
4. Validate detail views (`order`, `inbound order`, `supplier bill`, `installment`) do not leak cross-org records.

## Scenario 4: App Restart During Pending Sync

1. Create offline writes.
2. Close app before reconnect.
3. Reopen app with network enabled.
4. Confirm pending rows persist across restart and eventually sync.

## Fast Verification Commands

- Core CRUD/list/pagination/stock parity:
  - `pnpm run verify:core-flows`
- Offline write + retry behavior:
  - `pnpm run verify:offline-sync`
