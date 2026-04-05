import { NFE } from '../types';

export interface NFEValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateNFE(nfe: NFE): NFEValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate identification
  validateIdentification(nfe.ide, errors, warnings);
  
  // Validate emitter
  validateEmitter(nfe.emit, errors, warnings);
  
  // Validate recipient
  validateRecipient(nfe.dest, errors, warnings);
  
  // Validate products
  validateProducts(nfe.det, errors, warnings);
  
  // Validate totals
  validateTotals(nfe.total, errors, warnings);
  
  // Validate transport
  validateTransport(nfe.transp, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateIdentification(ide: any, errors: string[], warnings: string[]): void {
  if (!ide.cUF || ide.cUF.length !== 2) {
    errors.push('cUF must be exactly 2 digits');
  }
  
  if (!ide.cNF || ide.cNF.length !== 8) {
    errors.push('cNF must be exactly 8 digits');
  }
  
  if (!ide.natOp || ide.natOp.trim().length === 0) {
    errors.push('natOp is required');
  }
  
  if (!ide.mod || ide.mod !== '55') {
    errors.push('mod must be 55 for NFE');
  }
  
  if (!ide.serie || ide.serie.length !== 3) {
    errors.push('serie must be exactly 3 digits');
  }
  
  if (!ide.nNF || ide.nNF.length !== 9) {
    errors.push('nNF must be exactly 9 digits');
  }
  
  if (!ide.dhEmi) {
    errors.push('dhEmi is required');
  }
  
  if (!ide.tpNF || !['0', '1'].includes(ide.tpNF)) {
    errors.push('tpNF must be 0 (Output) or 1 (Input)');
  }
  
  if (!ide.idDest || !['1', '2', '3'].includes(ide.idDest)) {
    errors.push('idDest must be 1, 2, or 3');
  }
  
  if (!ide.cMunFG || ide.cMunFG.length !== 7) {
    errors.push('cMunFG must be exactly 7 digits');
  }
  
  if (!ide.tpImp || !['0', '1', '2', '3'].includes(ide.tpImp)) {
    errors.push('tpImp must be 0, 1, 2, or 3');
  }
  
  if (!ide.tpEmis || !['1', '2', '3', '4', '5'].includes(ide.tpEmis)) {
    errors.push('tpEmis must be 1, 2, 3, 4, or 5');
  }
  
  if (!ide.cDV || ide.cDV.length !== 1) {
    errors.push('cDV must be exactly 1 digit');
  }
  
  if (!ide.tpAmb || !['1', '2'].includes(ide.tpAmb)) {
    errors.push('tpAmb must be 1 (Production) or 2 (Homologation)');
  }
  
  if (!ide.finNFe || !['1', '2', '3', '4'].includes(ide.finNFe)) {
    errors.push('finNFe must be 1, 2, 3, or 4');
  }
  
  if (!ide.indFinal || !['0', '1'].includes(ide.indFinal)) {
    errors.push('indFinal must be 0 (No) or 1 (Yes)');
  }
  
  if (!ide.indPres || !['0', '1', '2', '3'].includes(ide.indPres)) {
    errors.push('indPres must be 0, 1, 2, or 3');
  }
  
  if (!ide.procEmi || !['0', '3', '4', '5'].includes(ide.procEmi)) {
    errors.push('procEmi must be 0, 3, 4, or 5');
  }
  
  if (!ide.verProc || ide.verProc.trim().length === 0) {
    errors.push('verProc is required');
  }
}

function validateEmitter(emit: any, errors: string[], warnings: string[]): void {
  if (!emit.CNPJ || emit.CNPJ.length !== 14) {
    errors.push('Emitter CNPJ must be exactly 14 digits');
  }
  
  if (!emit.xNome || emit.xNome.trim().length === 0) {
    errors.push('Emitter name is required');
  }
  
  if (emit.xNome && emit.xNome.length > 60) {
    warnings.push('Emitter name should not exceed 60 characters');
  }
  
  if (!emit.enderEmit) {
    errors.push('Emitter address is required');
  } else {
    validateAddress(emit.enderEmit, 'Emitter', errors, warnings);
  }
  
  if (!emit.IE || emit.IE.trim().length === 0) {
    errors.push('Emitter IE is required');
  }
  
  if (emit.CRT && !['1', '2', '3'].includes(emit.CRT)) {
    errors.push('Emitter CRT must be 1, 2, or 3');
  }
}

function validateRecipient(dest: any, errors: string[], warnings: string[]): void {
  if (!dest.CNPJ && !dest.CPF) {
    errors.push('Recipient must have either CNPJ or CPF');
  }
  
  if (dest.CNPJ && dest.CNPJ.length !== 14) {
    errors.push('Recipient CNPJ must be exactly 14 digits');
  }
  
  if (dest.CPF && dest.CPF.length !== 11) {
    errors.push('Recipient CPF must be exactly 11 digits');
  }
  
  if (!dest.xNome || dest.xNome.trim().length === 0) {
    errors.push('Recipient name is required');
  }
  
  if (dest.xNome && dest.xNome.length > 60) {
    warnings.push('Recipient name should not exceed 60 characters');
  }
  
  if (!dest.enderDest) {
    errors.push('Recipient address is required');
  } else {
    validateAddress(dest.enderDest, 'Recipient', errors, warnings);
  }
  
  if (dest.email && !isValidEmail(dest.email)) {
    warnings.push('Recipient email format is invalid');
  }
}

function validateAddress(address: any, context: string, errors: string[], warnings: string[]): void {
  if (!address.xLgr || address.xLgr.trim().length === 0) {
    errors.push(`${context} street is required`);
  }
  
  if (!address.nro || address.nro.trim().length === 0) {
    errors.push(`${context} number is required`);
  }
  
  if (!address.xBairro || address.xBairro.trim().length === 0) {
    errors.push(`${context} neighborhood is required`);
  }
  
  if (!address.cMun || address.cMun.length !== 7) {
    errors.push(`${context} city code must be exactly 7 digits`);
  }
  
  if (!address.xMun || address.xMun.trim().length === 0) {
    errors.push(`${context} city name is required`);
  }
  
  if (!address.UF || address.UF.length !== 2) {
    errors.push(`${context} UF must be exactly 2 characters`);
  }
  
  if (!address.CEP || address.CEP.length !== 8) {
    errors.push(`${context} CEP must be exactly 8 digits`);
  }
}

function validateProducts(det: any[], errors: string[], warnings: string[]): void {
  if (!det || det.length === 0) {
    errors.push('At least one product is required');
    return;
  }
  
  det.forEach((item, index) => {
    const itemPrefix = `Product ${index + 1}`;
    
    if (!item.nItem || item.nItem.trim().length === 0) {
      errors.push(`${itemPrefix}: nItem is required`);
    }
    
    if (!item.prod) {
      errors.push(`${itemPrefix}: product details are required`);
      return;
    }
    
    validateProductDetails(item.prod, itemPrefix, errors, warnings);
    
    if (!item.imp) {
      errors.push(`${itemPrefix}: product taxes are required`);
      return;
    }
    
    validateProductTaxes(item.imp, itemPrefix, errors, warnings);
  });
}

function validateProductDetails(prod: any, prefix: string, errors: string[], warnings: string[]): void {
  if (!prod.cProd || prod.cProd.trim().length === 0) {
    errors.push(`${prefix}: product code is required`);
  }
  
  if (!prod.xProd || prod.xProd.trim().length === 0) {
    errors.push(`${prefix}: product description is required`);
  }
  
  if (prod.xProd && prod.xProd.length > 120) {
    warnings.push(`${prefix}: product description should not exceed 120 characters`);
  }
  
  if (!prod.NCM || prod.NCM.length !== 8) {
    errors.push(`${prefix}: NCM must be exactly 8 digits`);
  }
  
  if (!prod.CFOP || prod.CFOP.length !== 4) {
    errors.push(`${prefix}: CFOP must be exactly 4 digits`);
  }
  
  if (!prod.uCom || prod.uCom.trim().length === 0) {
    errors.push(`${prefix}: commercial unit is required`);
  }
  
  if (!prod.qCom || prod.qCom <= 0) {
    errors.push(`${prefix}: commercial quantity must be greater than 0`);
  }
  
  if (!prod.vUnCom || prod.vUnCom <= 0) {
    errors.push(`${prefix}: commercial unit value must be greater than 0`);
  }
  
  if (!prod.vProd || prod.vProd <= 0) {
    errors.push(`${prefix}: product total value must be greater than 0`);
  }
  
  if (!prod.uTrib || prod.uTrib.trim().length === 0) {
    errors.push(`${prefix}: tax unit is required`);
  }
  
  if (!prod.qTrib || prod.qTrib <= 0) {
    errors.push(`${prefix}: tax quantity must be greater than 0`);
  }
  
  if (!prod.vUnTrib || prod.vUnTrib <= 0) {
    errors.push(`${prefix}: tax unit value must be greater than 0`);
  }
  
  if (!prod.indTot || !['S', 'N'].includes(prod.indTot)) {
    errors.push(`${prefix}: indTot must be S (Yes) or N (No)`);
  }
}

function validateProductTaxes(imp: any, prefix: string, errors: string[], warnings: string[]): void {
  if (!imp.ICMS) {
    errors.push(`${prefix}: ICMS is required`);
    return;
  }
  
  const icmsTypes = Object.keys(imp.ICMS);
  if (icmsTypes.length === 0) {
    errors.push(`${prefix}: At least one ICMS type is required`);
  }
  
  if (icmsTypes.length > 1) {
    errors.push(`${prefix}: Only one ICMS type is allowed`);
  }
  
  const icmsType = icmsTypes[0];
  const icmsData = imp.ICMS[icmsType];
  
  if (!icmsData.orig || !['0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(icmsData.orig)) {
    errors.push(`${prefix}: ICMS origin must be 0-8`);
  }
  
  if (!icmsData.CST) {
    errors.push(`${prefix}: ICMS CST is required`);
  }
  
  // Validate specific ICMS types
  if (icmsType === 'ICMS00') {
    if (!icmsData.modBC || !['0', '1', '2', '3'].includes(icmsData.modBC)) {
      errors.push(`${prefix}: ICMS00 modBC must be 0, 1, 2, or 3`);
    }
    
    if (!icmsData.vBC || icmsData.vBC <= 0) {
      errors.push(`${prefix}: ICMS00 vBC must be greater than 0`);
    }
    
    if (!icmsData.pICMS || icmsData.pICMS < 0) {
      errors.push(`${prefix}: ICMS00 pICMS must be 0 or greater`);
    }
    
    if (!icmsData.vICMS || icmsData.vICMS < 0) {
      errors.push(`${prefix}: ICMS00 vICMS must be 0 or greater`);
    }
  }
  
  // Validate PIS
  if (imp.PIS) {
    if (!imp.PIS.CST) {
      errors.push(`${prefix}: PIS CST is required`);
    }
    
    if (!imp.PIS.vPIS || imp.PIS.vPIS < 0) {
      errors.push(`${prefix}: PIS value must be 0 or greater`);
    }
  }
  
  // Validate COFINS
  if (imp.COFINS) {
    if (!imp.COFINS.CST) {
      errors.push(`${prefix}: COFINS CST is required`);
    }
    
    if (!imp.COFINS.vCOFINS || imp.COFINS.vCOFINS < 0) {
      errors.push(`${prefix}: COFINS value must be 0 or greater`);
    }
  }
}

function validateTotals(total: any, errors: string[], warnings: string[]): void {
  if (!total.ICMSTot) {
    errors.push('ICMS totals are required');
    return;
  }
  
  const icmsTot = total.ICMSTot;
  
  if (!icmsTot.vBC || icmsTot.vBC < 0) {
    errors.push('ICMS BC value must be 0 or greater');
  }
  
  if (!icmsTot.vICMS || icmsTot.vICMS < 0) {
    errors.push('ICMS value must be 0 or greater');
  }
  
  if (!icmsTot.vICMSDeson || icmsTot.vICMSDeson < 0) {
    errors.push('ICMS discharged value must be 0 or greater');
  }
  
  if (!icmsTot.vFCP || icmsTot.vFCP < 0) {
    errors.push('FCP value must be 0 or greater');
  }
  
  if (!icmsTot.vBCST || icmsTot.vBCST < 0) {
    errors.push('ST BC value must be 0 or greater');
  }
  
  if (!icmsTot.vST || icmsTot.vST < 0) {
    errors.push('ST value must be 0 or greater');
  }
  
  if (!icmsTot.vFCPST || icmsTot.vFCPST < 0) {
    errors.push('ST FCP value must be 0 or greater');
  }
  
  if (!icmsTot.vFCPSTRet || icmsTot.vFCPSTRet < 0) {
    errors.push('Retained ST FCP value must be 0 or greater');
  }
  
  if (!icmsTot.vProd || icmsTot.vProd <= 0) {
    errors.push('Product total value must be greater than 0');
  }
  
  if (!icmsTot.vFrete || icmsTot.vFrete < 0) {
    errors.push('Freight value must be 0 or greater');
  }
  
  if (!icmsTot.vSeg || icmsTot.vSeg < 0) {
    errors.push('Insurance value must be 0 or greater');
  }
  
  if (!icmsTot.vDesc || icmsTot.vDesc < 0) {
    errors.push('Discount value must be 0 or greater');
  }
  
  if (!icmsTot.vII || icmsTot.vII < 0) {
    errors.push('Import tax value must be 0 or greater');
  }
  
  if (!icmsTot.vIPI || icmsTot.vIPI < 0) {
    errors.push('IPI value must be 0 or greater');
  }
  
  if (!icmsTot.vIPIDevol || icmsTot.vIPIDevol < 0) {
    errors.push('Devolved IPI value must be 0 or greater');
  }
  
  if (!icmsTot.vPIS || icmsTot.vPIS < 0) {
    errors.push('PIS value must be 0 or greater');
  }
  
  if (!icmsTot.vCOFINS || icmsTot.vCOFINS < 0) {
    errors.push('COFINS value must be 0 or greater');
  }
  
  if (!icmsTot.vOutro || icmsTot.vOutro < 0) {
    errors.push('Other values must be 0 or greater');
  }
  
  if (!icmsTot.vNF || icmsTot.vNF <= 0) {
    errors.push('Document total value must be greater than 0');
  }
}

function validateTransport(transp: any, errors: string[], warnings: string[]): void {
  if (!transp.modFrete || !['0', '1', '2', '3', '4', '9'].includes(transp.modFrete)) {
    errors.push('Freight mode must be 0, 1, 2, 3, 4, or 9');
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 