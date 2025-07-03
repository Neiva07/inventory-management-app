// Collection names used across all models
export type CollectionName = 
  | 'products'
  | 'product_categories'
  | 'customers'
  | 'suppliers'
  | 'orders'
  | 'inbound_orders'
  | 'units'
  | 'supplier_bills'
  | 'installment_payments';

// Export collection names as constants for consistency
export const COLLECTION_NAMES = {
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product_categories',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  ORDERS: 'orders',
  INBOUND_ORDERS: 'inbound_orders',
  UNITS: 'units',
  SUPPLIER_BILLS: 'supplier_bills',
  INSTALLMENT_PAYMENTS: 'installment_payments'
} as const;

// Export payment methods
export * from './paymentMethods';
