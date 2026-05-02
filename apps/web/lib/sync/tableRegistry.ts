import {
  SYNC_CATALOG,
  getSyncCatalogEntry,
  getSyncScopeForTable,
  isSyncTableName,
  type SyncScope,
} from "@stockify/db-schema/sync-catalog";

export const TABLE_REGISTRY = SYNC_CATALOG;

export const getTableRegistryEntry = getSyncCatalogEntry;

export const isKnownTable = (tableName: string): boolean => isSyncTableName(tableName);

export const getScopeForTable = (tableName: string): SyncScope | null =>
  getSyncScopeForTable(tableName);
