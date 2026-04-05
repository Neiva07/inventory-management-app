## Why

The current desktop app is built on Firebase/Firestore, but the product direction is offline-first and local durability. Migrating to Turso with a local SQLite primary model improves desktop reliability, reduces online dependency for core operations, and aligns better with future subscription controls.

## What Changes

- Replace Firestore/Firebase persistence in the app data layer with Turso-backed SQLite access.
- Introduce Drizzle ORM as the database access and schema management layer.
- Redesign the data model toward a normalized SQL schema where practical (entities, relations, constraints, and indexes).
- Adopt local-first runtime behavior: local database as the primary source of truth.
- Add online sync behavior so local changes synchronize to cloud whenever connectivity is available.
- Keep subscription validation implementation out of scope for this change, but define the operational policy baseline: users must check in online at least once per month.

## Capabilities

### New Capabilities
- `turso-local-first-storage`: Persist and query business data from a local SQLite/Turso database as the primary runtime store.
- `cloud-sync-replication`: Sync local data with a cloud Turso database when online, including retry behavior after offline periods.
- `drizzle-schema-management`: Manage schema, migrations, and typed queries through Drizzle.

### Modified Capabilities
- None.

## Impact

- Data access layer and model modules currently using Firebase/Firestore APIs.
- Application initialization/bootstrap where database clients are configured.
- Build/runtime dependencies: remove Firebase data dependencies, add Turso + Drizzle dependencies.
- Schema and migration workflow for normalized SQL tables and indexes.
- Operational behavior for offline/online transitions and eventual sync.
- Subscription policy alignment (monthly online revalidation requirement documented, implementation deferred).
