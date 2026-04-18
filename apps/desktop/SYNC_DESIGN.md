# Sync Architecture Design

Reference document for the Stockify bidirectional sync system. Covers the full architecture — desktop client and cloud backend — so both sides can be implemented independently against a shared contract.

## Overview

```
Login → full initial sync (pull all user-scoped data)
          |
Running → periodic bidirectional sync (15s)
          - UP:   flush sync_queue to cloud API
          - DOWN:  pull delta (updatedAt > watermark) per org
          |
Offline → writes accumulate in local sync_queue
          |
Reconnect → flush queue UP, then pull delta DOWN
```

- **Source of truth:** Cloud database
- **Conflict resolution:** Last-write-wins (server timestamp)
- **Local DB:** User-scoped mirror — only contains data for the logged-in user and their orgs

## Two Data Paths

### Path 1: Sync (queue-based, offline-capable)

All CRUD operations on business data (products, orders, customers, etc.) go through the sync queue. Local writes happen immediately to SQLite, then get enqueued for upload. Remote changes are pulled periodically and applied locally.

### Path 2: Direct API (online-only)

Operations where the data doesn't exist locally or must be authoritative:
- Login / upsert user (Clerk-based, already exists)
- Search organizations (querying orgs user doesn't belong to)
- Validate invitation code
- Join organization

After joining an org via the API path, the next sync-down cycle pulls that org's data into the local DB.

## Table Classification

### User-scoped (synced per user)
- `users`
- `app_settings`
- `onboarding_sessions`

### Org-scoped (synced per organization)
- `organizations`
- `user_memberships`
- `invitation_codes`
- `join_requests`
- `units`
- `product_categories`
- `customers`
- `suppliers`
- `supplier_product_categories`
- `products`
- `product_variants`
- `orders`
- `order_items`
- `inbound_order`
- `inbound_order_items`
- `inbound_order_payments`
- `supplier_bills`
- `installment_payments`

### Local-only (never synced)
- `sync_queue`
- `sync_meta`

---

## Cloud API Contract

Base URL: configured via `SYNC_API_URL` env var.

### Authentication

All requests include:
```
Authorization: Bearer {clerk-session-token}
X-Client-Id: {unique-device-id}
```

The cloud validates the Clerk session to identify the user and their org permissions.

---

### `POST /api/v1/sync/push`

Desktop sends local changes to cloud.

**Request:**
```ts
interface SyncPushRequest {
  clientId: string;
  changes: SyncPushChange[];
}

interface SyncPushChange {
  syncQueueId: string;
  organizationId: string;
  tableName: string;
  recordId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;  // full row data for create/update, { id } for delete
  clientTimestamp: number;
}
```

**Response:**
```ts
interface SyncPushResponse {
  accepted: string[];           // syncQueueIds successfully applied
  rejected: SyncPushRejection[];
  serverTimestamp: number;
}

interface SyncPushRejection {
  syncQueueId: string;
  reason: string;               // "conflict" | "unauthorized" | "invalid_payload" | "not_found"
}
```

**Server behavior:**
1. Validate user has permission for the given org
2. For each change, apply last-write-wins:
   - If cloud row has `updatedAt` newer than `clientTimestamp` → reject with "conflict"
   - Otherwise → apply the operation, set `updatedAt = serverNow`
3. Return accepted/rejected lists

---

### `POST /api/v1/sync/pull`

Desktop fetches changes from cloud since last sync.

**Request:**
```ts
interface SyncPullRequest {
  scopes: SyncPullScope[];
  limit?: number;               // max records per scope, default 500
}

interface SyncPullScope {
  type: "organization" | "user";
  id: string;
  lastSyncTimestamp: number;    // 0 for initial sync (pull everything)
}
```

**Response:**
```ts
interface SyncPullResponse {
  scopes: SyncPullScopeResult[];
  serverTimestamp: number;
}

interface SyncPullScopeResult {
  type: "organization" | "user";
  id: string;
  changes: SyncPullChange[];
  newWatermark: number;         // client stores this for next pull
  hasMore: boolean;             // true = client must paginate
}

interface SyncPullChange {
  tableName: string;
  recordId: string;
  operation: "upsert" | "delete";
  data: Record<string, unknown> | null;  // null for delete
  serverTimestamp: number;
}
```

**Server behavior:**
1. Validate user has access to each requested scope
2. For each scope, query all tables where `updatedAt > lastSyncTimestamp`, ordered by `updatedAt ASC`
3. Limit results per scope; set `hasMore = true` if more remain
4. Set `newWatermark` to the max `updatedAt` of returned changes
5. For user-scoped tables, filter by `userId`; for org-scoped, filter by `organizationId`

**Client pagination:** When `hasMore` is true, repeat the pull with `lastSyncTimestamp = newWatermark` until all scopes return `hasMore: false`.

---

### `GET /api/v1/organizations/search?q={term}`

Search orgs the user does NOT belong to.

**Response:**
```ts
interface OrgSearchResponse {
  organizations: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
}
```

---

### `POST /api/v1/organizations/{orgId}/validate-invitation`

**Request:**
```ts
{ code: string }
```

**Response:**
```ts
interface InvitationValidationResponse {
  valid: boolean;
  organizationId?: string;
  organizationName?: string;
  expiresAt?: number;
}
```

---

### `POST /api/v1/organizations/{orgId}/join`

**Request:**
```ts
{ invitationCode: string; message?: string }
```

**Response:**
```ts
interface JoinOrgResponse {
  membershipId: string;
  organizationId: string;
  role: string;
  status: string;
}
```

After joining, the client triggers an initial sync for the new org.

---

### `GET /api/v1/health`

**Response:**
```ts
{ status: "ok"; serverTimestamp: number }
```

---

## Cloud Backend — Sync Resolution Logic

When the cloud receives push requests, it must replay operations against cloud data tables. The replay logic:

```
For each sync_queue entry:
  1. Parse operation (create/update/delete) + table + payload
  2. Validate: does user have permission for this org/table?
  3. Check existing cloud row:
     - No row + create → INSERT with updatedAt = serverNow
     - Row exists + update → compare timestamps:
       - clientTimestamp >= cloud updatedAt → UPDATE, set updatedAt = serverNow (client wins)
       - clientTimestamp < cloud updatedAt → REJECT as "conflict" (cloud wins)
     - Row exists + delete → soft delete or hard delete, set updatedAt = serverNow
     - No row + delete → ignore (already deleted)
     - No row + update → treat as create (handle offline create+update sequence)
  4. Mark as accepted or rejected
```

### Edge Cases

| Scenario | Resolution |
|----------|-----------|
| User A deletes product, User B updates it | Delete wins (tombstone approach). If update arrives after delete, reject. |
| Client clock skew | Use server arrival timestamp, not client timestamp, for last-write-wins comparison. Client timestamp is informational only. |
| Offline for days, flushes 500 ops | Process in `createdAt` order as a batch. Each op gets `updatedAt = serverNow + offset_ms` to preserve ordering. |
| Same record updated multiple times in queue | Each operation is processed independently. Last one in the batch sets the final state. |
| Create + immediate delete in queue | Both are processed. Create inserts the row, delete removes it. Net result: no row. |

### Server Timestamp Authority

The server ALWAYS assigns the authoritative `updatedAt` when applying changes. Client timestamps are used only to detect conflicts (was the client working with stale data?). This avoids clock skew issues entirely.

---

## Sync Loop Prevention

Three layers ensure remote changes don't re-enqueue locally:

1. **`isSyncingDown` flag** — module-level boolean in `syncDown.ts`, checked by `syncTracking.ts`
2. **Direct Drizzle writes** — sync-down writes directly to DB via Drizzle ORM, bypassing model functions that call `trackPendingSyncChange`
3. **Client ID filtering (server)** — push includes `clientId`; pull can optionally exclude changes that originated from the same client (optimization, not required for correctness)

---

## Watermark Strategy

- Stored in local `sync_meta` table with keys like `watermark:org:{orgId}` and `watermark:user:{userId}`
- Value is the `newWatermark` returned by the last successful pull
- On initial sync: watermark = 0, which means "pull everything"
- After initial sync: `initialSyncComplete` flag set to prevent re-pulling everything on next launch

---

## Desktop Module Map

```
db/syncEngine.ts      — Orchestrator: runs every 15s, calls syncUp then syncDown
db/syncTransport.ts   — Sync-up: transforms queue items to API push request
db/syncDown.ts        — Sync-down: pulls delta from API, applies to local DB
db/syncApiClient.ts   — HTTP client wrapping all cloud API endpoints
db/syncMeta.ts        — Watermark persistence (read/write/clear)
db/syncTableMap.ts    — Table name → Drizzle schema registry with scope classification
db/syncQueue.ts       — Local queue CRUD (unchanged)
db/syncTracking.ts    — Enqueues local writes (with isSyncingDown guard)
db/syncState.ts       — Observable sync status for UI (unchanged)
db/syncRuntime.ts     — Lifecycle: start/stop/configure scope
model/cloudOps.ts     — Cloud-only operations (org search, join, invitation)
```
