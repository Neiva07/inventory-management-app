## Context

The current app uses Firebase/Firestore directly from model modules in the renderer layer and relies on Firestore offline cache behavior. For an Electron desktop product, we want deterministic local persistence with explicit sync behavior rather than cloud-first SDK semantics.

This change introduces Turso + Drizzle as the new persistence stack. Since the project is still in development, we do not need a production data backfill from Firestore. We still need a safe implementation path to avoid breaking existing inventory, order, and billing flows.

Constraints:
- Desktop-first behavior: core business operations must work offline.
- Existing domain logic in `src/model/*` currently depends on Firestore queries and batched writes.
- Subscription revalidation policy (monthly online check-in) must be reflected in architecture, but enforcement is out of scope for this change.

## Goals / Non-Goals

**Goals:**
- Replace Firestore/Firebase data persistence with Turso-backed local SQLite using Drizzle ORM.
- Use normalized SQL schema where practical, with clear relations and indexes.
- Make local DB the primary source of truth for reads and writes.
- Add online sync strategy so local changes replicate when connectivity is available.
- Preserve current business behavior (CRUD, list filters, stock-affecting order/inbound-order workflows).

**Non-Goals:**
- Implementing subscription enforcement logic or billing state machine.
- Migrating historical production data from Firestore.
- Delivering a full multi-device conflict-free collaboration system in this first pass.

## Decisions

### Decision 1: Use a repository boundary and replace direct Firestore calls
- Choice: Introduce a database/repository abstraction and route all model operations through Drizzle-backed repositories.
- Rationale: Current direct Firestore coupling makes replacement risky and hard to test. A clear boundary allows incremental migration entity-by-entity.
- Alternatives considered:
  - Keep direct SDK calls and swap imports only: faster short-term, but brittle and high regression risk.
  - Big-bang rewrite of all model modules at once: high delivery risk and hard rollback.

### Decision 2: Local SQLite file is authoritative at runtime
- Choice: Use local SQLite (via Turso/libsql) as first-write and first-read store; sync is asynchronous.
- Rationale: This matches desktop offline expectations and avoids network latency for normal operations.
- Alternatives considered:
  - Cloud-first writes with local cache: closer to Firestore behavior, but weaker offline guarantees.
  - Dual-write local+cloud on every request: more complexity and failure modes without strong benefit.

### Decision 3: Normalize schema for core aggregates and relations
- Choice: Move nested document structures to relational tables (for example `orders` + `order_items`, `inbound_orders` + `inbound_order_items`, `supplier_bills` + `installment_payments`, `products` + related tables as needed).
- Rationale: SQL queries, integrity constraints, and indexing become explicit and easier to evolve.
- Alternatives considered:
  - Store large JSON blobs in SQL columns: lower migration effort but weaker queryability and integrity.
  - Full 3NF everywhere immediately: maximum normalization but slower migration; we will normalize where it improves integrity/query behavior most.

### Decision 4: Preserve monetary minor-unit storage and soft-delete semantics
- Choice: Keep integer minor units for money and continue soft deletes with `deleted_at` semantics.
- Rationale: This keeps financial precision and minimizes behavior drift versus current code.
- Alternatives considered:
  - Switch to decimal storage now: possible but introduces conversion and consistency risk during migration.
  - Hard delete records: simpler but loses auditability and recoverability.

### Decision 5: Sync model is opportunistic with explicit status
- Choice: Run sync whenever app detects online state and on periodic/background triggers; expose sync state in UI diagnostics.
- Rationale: Users need predictable offline operation and clear visibility when cloud replication is delayed.
- Alternatives considered:
  - Manual sync only: lower complexity but poor UX and stale cloud state.
  - Aggressive continuous sync loops: more resource use and noisy failure behavior when networks are unstable.

### Decision 6: Subscription policy is architecture-only in this change
- Choice: Define monthly online check-in as a policy requirement and reserve implementation for a follow-up change.
- Rationale: Keeps this migration focused on database replacement while documenting the dependency.
- Alternatives considered:
  - Implement subscription checks now: scope expansion and delayed migration completion.

## Risks / Trade-offs

- [Schema mismatch with current Firestore usage] → Mitigation: migrate entity-by-entity with parity checks against existing model behavior.
- [Inventory drift during migration of order flows] → Mitigation: add focused tests for stock deltas on create/update/delete for orders and inbound orders.
- [Sync conflicts from multi-device edits] → Mitigation: start with deterministic conflict policy (for example updated-at based for non-critical fields) and log conflict metrics for follow-up hardening.
- [Performance regressions from missing SQL indexes] → Mitigation: define indexes based on current query filters (`userID`, status, dates, text prefix fields) before cutover.
- [Incomplete removal of Firestore dependencies] → Mitigation: keep a migration checklist and CI grep guard for `firebase/firestore` imports in application data modules.

## Migration Plan

1. Add Turso/libsql + Drizzle dependencies and schema/migration toolchain.
2. Introduce DB bootstrap and repository interfaces.
3. Implement normalized schema and migrations for reference entities first (units, categories, customers, suppliers).
4. Migrate transactional entities (orders, inbound orders, supplier bills, installments) with behavior parity tests.
5. Implement sync orchestration (online detection, retry policy, status reporting).
6. Remove Firestore data-path usage from app runtime and keep temporary fallback behind a feature flag during validation.
7. Validate end-to-end flows and remove fallback path once stable.

Rollback strategy:
- During migration, keep a controlled fallback path to Firestore behind an internal flag.
- If critical regression appears, switch the flag back while preserving local DB files for diagnostics.
- Because no data migration is required, rollback does not require backfill reversal.

## Open Questions

- What exact Turso sync mechanism/SDK mode will be used in Electron for local file + cloud replication?
- Should local databases be scoped per user, per organization, or both?
- What is the minimal conflict-resolution policy needed for shared organization data in V1?
- What observability is required in UI (simple status badge vs detailed sync diagnostics)?
- For subscription policy, should future check-in cadence be strictly 30 days or configurable by plan tier?
