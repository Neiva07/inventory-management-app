// CFOP (Código Fiscal de Operações e Prestações) Codes
// Most common CFOP codes for sales and purchases

export const CFOP_CODES = {
  // Sales (Output)
  SALE_INTERNAL: '5102',      // Venda de mercadoria adquirida ou recebida de terceiros
  SALE_EXTERNAL: '6102',      // Venda de mercadoria adquirida ou recebida de terceiros
  SALE_INDUSTRIAL: '5101',    // Venda de produção própria
  SALE_INDUSTRIAL_EXTERNAL: '6101', // Venda de produção própria
  SALE_RETURN: '1202',        // Devolução de venda de mercadoria adquirida ou recebida de terceiros
  SALE_RETURN_EXTERNAL: '2202', // Devolução de venda de mercadoria adquirida ou recebida de terceiros
  
  // Purchases (Input)
  PURCHASE_INTERNAL: '1102',  // Entrada de mercadoria adquirida
  PURCHASE_EXTERNAL: '2102',  // Entrada de mercadoria adquirida
  PURCHASE_RETURN: '5102',    // Devolução de mercadoria vendida
  PURCHASE_RETURN_EXTERNAL: '6102', // Devolução de mercadoria vendida
  
  // Transfers
  TRANSFER_IN: '1151',        // Transferência para industrialização
  TRANSFER_OUT: '5151',       // Transferência para industrialização
  TRANSFER_IN_SALE: '1152',   // Transferência para comercialização
  TRANSFER_OUT_SALE: '5152',  // Transferência para comercialização
  
  // Services
  SERVICE_INTERNAL: '1101',   // Entrada de mercadoria com prestação de serviço
  SERVICE_EXTERNAL: '2101',   // Entrada de mercadoria com prestação de serviço
  SERVICE_OUTPUT: '5101',     // Saída de mercadoria com prestação de serviço
  SERVICE_OUTPUT_EXTERNAL: '6101', // Saída de mercadoria com prestação de serviço
} as const;

export const CFOP_NAMES = {
  '5102': 'Venda de mercadoria adquirida ou recebida de terceiros',
  '6102': 'Venda de mercadoria adquirida ou recebida de terceiros',
  '5101': 'Venda de produção própria',
  '6101': 'Venda de produção própria',
  '1202': 'Devolução de venda de mercadoria adquirida ou recebida de terceiros',
  '2202': 'Devolução de venda de mercadoria adquirida ou recebida de terceiros',
  '1102': 'Entrada de mercadoria adquirida',
  '2102': 'Entrada de mercadoria adquirida',
  '1151': 'Transferência para industrialização',
  '5151': 'Transferência para industrialização',
  '1152': 'Transferência para comercialização',
  '5152': 'Transferência para comercialização',
  '1101': 'Entrada de mercadoria com prestação de serviço',
  '2101': 'Entrada de mercadoria com prestação de serviço',
} as const; 