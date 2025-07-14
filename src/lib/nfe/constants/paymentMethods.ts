// Payment Methods for NFE
export const PAYMENT_METHODS = {
  CASH: '01',           // Dinheiro
  CHECK: '02',          // Cheque
  CREDIT_CARD: '03',    // Cartão de Crédito
  DEBIT_CARD: '04',     // Cartão de Débito
  CREDIT_STORE: '05',   // Crédito Loja
  VALE_ALIMENTACAO: '06', // Vale Alimentação
  VALE_REFEICAO: '07',  // Vale Refeição
  VALE_PRESENTE: '08',  // Vale Presente
  VALE_COMBUSTIVEL: '09', // Vale Combustível
  BANK_TRANSFER: '10',  // Boleto Bancário
  SEM_PAGAMENTO: '90',  // Sem Pagamento
  OUTROS: '99',         // Outros
} as const;

export const PAYMENT_METHOD_NAMES = {
  '01': 'Dinheiro',
  '02': 'Cheque',
  '03': 'Cartão de Crédito',
  '04': 'Cartão de Débito',
  '05': 'Crédito Loja',
  '06': 'Vale Alimentação',
  '07': 'Vale Refeição',
  '08': 'Vale Presente',
  '09': 'Vale Combustível',
  '10': 'Boleto Bancário',
  '90': 'Sem Pagamento',
  '99': 'Outros',
} as const;

// Freight Modes
export const FREIGHT_MODES = {
  BY_SENDER: '0',       // Por conta do remetente
  BY_RECIPIENT: '1',    // Por conta do destinatário
  BY_THIRD_PARTY: '2',  // Por conta de terceiros
  OWN: '3',             // Próprio remetente
  BY_RECIPIENT_SENDER: '4', // Por conta do destinatário/remetente
  NO_FREIGHT: '9',      // Sem frete
} as const;

export const FREIGHT_MODE_NAMES = {
  '0': 'Por conta do remetente',
  '1': 'Por conta do destinatário',
  '2': 'Por conta de terceiros',
  '3': 'Próprio remetente',
  '4': 'Por conta do destinatário/remetente',
  '9': 'Sem frete',
} as const;

// Transport Types
export const TRANSPORT_TYPES = {
  MARITIME: '1',        // Marítima
  FLUVIAL: '2',         // Fluvial
  LACUSTRE: '3',        // Lacustre
  AERIAL: '4',          // Aérea
  POSTAL: '5',          // Postal
  RAILWAY: '6',         // Ferroviária
  ROAD: '7',            // Rodoviária
  ROAD_RAIL: '8',       // Rodoviário-trem
  OTHER: '9',           // Outros
} as const;

export const TRANSPORT_TYPE_NAMES = {
  '1': 'Marítima',
  '2': 'Fluvial',
  '3': 'Lacustre',
  '4': 'Aérea',
  '5': 'Postal',
  '6': 'Ferroviária',
  '7': 'Rodoviária',
  '8': 'Rodoviário-trem',
  '9': 'Outros',
} as const; 