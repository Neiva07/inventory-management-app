export interface CompatDocSnapshot<T> {
  id: string;
  data: () => T;
  exists: () => boolean;
}

export interface CompatQuerySnapshot<T> {
  docs: CompatDocSnapshot<T>[];
  empty: boolean;
  size: number;
}

export const makeDocSnapshot = <T>(id: string, value: T | null): CompatDocSnapshot<T> => ({
  id,
  data: () => value as T,
  exists: () => value !== null,
});

export const makeQuerySnapshot = <T extends { id: string }>(values: T[]): CompatQuerySnapshot<T> => {
  const docs = values.map((value) => makeDocSnapshot(value.id, value));
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
  };
};

