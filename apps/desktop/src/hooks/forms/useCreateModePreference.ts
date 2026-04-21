import { useState, useCallback } from 'react';

export type CreateModeEntity =
  | 'product'
  | 'supplier'
  | 'customer'
  | 'order'
  | 'inboundOrder';

const STORAGE_KEY_PREFIX = 'stockify:createMode:';

const storageKey = (entity: CreateModeEntity): string =>
  `${STORAGE_KEY_PREFIX}${entity}`;

const readPreference = (entity: CreateModeEntity): boolean => {
  try {
    return window.localStorage.getItem(storageKey(entity)) === 'true';
  } catch {
    return false;
  }
};

const writePreference = (entity: CreateModeEntity, value: boolean): void => {
  try {
    window.localStorage.setItem(storageKey(entity), String(value));
  } catch {
    // localStorage may be unavailable (quota, permissions); preference
    // simply falls back to in-memory state for this session.
  }
};

/**
 * Persists the per-entity "create mode" toggle used on creation forms.
 * Returns a tuple matching React.useState so call sites remain idiomatic.
 * The preference is scoped per entity so batch-creating one resource
 * (e.g. customers) doesn't leak into unrelated forms (e.g. products).
 */
export const useCreateModePreference = (
  entity: CreateModeEntity,
): [boolean, (value: boolean) => void] => {
  const [isCreateMode, setIsCreateModeState] = useState<boolean>(() =>
    readPreference(entity),
  );

  const setIsCreateMode = useCallback(
    (value: boolean) => {
      setIsCreateModeState(value);
      writePreference(entity, value);
    },
    [entity],
  );

  return [isCreateMode, setIsCreateMode];
};
