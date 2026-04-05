// Product Types and Indicators for NFE
export const PRODUCT_ORIGINS = {
  NATIONAL: '0',         // Nacional
  FOREIGN: '1',          // Estrangeira - Importação direta
  FOREIGN_SIMILAR: '2',  // Estrangeira - Adquirida no mercado interno
  NATIONAL_IMPORTED: '3', // Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%
  NATIONAL_IMPORTED_40: '4', // Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/67
  NATIONAL_IMPORTED_70: '5', // Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%
  FOREIGN_IMPORTED: '6', // Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução CAMEX
  FOREIGN_IMPORTED_7: '7', // Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX
  NATIONAL_IMPORTED_8: '8', // Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%
} as const;

export const PRODUCT_ORIGIN_NAMES = {
  '0': 'Nacional',
  '1': 'Estrangeira - Importação direta',
  '2': 'Estrangeira - Adquirida no mercado interno',
  '3': 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%',
  '4': 'Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos',
  '5': 'Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
  '6': 'Estrangeira - Importação direta, sem similar nacional',
  '7': 'Estrangeira - Adquirida no mercado interno, sem similar nacional',
  '8': 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%',
} as const;

// Scale Indicators
export const SCALE_INDICATORS = {
  YES: 'S',
  NO: 'N',
} as const;

// Total Inclusion Indicators
export const TOTAL_INCLUSION_INDICATORS = {
  YES: 'S',
  NO: 'N',
} as const;

// Tax Regimes
export const TAX_REGIMES = {
  SIMPLES: '1',          // Simples Nacional
  SIMPLIFIED: '2',       // Simples Nacional - excesso de sublimite da receita bruta
  NORMAL: '3',           // Regime Normal
} as const;

export const TAX_REGIME_NAMES = {
  '1': 'Simples Nacional',
  '2': 'Simples Nacional - excesso de sublimite da receita bruta',
  '3': 'Regime Normal',
} as const;

// IE Indicators
export const IE_INDICATORS = {
  CONTRIBUTOR: '1',      // Contribuinte
  EXEMPT: '2',           // Contribuinte isento de inscrição
  NON_CONTRIBUTOR: '9',  // Não Contribuinte
} as const;

export const IE_INDICATOR_NAMES = {
  '1': 'Contribuinte',
  '2': 'Contribuinte isento de inscrição',
  '9': 'Não Contribuinte',
} as const;

// ISSQN Indicators
export const ISSQN_INDICATORS = {
  EXEMPT: '1',           // Exigível
  NOT_EXEMPT: '2',       // Não incidência
  NOT_APPLICABLE: '3',   // Isenção
  EXEMPT_SS: '4',        // Exportação
  IMMUNE: '5',           // Imunidade
  OTHER: '6',            // Outros
  EXEMPT_FAVORED: '7',   // Suspenso por Decisão Judicial
} as const;

export const ISSQN_INDICATOR_NAMES = {
  '1': 'Exigível',
  '2': 'Não incidência',
  '3': 'Isenção',
  '4': 'Exportação',
  '5': 'Imunidade',
  '6': 'Outros',
  '7': 'Suspenso por Decisão Judicial',
} as const;

// Incentive Indicators
export const INCENTIVE_INDICATORS = {
  YES: '1',
  NO: '2',
} as const; 