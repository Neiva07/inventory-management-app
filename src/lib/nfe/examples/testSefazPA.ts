import { SEFAZClient, SEFAZConfig } from '../services/sefazClient';
import { NFEGenerator, adaptOrderToNFE } from '../index';
import { getICMSRateByCode } from '../constants';

// Test data for SEFAZ-PA homologation
const TEST_COMPANY_DATA = {
  // Official SEFAZ test CNPJ/IE for Pará homologation
  // These are the official test values provided by SEFAZ
  companyCNPJ: '99999999000191', // Official SEFAZ test CNPJ
  companyName: 'EMPRESA TESTE LTDA',
  companyTradeName: 'EMPRESA TESTE',
  companyIE: '999999999', // Official SEFAZ test IE
  companyIEST: '',
  companyIM: '123456',
  companyCNAE: '4751201',
  companyCRT: '1', // Simples Nacional
  
  // Company address in Pará (Belém)
  companyAddress: {
    street: 'RUA TESTE',
    number: '123',
    complement: 'SALA 1',
    neighborhood: 'CENTRO',
    cityCode: '1501402', // Belém-PA (official IBGE code)
    cityName: 'BELEM',
    state: '15', // Pará state code (official IBGE code)
    zipCode: '66000000',
    phone: '91999999999',
  },
  
  // NFE configuration for homologation
  nfeEnvironment: '2', // Homologation (test environment)
  nfeEmissionType: '1', // Normal emission
  nfePurpose: '1', // Normal purpose
  nfePrintType: '0', // White paper
  nfeDestinationType: '1', // Internal
  nfePresenceType: '1', // Operational
  nfeFinalConsumer: '1', // Yes (final consumer)
  nfeProcessVersion: 'Stockify v1.0',
  
  // Default values for test
  defaultCFOP: '5102', // Sale to final consumer
  defaultNCM: '84713000', // Laptops and portable computers
  defaultProductOrigin: '0', // National
  defaultFreightMode: '9', // Without freight
};

// Test customer data
const TEST_CUSTOMER = {
  id: 'test-customer-1',
  publicId: 'CLI001',
  userID: 'test-user-1',
  name: 'CLIENTE TESTE',
  cpf: '12345678901',
  status: 'active',
  address: {
    street: 'RUA CLIENTE',
    city: 'BELEM',
    region: 'PA',
    country: 'BRASIL',
    postalCode: '66000000',
    cityCode: '1501402', // Belém city code (7 digits)
  },
  companyPhone: '91988888888',
};

// Test product data
const TEST_PRODUCTS = [
  {
    id: 'test-product-1',
    publicId: 'PROD001',
    userID: 'test-user-1',
    title: 'LAPTOP TESTE',
    description: 'Laptop para testes',
    status: 'active',
    inventory: 10,
    weight: 2.5,
    cost: 200000, // R$ 2.000,00 in cents
    deleted: {
      date: new Date(0),
      isDeleted: false
    },
    baseUnit: {
      name: 'Unidade',
      id: 'UN'
    },
    variants: [
      {
        id: 'test-variant-1',
        name: 'Padrão',
        conversionRate: 1,
        unit: {
          name: 'Unidade',
          id: 'UN'
        },
        unitCost: 200000, // R$ 2.000,00 in cents
        prices: [
          {
            profit: 50000, // R$ 500,00 in cents
            value: 250000, // R$ 2.500,00 in cents
            paymentMethod: {
              id: '01',
              label: 'Dinheiro'
            }
          }
        ]
      }
    ],
    suppliers: [] as any[],
    productCategory: {
      id: 'cat-1',
      name: 'Eletrônicos'
    }
  }
];

