// NFE (Nota Fiscal Eletrônica) Module
// Main exports for NFE functionality

// Types
export * from './types';

// Constants
export * from './constants';

// Generators
export * from './generators/nfeGenerator';

// Validators
export * from './validators/nfeValidator';

// Utils
export * from './utils/xmlUtils';

// Main NFE service class
export { NFEGenerator } from './generators/nfeGenerator';
export { validateNFE, type NFEValidationResult } from './validators/nfeValidator';
export { generateXML } from './utils/xmlUtils';

// Adapters
export { adaptOrderToNFE, type OrderToNFEAdapterConfig } from './adapters/orderAdapter'; 