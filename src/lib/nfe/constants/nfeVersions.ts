// NFE Schema Versions
export const NFE_VERSIONS = {
  V4_00: '4.00',
  V3_10: '3.10',
  V2_00: '2.00',
} as const;

export const CURRENT_NFE_VERSION = NFE_VERSIONS.V4_00;

// NFE Model Codes
export const NFE_MODELS = {
  NFE: '55',      // Nota Fiscal Eletrônica
  NFCe: '65',     // Nota Fiscal de Consumidor Eletrônica
} as const;

// NFE Environment Types
export const NFE_ENVIRONMENTS = {
  PRODUCTION: '1',
  HOMOLOGATION: '2',
} as const;

// NFE Emission Types
export const NFE_EMISSION_TYPES = {
  NORMAL: '1',
  CONTINGENCY: '2',
  SCAN: '3',
  EPEC: '4',
  FSDA: '5',
} as const;

// NFE Purpose Types
export const NFE_PURPOSES = {
  NORMAL: '1',
  COMPLEMENT: '2',
  ADJUSTMENT: '3',
  DEVOLUTION: '4',
} as const;

// NFE Document Types
export const NFE_DOCUMENT_TYPES = {
  OUTPUT: '0',
  INPUT: '1',
} as const;

// NFE Print Types
export const NFE_PRINT_TYPES = {
  WHITE: '0',
  RECEIPT: '1',
  SELF_ADHESIVE: '2',
  NORMAL: '3',
} as const;

// NFE Destination Types
export const NFE_DESTINATION_TYPES = {
  INTERNAL: '1',
  EXTERNAL: '2',
  INTERNAL_EXTERNAL: '3',
} as const;

// NFE Presence Types
export const NFE_PRESENCE_TYPES = {
  NOT_SPECIFIED: '0',
  OPERATIONAL: '1',
  NON_OPERATIONAL: '2',
  EXEMPTION: '3',
} as const;

// NFE Final Consumer Indicator
export const NFE_FINAL_CONSUMER = {
  NO: '0',
  YES: '1',
} as const; 