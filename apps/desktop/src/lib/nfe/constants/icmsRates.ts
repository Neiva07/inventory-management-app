// ICMS Rates by Brazilian State
// Source: Brazilian tax regulations

export const ICMS_RATES = {
  // States
  AC: 19.0, // Acre
  AL: 19.0, // Alagoas
  AP: 18.0, // Amapá
  AM: 20.0, // Amazonas
  BA: 20.5, // Bahia
  CE: 20.0, // Ceará
  DF: 20.0, // Distrito Federal
  ES: 17.0, // Espírito Santo
  GO: 19.0, // Goiás
  MA: 22.0, // Maranhão
  MG: 18.0, // Minas Gerais
  MS: 17.0, // Mato Grosso do Sul
  MT: 17.0, // Mato Grosso
  PA: 19.0, // Pará
  PB: 20.0, // Paraíba
  PE: 20.5, // Pernambuco
  PI: 21.0, // Piauí
  PR: 19.5, // Paraná
  RJ: 20.0, // Rio de Janeiro
  RN: 18.0, // Rio Grande do Norte
  RS: 17.0, // Rio Grande do Sul
  RO: 19.5, // Rondônia
  RR: 20.0, // Roraima
  SC: 17.0, // Santa Catarina
  SE: 19.0, // Sergipe
  SP: 18.0, // São Paulo
  TO: 20.0, // Tocantins
} as const;

export const ICMS_RATE_NAMES = {
  'AC': 'Acre (19%)',
  'AL': 'Alagoas (19%)',
  'AP': 'Amapá (18%)',
  'AM': 'Amazonas (20%)',
  'BA': 'Bahia (20,5%)',
  'CE': 'Ceará (20%)',
  'DF': 'Distrito Federal (20%)',
  'ES': 'Espírito Santo (17%)',
  'GO': 'Goiás (19%)',
  'MA': 'Maranhão (22%)',
  'MG': 'Minas Gerais (18%)',
  'MS': 'Mato Grosso do Sul (17%)',
  'MT': 'Mato Grosso (17%)',
  'PA': 'Pará (19%)',
  'PB': 'Paraíba (20%)',
  'PE': 'Pernambuco (20,5%)',
  'PI': 'Piauí (21%)',
  'PR': 'Paraná (19,5%)',
  'RJ': 'Rio de Janeiro (20%)',
  'RN': 'Rio Grande do Norte (18%)',
  'RS': 'Rio Grande do Sul (17%)',
  'RO': 'Rondônia (19,5%)',
  'RR': 'Roraima (20%)',
  'SC': 'Santa Catarina (17%)',
  'SE': 'Sergipe (19%)',
  'SP': 'São Paulo (18%)',
  'TO': 'Tocantins (20%)',
} as const;

// Type for ICMS rates
export type ICMSRateState = keyof typeof ICMS_RATES;
export type ICMSRateValue = typeof ICMS_RATES[ICMSRateState];

// Helper function to get ICMS rate by state
export function getICMSRate(state: ICMSRateState): ICMSRateValue {
  return ICMS_RATES[state];
}

// Helper function to get ICMS rate by state code (number)
export function getICMSRateByCode(stateCode: string): ICMSRateValue {
  // Map state codes to state abbreviations
  const stateCodeMap: Record<string, ICMSRateState> = {
    '12': 'AC', // Acre
    '27': 'AL', // Alagoas
    '16': 'AP', // Amapá
    '13': 'AM', // Amazonas
    '29': 'BA', // Bahia
    '23': 'CE', // Ceará
    '53': 'DF', // Distrito Federal
    '32': 'ES', // Espírito Santo
    '52': 'GO', // Goiás
    '21': 'MA', // Maranhão
    '31': 'MG', // Minas Gerais
    '50': 'MS', // Mato Grosso do Sul
    '51': 'MT', // Mato Grosso
    '15': 'PA', // Pará
    '25': 'PB', // Paraíba
    '26': 'PE', // Pernambuco
    '22': 'PI', // Piauí
    '41': 'PR', // Paraná
    '33': 'RJ', // Rio de Janeiro
    '24': 'RN', // Rio Grande do Norte
    '43': 'RS', // Rio Grande do Sul
    '11': 'RO', // Rondônia
    '14': 'RR', // Roraima
    '42': 'SC', // Santa Catarina
    '28': 'SE', // Sergipe
    '35': 'SP', // São Paulo
    '17': 'TO', // Tocantins
  };
  
  const stateAbbr = stateCodeMap[stateCode];
  if (!stateAbbr) {
    throw new Error(`Invalid state code: ${stateCode}`);
  }
  
  return ICMS_RATES[stateAbbr];
}

// Default ICMS rate (fallback)
export const DEFAULT_ICMS_RATE: ICMSRateValue = 19.0; // Pará rate as default 