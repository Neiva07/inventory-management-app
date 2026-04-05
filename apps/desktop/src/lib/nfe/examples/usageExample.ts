// Example usage of NFE system with dynamic ICMS rates
import { NFEGenerator, adaptOrderToNFE } from '../index';
import { getICMSRate, getICMSRateByCode, ICMS_RATES } from '../constants';

// Example 1: Using state-based ICMS rates
const configWithStateRates = {
  companyCNPJ: '12345678000195',
  companyName: 'Minha Empresa LTDA',
  companyIE: '123456789',
  companyAddress: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    cityCode: '3550308',
    cityName: 'São Paulo',
    state: '35', // São Paulo state code
    zipCode: '01234567',
  },
  // ICMS rate will be automatically determined based on state (18% for SP)
};

// Example 2: Using custom ICMS rates
const configWithCustomRates = {
  companyCNPJ: '12345678000195',
  companyName: 'Minha Empresa LTDA',
  companyIE: '123456789',
  companyAddress: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    cityCode: '3550308',
    cityName: 'São Paulo',
    state: '35',
    zipCode: '01234567',
  },
  // Override default rates
  customICMSRate: 20.0, // Custom 20% ICMS rate
  customPISRate: 2.0,    // Custom 2% PIS rate
  customCOFINSRate: 8.0, // Custom 8% COFINS rate
};

// Example 3: Different states with different ICMS rates
const configsByState = {
  saoPaulo: {
    ...configWithStateRates,
    companyAddress: {
      ...configWithStateRates.companyAddress,
      state: '35', // São Paulo - 18% ICMS
    }
  },
  rioDeJaneiro: {
    ...configWithStateRates,
    companyAddress: {
      ...configWithStateRates.companyAddress,
      state: '33', // Rio de Janeiro - 20% ICMS
    }
  },
  minasGerais: {
    ...configWithStateRates,
    companyAddress: {
      ...configWithStateRates.companyAddress,
      state: '31', // Minas Gerais - 18% ICMS
    }
  },
  bahia: {
    ...configWithStateRates,
    companyAddress: {
      ...configWithStateRates.companyAddress,
      state: '29', // Bahia - 20.5% ICMS
    }
  }
};

// Example usage function
export async function generateNFEExample(order: any, customer: any, products: any[]) {
  // Choose configuration based on your needs
  const config = configWithStateRates; // or configWithCustomRates
  
  // Convert order to NFE format
  const nfeData = adaptOrderToNFE(order, customer, products, config);
  
  // Generate NFE XML
  const generator = new NFEGenerator(nfeData);
  const xml = await generator.generate();
  
  // Get access key and QR code
  const accessKey = generator.generateAccessKey();
  const qrCode = generator.generateQRCode();
  
  return {
    xml,
    accessKey,
    qrCode,
    icmsRate: getICMSRateByCode(config.companyAddress.state)
  };
}

// Example of checking ICMS rates for different states
export function checkICMSRates() {
  console.log('ICMS Rates by State:');
  Object.entries(ICMS_RATES).forEach(([state, rate]) => {
    console.log(`${state}: ${rate}%`);
  });
  
  // Example: Get rate for specific state
  const spRate = getICMSRate('SP'); // 18.0
  const rjRate = getICMSRate('RJ'); // 20.0
  const baRate = getICMSRate('BA'); // 20.5
  
  console.log(`São Paulo ICMS: ${spRate}%`);
  console.log(`Rio de Janeiro ICMS: ${rjRate}%`);
  console.log(`Bahia ICMS: ${baRate}%`);
}

// Example of handling invalid state codes
export function handleInvalidStateCode() {
  try {
    const rate = getICMSRateByCode('99'); // Invalid state code
  } catch (error) {
    console.log('Error:', error.message); // "Invalid state code: 99"
  }
} 