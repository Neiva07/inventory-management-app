## Why

Every `trackPendingSyncChange` call for `create` and `update` operations passes the raw UI input object as the sync payload instead of the transformed data that was actually inserted into the local SQLite database. When the cloud push handler applies these payloads, Drizzle receives wrong field names, missing primary keys, unconverted values, and raw objects instead of JSON strings — causing `SQLITE_CONSTRAINT_NOTNULL` failures and silent data corruption on every synced table. Deletes and simple state-change operations (deactivate/activate) are unaffected because they manually construct correct payloads.

## What Changes

- **Fix all `create` sync payloads (~9 call sites across 8 model files)**: Build the payload from the same object literal passed to `db.insert().values(...)`, ensuring it includes the generated `id`, `publicId`, resolved `organizationId`, converted amounts (cents), and JSON-stringified nested objects.
- **Fix all `update` sync payloads (~9 call sites across 8 model files)**: Build the payload from the same object literal passed to `db.update().set(...)`, ensuring field names and value transformations match what was written to the local DB.
- **Fix `adjustProductInventory` payload**: Send the new absolute `inventoryBaseUnit` value instead of `deltaBaseUnit`, since the cloud handler does a direct set, not an increment.
- **Fix `recordPayment` payload in installment payments**: Send `paidAmountCents` (converted) instead of raw `paidAmount`.
- **Add the `id` field to the push handler's `insertData` on the cloud side**: Use `change.recordId` as a fallback for the primary key when the payload doesn't include `id`, as a safety net for in-flight sync queue entries created before the desktop fix is deployed.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `cloud-sync-replication`: The sync payload contract between desktop and cloud is being corrected — payloads must use Drizzle schema field names and include the record's primary key on creates. This is a bug fix to an existing requirement (opportunistic cloud replication), not a new capability.

## Impact

- **Desktop model layer** (`apps/desktop/src/model/`): All 8 model files with `trackPendingSyncChange` calls for create/update operations — `products.ts`, `orders.ts`, `suppliers.ts`, `customer.ts`, `units.ts`, `productCategories.ts`, `supplierBill.ts`, `inboundOrder.ts`, `installmentPayment.ts`.
- **Cloud push handler** (`apps/web/lib/sync/pushHandler.ts`): Small safety-net change to inject `id` from `recordId` when missing.
- **Existing sync queue**: Pending entries in local `sync_queue` tables on deployed desktops will still have malformed payloads — the cloud-side fallback handles these gracefully until they drain.
- **No schema changes**: No migrations needed. No API contract changes. The push endpoint shape is unchanged; only the payload _content_ is corrected.
- **No breaking changes**: The cloud handler's fallback is additive, and the desktop changes only fix what was already broken.
