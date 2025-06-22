// Collection names used across all models
export type CollectionName = 
  | 'products'
  | 'product_categories'
  | 'customers'
  | 'suppliers'
  | 'orders'
  | 'units';

// Export collection names as constants for consistency
export const COLLECTION_NAMES = {
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product_categories',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  ORDERS: 'orders',
  UNITS: 'units'
} as const;

// Export payment methods
export * from './paymentMethods';
