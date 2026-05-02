import {
  SYNC_CATALOG,
  SYNC_TABLE_ORDER,
  getSyncCatalogEntry,
  getSyncTableNames,
  getSyncTablesForScope,
  type SyncScope,
  type SyncTableName,
} from "@stockify/db-schema/sync-catalog";

export { SYNC_TABLE_ORDER, getSyncCatalogEntry, getSyncTableNames, type SyncScope, type SyncTableName };

export const SYNC_TABLE_MAP = SYNC_CATALOG;

export const getTablesForScope = getSyncTablesForScope;