// Test order data
const TEST_ORDER = {
  id: 'test-order-1',
  publicId: 'NFE001',
  userID: 'test-user-1',
  customer: {
    id: 'test-customer-1',
    name: 'CLIENTE TESTE'
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deleted: {
    date: 0,
    isDeleted: false
  },
  paymentMethod: {
    label: 'Dinheiro',
    id: '01'
  },
  orderDate: Date.now(),
  dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
  totalComission: 0,
  status: 'complete' as const,
  items: [
    {
      productID: 'test-product-1',
      productBaseUnitInventory: 10,
      variant: {
        id: 'test-variant-1',
        name: 'Padrão',
        conversionRate: 1,
        unit: {
          name: 'Unidade',
          id: 'UN'
        },
        unitCost: 200000, // R$ 2.000,00 in cents
        prices: [
          {
            profit: 50000, // R$ 500,00 in cents
            value: 250000, // R$ 2.500,00 in cents
            paymentMethod: {
              id: '01',
              label: 'Dinheiro'
            }
          }
        ]
      },
      title: 'LAPTOP TESTE',
      balance: 10,
      quantity: 1,
      cost: 200000, // R$ 2.000,00 in cents
      unitPrice: 250000, // R$ 2.500,00 in cents
      itemTotalCost: 250000, // R$ 2.500,00 in cents
      descount: 0, // No discount
      commissionRate: 0
    }
  ],
  totalCost: 250000, // R$ 2.500,00 in cents
};

/**
 * Test SEFAZ-PA homologation flow
 */
export async function testSefazPAHomologation() {
  console.log('🚀 Starting SEFAZ-PA Homologation Test');
  console.log('=====================================');
  
  try {
    // 1. Initialize SEFAZ client
    console.log('\n1. Initializing SEFAZ client...');
    const sefazConfig: SEFAZConfig = {
      environment: 'HOMOLOGATION',
      timeout: 30000,
      retryAttempts: 3,
    };
    
    const sefazClient = new SEFAZClient(sefazConfig);
    console.log('✅ SEFAZ client initialized');
    
    // 2. Check SEFAZ service status
    console.log('\n2. Checking SEFAZ service status...');
    const status = await sefazClient.checkStatus();
    console.log(`Status: ${status.status}`);
    console.log(`Message: ${status.message}`);
    console.log(`Timestamp: ${status.timestamp}`);
    
    if (status.status !== 'OK') {
      throw new Error(`SEFAZ service is not available: ${status.message}`);
    }
    console.log('✅ SEFAZ service is available');
    
    // 3. Generate NFE data
    console.log('\n3. Generating NFE data...');
    const nfeData = adaptOrderToNFE(TEST_ORDER, TEST_CUSTOMER, TEST_PRODUCTS, TEST_COMPANY_DATA);
    console.log('✅ NFE data generated');
    
    // 4. Generate NFE XML
    console.log('\n4. Generating NFE XML...');
    const generator = new NFEGenerator(nfeData);
    const xml = await generator.generate();
    console.log('✅ NFE XML generated');
    
    // 5. Sign XML (placeholder for now)
    console.log('\n5. Signing XML...');
    const signedXML = sefazClient.signXML(xml);
    console.log('✅ XML signed (placeholder)');
    
    // 6. Send to SEFAZ for authorization
    console.log('\n6. Sending to SEFAZ for authorization...');
    const authResult = await sefazClient.authorizeNFE(signedXML);
    
    if (!authResult.success) {
      throw new Error(`Authorization failed: ${authResult.errorCode} - ${authResult.errorMessage}`);
    }
    
    console.log('✅ NFE sent for authorization');
    console.log(`Receipt number: ${authResult.receiptNumber}`);
    console.log(`Message: ${authResult.errorMessage}`);
    
    // 7. Poll for authorization result
    console.log('\n7. Polling for authorization result...');
    console.log('This may take a few minutes...');
    
    const pollResult = await sefazClient.pollAuthorization(authResult.receiptNumber!, 15);
    
    if (pollResult.success) {
      console.log('🎉 NFE AUTHORIZED SUCCESSFULLY!');
      console.log(`Protocol: ${pollResult.protocol}`);
      console.log(`Message: ${pollResult.errorMessage}`);
      
      // Save authorized XML
      console.log('\n8. Saving authorized XML...');
      // TODO: Save to file or database
      console.log('✅ Authorized XML ready for storage');
      
      return {
        success: true,
        protocol: pollResult.protocol,
        authorizedXML: pollResult.authorizedXML,
        message: 'NFE authorized successfully'
      };
    } else {
      console.log('❌ NFE AUTHORIZATION FAILED');
      console.log(`Error Code: ${pollResult.errorCode}`);
      console.log(`Error Message: ${pollResult.errorMessage}`);
      
      return {
        success: false,
        errorCode: pollResult.errorCode,
        errorMessage: pollResult.errorMessage
      };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      errorCode: '999',
      errorMessage: error.message
    };
  }
}

/**
 * Test ICMS rate for Pará
 */
export function testParaICMSRate() {
  console.log('\n🧪 Testing Pará ICMS Rate');
  console.log('========================');
  
  try {
    const paraRate = getICMSRateByCode('15');
    console.log(`Pará ICMS Rate: ${paraRate}%`);
    console.log('✅ ICMS rate retrieved successfully');
    
    return paraRate;
  } catch (error) {
    console.error('❌ Failed to get Pará ICMS rate:', error.message);
    throw error;
  }
}

/**
 * Generate test NFE without sending to SEFAZ
 */
export async function generateTestNFE() {
  console.log('\n📄 Generating Test NFE (Local Only)');
  console.log('===================================');
  
  try {
    // Generate NFE data
    const nfeData = adaptOrderToNFE(TEST_ORDER, TEST_CUSTOMER, TEST_PRODUCTS, TEST_COMPANY_DATA);
    
    // Debug: Print NFE data structure
    console.log('\n🔍 Generated NFE Data Structure:');
    console.log('================================');
    console.log('NFE Object Keys:', Object.keys(nfeData));
    console.log('Totals Keys:', Object.keys(nfeData.total));
    console.log('ICMSTot Keys:', Object.keys(nfeData.total.ICMSTot));
    console.log('Products Count:', nfeData.det.length);
    
    if (nfeData.det.length > 0) {
      console.log('First Product Keys:', Object.keys(nfeData.det[0]));
      console.log('First Product - prod Keys:', Object.keys(nfeData.det[0].prod));
      console.log('First Product - imp Keys:', Object.keys(nfeData.det[0].imp));
      console.log('First Product - ICMS Keys:', Object.keys(nfeData.det[0].imp.ICMS));
      console.log('First Product - ICMS00 Keys:', Object.keys(nfeData.det[0].imp.ICMS.ICMS00));
    }
    
    // Debug: Print specific values that might be missing
    console.log('\n🔍 Checking Required Fields:');
    console.log('============================');
    console.log('Totals - vICMSDeson:', nfeData.total.ICMSTot.vICMSDeson);
    console.log('Totals - vFCP:', nfeData.total.ICMSTot.vFCP);
    console.log('Totals - vBCST:', nfeData.total.ICMSTot.vBCST);
    console.log('Totals - vST:', nfeData.total.ICMSTot.vST);
    console.log('Totals - vFCPST:', nfeData.total.ICMSTot.vFCPST);
    console.log('Totals - vFCPSTRet:', nfeData.total.ICMSTot.vFCPSTRet);
    console.log('Totals - vFrete:', nfeData.total.ICMSTot.vFrete);
    console.log('Totals - vSeg:', nfeData.total.ICMSTot.vSeg);
    console.log('Totals - vDesc:', nfeData.total.ICMSTot.vDesc);
    console.log('Totals - vII:', nfeData.total.ICMSTot.vII);
    console.log('Totals - vIPI:', nfeData.total.ICMSTot.vIPI);
    console.log('Totals - vIPIDevol:', nfeData.total.ICMSTot.vIPIDevol);
    console.log('Totals - vOutro:', nfeData.total.ICMSTot.vOutro);
    
    if (nfeData.det.length > 0) {
      const firstProduct = nfeData.det[0];
      console.log('\nFirst Product - prod - vFrete:', firstProduct.prod.vFrete);
      console.log('First Product - prod - vSeg:', firstProduct.prod.vSeg);
      console.log('First Product - prod - vDesc:', firstProduct.prod.vDesc);
      console.log('First Product - prod - vOutro:', firstProduct.prod.vOutro);
      console.log('First Product - ICMS00 - vICMSDeson:', firstProduct.imp.ICMS.ICMS00.vICMSDeson);
      console.log('First Product - ICMS00 - vFCP:', firstProduct.imp.ICMS.ICMS00.vFCP);
      console.log('First Product - ICMS00 - vBCST:', firstProduct.imp.ICMS.ICMS00.vBCST);
      console.log('First Product - ICMS00 - vST:', firstProduct.imp.ICMS.ICMS00.vST);
      console.log('First Product - ICMS00 - vFCPST:', firstProduct.imp.ICMS.ICMS00.vFCPST);
      console.log('First Product - ICMS00 - vFCPSTRet:', firstProduct.imp.ICMS.ICMS00.vFCPSTRet);
      console.log('First Product - ICMS00 - vII:', firstProduct.imp.ICMS.ICMS00.vII);
      console.log('First Product - ICMS00 - vIPI:', firstProduct.imp.ICMS.ICMS00.vIPI);
      console.log('First Product - ICMS00 - vIPIDevol:', firstProduct.imp.ICMS.ICMS00.vIPIDevol);
      console.log('First Product - ICMS00 - vOutro:', firstProduct.imp.ICMS.ICMS00.vOutro);
    }
    
    // Generate XML
    const generator = new NFEGenerator(nfeData);
    const xml = await generator.generate();
    
    // Debug: Print the entire XML for inspection
    console.log('\n🔍 FULL NFE XML OUTPUT:');
    console.log('========================');
    console.log(xml);
    
    // Debug: Print a snippet of the XML to see if fields are included
    console.log('\n🔍 XML Snippet (first 1000 chars):');
    console.log('==================================');
    console.log(xml.substring(0, 1000));
    
    // Debug: Check if specific fields are in XML
    console.log('\n🔍 Checking XML for Required Fields:');
    console.log('=====================================');
    console.log('XML contains vICMSDeson:', xml.includes('vICMSDeson'));
    console.log('XML contains vFCP:', xml.includes('vFCP'));
    console.log('XML contains vBCST:', xml.includes('vBCST'));
    console.log('XML contains vST:', xml.includes('vST'));
    console.log('XML contains vFCPST:', xml.includes('vFCPST'));
    console.log('XML contains vFCPSTRet:', xml.includes('vFCPSTRet'));
    console.log('XML contains vFrete:', xml.includes('vFrete'));
    console.log('XML contains vSeg:', xml.includes('vSeg'));
    console.log('XML contains vDesc:', xml.includes('vDesc'));
    console.log('XML contains vII:', xml.includes('vII'));
    console.log('XML contains vIPI:', xml.includes('vIPI'));
    console.log('XML contains vIPIDevol:', xml.includes('vIPIDevol'));
    console.log('XML contains vOutro:', xml.includes('vOutro'));
    
    // Generate access key
    const accessKey = generator.generateAccessKey();
    
    console.log('\n✅ NFE generated successfully');
    console.log(`Access Key: ${accessKey}`);
    console.log(`XML Length: ${xml.length} characters`);
    
    return {
      xml,
      accessKey,
      nfeData
    };
  } catch (error) {
    console.error('❌ Failed to generate NFE:', error.message);
    throw error;
  }
}

// Export test data for external use
export {
  TEST_COMPANY_DATA,
  TEST_CUSTOMER,
  TEST_PRODUCTS,
  TEST_ORDER
}; 