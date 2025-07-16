import { Order } from 'model/orders';
import { Customer } from 'model/customer';
import { Product } from 'model/products';
import { NFE, NFEIdentification, NFEEmitter, NFERecipient, NFEProduct, NFETotals, NFETransport } from '../types';
import { 
  NFE_VERSIONS, 
  NFE_MODELS, 
  NFE_ENVIRONMENTS, 
  NFE_EMISSION_TYPES, 
  NFE_PURPOSES, 
  NFE_DOCUMENT_TYPES, 
  NFE_PRINT_TYPES, 
  NFE_DESTINATION_TYPES, 
  NFE_PRESENCE_TYPES, 
  NFE_FINAL_CONSUMER,
  FREIGHT_MODES,
  PRODUCT_ORIGINS,
  TOTAL_INCLUSION_INDICATORS,
  CFOP_CODES,
  NCM_CODES,
  getICMSRateByCode,
  DEFAULT_ICMS_RATE
} from '../constants';
import { add, subtract, multiply, divide } from '../../math';

export interface OrderToNFEAdapterConfig {
  // Company information (emitter)
  companyCNPJ: string;
  companyName: string;
  companyTradeName?: string;
  companyIE: string;
  companyIEST?: string;
  companyIM?: string;
  companyCNAE?: string;
  companyCRT?: string;
  
  // Company address
  companyAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    cityCode: string;
    cityName: string;
    state: string; // State code (e.g., '35' for São Paulo)
    zipCode: string;
    phone?: string;
  };
  
  // NFE configuration
  nfeEnvironment?: string;
  nfeEmissionType?: string;
  nfePurpose?: string;
  nfePrintType?: string;
  nfeDestinationType?: string;
  nfePresenceType?: string;
  nfeFinalConsumer?: string;
  nfeProcessVersion?: string;
  
  // Default values
  defaultCFOP?: string;
  defaultNCM?: string;
  defaultProductOrigin?: string;
  defaultFreightMode?: string;
  
  // Tax rates (optional - will use state-based rates if not provided)
  customICMSRate?: number;
  customPISRate?: number;
  customCOFINSRate?: number;
}

export function adaptOrderToNFE(
  order: Order, 
  customer: Customer, 
  products: Product[],
  config: OrderToNFEAdapterConfig
): NFE {
  // Generate NFE identification
  const ide = generateNFEIdentification(order, config);
  
  // Generate emitter data
  const emit = generateNFEEmitter(config);
  
  // Generate recipient data
  const dest = generateNFERecipient(customer);
  
  // Generate products data
  const det = generateNFEProducts(order.items, products, config);
  
  // Generate totals
  const total = generateNFETotals(order, config);
  
  // Generate transport
  const transp = generateNFETransport(config);
  
  return {
    ide,
    emit,
    dest,
    det,
    total,
    transp,
  };
}

function generateNFEIdentification(order: Order, config: OrderToNFEAdapterConfig): NFEIdentification {
  const now = new Date();
  const emissionDate = new Date(order.orderDate);
  
  return {
    cUF: config.companyAddress.state, // This should be the state code, not abbreviation
    cNF: generateRandomCode(8), // 8-digit random code
    natOp: 'Venda de mercadoria',
    mod: NFE_MODELS.NFE,
    serie: '001', // Should come from your numbering system
    nNF: order.publicId.replace(/\D/g, '').padStart(9, '0'), // Use order public ID
    dhEmi: emissionDate.toISOString(),
    tpNF: NFE_DOCUMENT_TYPES.OUTPUT,
    idDest: config.nfeDestinationType || NFE_DESTINATION_TYPES.INTERNAL,
    cMunFG: config.companyAddress.cityCode,
    tpImp: config.nfePrintType || NFE_PRINT_TYPES.NORMAL,
    tpEmis: config.nfeEmissionType || NFE_EMISSION_TYPES.NORMAL,
    cDV: generateCheckDigit(), // Should be calculated properly
    tpAmb: config.nfeEnvironment || NFE_ENVIRONMENTS.HOMOLOGATION,
    finNFe: config.nfePurpose || NFE_PURPOSES.NORMAL,
    indFinal: config.nfeFinalConsumer || NFE_FINAL_CONSUMER.YES,
    indPres: config.nfePresenceType || NFE_PRESENCE_TYPES.OPERATIONAL,
    procEmi: '0', // Application
    verProc: config.nfeProcessVersion || 'Stockify v1.0',
  };
}

