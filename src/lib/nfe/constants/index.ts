// NFE Constants and Codes
export * from './nfeVersions';
export * from './ufCodes';
export * from './paymentMethods';
export * from './productTypes';
export * from './cfopCodes';
export * from './ncmCodes';
export * from './icmsRates';

// Re-export commonly used constants for easier access
export {
  NFE_VERSIONS,
  CURRENT_NFE_VERSION,
  NFE_MODELS,
  NFE_ENVIRONMENTS,
  NFE_EMISSION_TYPES,
  NFE_PURPOSES,
  NFE_DOCUMENT_TYPES,
  NFE_PRINT_TYPES,
  NFE_DESTINATION_TYPES,
  NFE_PRESENCE_TYPES,
  NFE_FINAL_CONSUMER,
} from './nfeVersions';

export {
  PAYMENT_METHODS,
  PAYMENT_METHOD_NAMES,
  FREIGHT_MODES,
  FREIGHT_MODE_NAMES,
  TRANSPORT_TYPES,
  TRANSPORT_TYPE_NAMES,
} from './paymentMethods';

export {
  PRODUCT_ORIGINS,
  PRODUCT_ORIGIN_NAMES,
  SCALE_INDICATORS,
  TOTAL_INCLUSION_INDICATORS,
  TAX_REGIMES,
  TAX_REGIME_NAMES,
  IE_INDICATORS,
  IE_INDICATOR_NAMES,
  ISSQN_INDICATORS,
  ISSQN_INDICATOR_NAMES,
  INCENTIVE_INDICATORS,
} from './productTypes';

export {
  CFOP_CODES,
  CFOP_NAMES,
} from './cfopCodes';

export {
  NCM_CODES,
  NCM_NAMES,
} from './ncmCodes';

export {
  ICMS_RATES,
  ICMS_RATE_NAMES,
  getICMSRate,
  getICMSRateByCode,
  DEFAULT_ICMS_RATE,
  type ICMSRateState,
  type ICMSRateValue,
} from './icmsRates'; 