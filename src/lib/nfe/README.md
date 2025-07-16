# NFE (Nota Fiscal Eletrônica) Module

This module provides comprehensive NFE XML document generation functionality for Brazilian electronic invoices.

## Structure

```
src/lib/nfe/
├── types/           # TypeScript type definitions
├── constants/       # NFE codes and constants
├── generators/      # XML generation logic
├── validators/      # Data validation
├── utils/           # Utility functions
├── adapters/        # Data adapters for existing models
└── index.ts         # Main exports
```

## Quick Start

```typescript
import { NFEGenerator, adaptOrderToNFE } from '../lib/nfe';

// 1. Configure your company information
const config = {
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
  // ... other configuration
};

// 2. Convert your order to NFE format
const nfeData = adaptOrderToNFE(order, customer, products, config);

// 3. Generate NFE XML
const generator = new NFEGenerator(nfeData);
const xml = await generator.generate();

// 4. Save or send to SEFAZ
console.log(xml);
```

## ICMS Rates by State

The system automatically determines ICMS rates based on the company's state:

```typescript
import { getICMSRate, getICMSRateByCode, ICMS_RATES } from 'lib/nfe/constants';

// Get ICMS rate by state abbreviation
const spRate = getICMSRate('SP'); // 18.0%

// Get ICMS rate by state code
const spRateByCode = getICMSRateByCode('35'); // 18.0%

// Available rates:
// São Paulo: 18%, Rio de Janeiro: 20%, Bahia: 20.5%, etc.
```

### Custom Tax Rates

You can override default rates in the configuration:

```typescript
const config = {
  // ... other config
  customICMSRate: 20.0,    // Custom ICMS rate
  customPISRate: 2.0,      // Custom PIS rate  
  customCOFINSRate: 8.0,   // Custom COFINS rate
};
```

## Features

- ✅ Complete NFE v4.00 schema support
- ✅ TypeScript type safety
- ✅ Comprehensive validation
- ✅ XML generation
- ✅ Access key generation
- ✅ QR Code generation
- ✅ Integration with existing order system
- ✅ Dynamic ICMS rates by Brazilian state
- ✅ Safe math operations using Decimal.js
- ✅ Configurable tax rates

## Next Steps

1. **Complete the constants files** - Add all the missing constant files
2. **Implement digital signature** - Add XML digital signature functionality (currently placeholder)
3. **SEFAZ integration** - Add web service communication ✅ (implemented for Pará)
4. **UI integration** - Add NFE generation buttons to order forms
5. **Configuration management** - Add company settings management

## Testing SEFAZ Integration

### Run SEFAZ-PA Homologation Test

```bash
# Test NFE generation and SEFAZ integration
yarn test:nfe
```

This will:
1. Test ICMS rate calculation for Pará (19%)
2. Generate a test NFE locally
3. Attempt to send to SEFAZ-PA homologation (requires proper certificate)

### Test Data Used

- **Test CNPJ/IE**: `99999999000191` / `999999999`
- **State**: Pará (PA) - Code `15`
- **ICMS Rate**: 19%
- **Environment**: Homologation (test)

### Expected Results

- ✅ Local NFE generation will work
- ❌ SEFAZ authorization will fail (expected without proper A1 certificate)
- ✅ Service status check may work if SEFAZ is accessible

### For Production Use

1. **Get A1 Certificate**: Obtain a valid ICP-Brasil A1 certificate
2. **Update Certificate Path**: Configure the certificate in `SEFAZConfig`
3. **Implement Digital Signature**: Complete the XML signing implementation
4. **Test in Homologation**: Verify with SEFAZ test environment
5. **Move to Production**: Switch to production endpoints

## Manual Reference

The system is designed based on the Brazilian NFE manual (Manual de Orientação do Contribuinte v6.00). You should refer to this manual for:

- Specific validation rules
- Tax calculation algorithms
- SEFAZ web service specifications
- Digital signature requirements

## Important Notes

- This is a development version - not for production use yet
- Tax calculations are simplified - implement proper algorithms
- Digital signature is not implemented
- SEFAZ integration is not implemented
- Always test in homologation environment first 