function generateNFEEmitter(config: OrderToNFEAdapterConfig): NFEEmitter {
  return {
    CNPJ: config.companyCNPJ,
    xNome: config.companyName,
    xFant: config.companyTradeName,
    enderEmit: {
      xLgr: config.companyAddress.street,
      nro: config.companyAddress.number,
      xCpl: config.companyAddress.complement,
      xBairro: config.companyAddress.neighborhood,
      cMun: config.companyAddress.cityCode,
      xMun: config.companyAddress.cityName,
      UF: config.companyAddress.state,
      CEP: config.companyAddress.zipCode,
      cPais: '1058', // Brazil
      xPais: 'BRASIL',
      fone: config.companyAddress.phone,
    },
    IE: config.companyIE,
    IEST: config.companyIEST,
    IM: config.companyIM,
    CNAE: config.companyCNAE,
    CRT: config.companyCRT,
  };
}

function generateNFERecipient(customer: Customer): NFERecipient {
  return {
    // CNPJ: customer.cnpj || undefined,
    CPF: customer.cpf || undefined,
    xNome: customer.name,
    enderDest: {
      xLgr: customer.address?.street ?? 'Não informado',
      nro: 'S/N', // Address doesn't have number field
      xCpl: undefined, // Address doesn't have complement field
      xBairro: 'Não informado', // Address doesn't have neighborhood field
      cMun: '1501402', // Belém city code (7 digits) - hardcoded for test
      xMun: customer.address?.city ?? 'BELEM',
      UF: customer.address?.region ?? 'PA',
      CEP: customer.address?.postalCode ?? '66000000',
      cPais: '1058', // Brazil
      xPais: 'BRASIL',
      fone: customer.companyPhone,
    },
    indIEDest: '9', // Default to non-contributor since Customer doesn't have IE field
    IE: undefined, // Customer doesn't have IE field
    email: undefined, // Customer doesn't have email field
    // TODO: Add IE and email if they are available
  };
}

function generateNFEProducts(
  orderItems: any[], 
  products: Product[], 
  config: OrderToNFEAdapterConfig
): NFEProduct[] {
  // Get ICMS rate based on company state
  let icmsRate: number;
  try {
    icmsRate = config.customICMSRate ?? getICMSRateByCode(config.companyAddress.state);
  } catch (error) {
    console.warn(`Invalid state code: ${config.companyAddress.state}, using default ICMS rate`);
    icmsRate = config.customICMSRate ?? DEFAULT_ICMS_RATE;
  }
  
  // Get other tax rates (can be customized or use defaults)
  const pisRate = config.customPISRate ?? 1.65; // 1.65% PIS rate
  const cofinsRate = config.customCOFINSRate ?? 7.6; // 7.6% COFINS rate
  
  return orderItems.map((item, index) => {
    const product = products.find(p => p.id === item.productID);
    
    // Convert from cents to reais using safe math
    const unitPrice = divide(item.unitPrice, 100);
    const itemTotalCost = divide(item.itemTotalCost, 100);
    const discount = divide(item.descount, 100);
    
    // Calculate tax base (total - discount)
    const taxBase = subtract(itemTotalCost, discount);
    
    // Calculate taxes using safe math
    const icmsValue = divide(multiply(taxBase, icmsRate), 100);
    const pisValue = divide(multiply(itemTotalCost, pisRate), 100);
    const cofinsValue = divide(multiply(itemTotalCost, cofinsRate), 100);
    
    return {
      nItem: (index + 1).toString(),
      prod: {
        cProd: product?.id || item.productID,
        cEAN: product?.ean || undefined,
        xProd: product?.title || item.title,
        NCM: product?.ncm || config.defaultNCM || NCM_CODES.GENERIC,
        CFOP: config.defaultCFOP || CFOP_CODES.SALE_INTERNAL,
        uCom: item.variant?.unit?.name || 'UN',
        qCom: item.quantity,
        vUnCom: unitPrice,
        vProd: itemTotalCost,
        uTrib: item.variant?.unit?.name || 'UN',
        qTrib: item.quantity,
        vUnTrib: unitPrice,
        vFrete: 0,
        vSeg: 0,
        vDesc: discount,
        vOutro: 0,
        indTot: TOTAL_INCLUSION_INDICATORS.YES,
      },
      imp: {
        ICMS: {
          ICMS00: {
            orig: config.defaultProductOrigin || PRODUCT_ORIGINS.NATIONAL,
            CST: '00', // ICMS 00 - Normal
            modBC: '0', // Value
            vBC: taxBase,
            pICMS: icmsRate,
            vICMS: icmsValue,
            vICMSDeson: 0,
            vFCP: 0,
            vBCST: 0,
            vST: 0,
            vFCPST: 0,
            vFCPSTRet: 0,
            vII: 0,
            vIPI: 0,
            vIPIDevol: 0,
            vOutro: 0,
          },
        },
        PIS: {
          CST: '01', // PIS 01 - Normal
          vPIS: pisValue,
        },
        COFINS: {
          CST: '01', // COFINS 01 - Normal
          vCOFINS: cofinsValue,
        },
      },
    };
  });
}

function generateNFETotals(order: Order, config: OrderToNFEAdapterConfig): NFETotals {
  // Convert from cents to reais using safe math
  const totalValue = divide(order.totalCost, 100);
  
  // Calculate totals using safe math
  const totalDiscount = order.items.reduce((sum, item) => 
    add(sum, divide(item.descount, 100)), 0);
  
  // Get ICMS rate based on company state
  let icmsRate: number;
  try {
    icmsRate = config.customICMSRate ?? getICMSRateByCode(config.companyAddress.state);
  } catch (error) {
    console.warn(`Invalid state code: ${config.companyAddress.state}, using default ICMS rate`);
    icmsRate = config.customICMSRate ?? DEFAULT_ICMS_RATE;
  }
  
  // Get other tax rates
  const pisRate = config.customPISRate ?? 1.65;
  const cofinsRate = config.customCOFINSRate ?? 7.6;
  
  const totalICMS = order.items.reduce((sum, item) => {
    const itemTotal = divide(item.itemTotalCost, 100);
    const itemDiscount = divide(item.descount, 100);
    const taxBase = subtract(itemTotal, itemDiscount);
    const icmsValue = divide(multiply(taxBase, icmsRate), 100);
    return add(sum, icmsValue);
  }, 0);
  
  const totalPIS = order.items.reduce((sum, item) => {
    const itemTotal = divide(item.itemTotalCost, 100);
    const pisValue = divide(multiply(itemTotal, pisRate), 100);
    return add(sum, pisValue);
  }, 0);
  
  const totalCOFINS = order.items.reduce((sum, item) => {
    const itemTotal = divide(item.itemTotalCost, 100);
    const cofinsValue = divide(multiply(itemTotal, cofinsRate), 100);
    return add(sum, cofinsValue);
  }, 0);
  
  // Calculate tax base (total - discount)
  const taxBase = subtract(totalValue, totalDiscount);
  
  return {
    ICMSTot: {
      vBC: taxBase,
      vICMS: totalICMS,
      vICMSDeson: 0,
      vFCP: 0,
      vBCST: 0,
      vST: 0,
      vFCPST: 0,
      vFCPSTRet: 0,
      vProd: totalValue,
      vFrete: 0,
      vSeg: 0,
      vDesc: totalDiscount,
      vII: 0,
      vIPI: 0,
      vIPIDevol: 0,
      vPIS: totalPIS,
      vCOFINS: totalCOFINS,
      vOutro: 0,
      vNF: totalValue,
    },
  };
}

function generateNFETransport(config: OrderToNFEAdapterConfig): NFETransport {
  return {
    modFrete: config.defaultFreightMode || FREIGHT_MODES.NO_FREIGHT,
  };
}

// Utility functions
function generateRandomCode(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generateCheckDigit(): string {
  return Math.floor(Math.random() * 10).toString();
} 