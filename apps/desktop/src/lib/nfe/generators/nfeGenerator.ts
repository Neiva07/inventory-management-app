import { NFE } from '../types';
import { CURRENT_NFE_VERSION, NFE_MODELS } from '../constants';
import { generateXML } from '../utils/xmlUtils';
import { validateNFE } from '../validators/nfeValidator';

export class NFEGenerator {
  private nfe: NFE;
  
  constructor(nfe: NFE) {
    this.nfe = nfe;
  }
  
  async generate(): Promise<string> {
    // Validate NFE data
    const validation = validateNFE(this.nfe);
    if (!validation.isValid) {
      throw new Error(`NFE validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate XML
    const xml = generateXML(this.nfe);
    
    return xml;
  }
  
  async generateWithSignature(privateKey: string): Promise<string> {
    const xml = await this.generate();
    // Add digital signature
    return this.signXML(xml, privateKey);
  }
  
  private signXML(xml: string, privateKey: string): string {
    // TODO: Implement XML digital signature
    // This would use a library like xml-crypto or similar
    console.warn('XML signature not implemented yet');
    return xml;
  }
  
  generateAccessKey(): string {
    // Generate NFE access key based on Brazilian rules
    const { ide, emit, dest } = this.nfe;
    
    // Format: UF (2) + AAMM (4) + CNPJ (14) + Modelo (2) + Serie (3) + Numero (9) + Tipo Emissao (1) + Codigo Numerico (8) + DV (1)
    const uf = ide.cUF.padStart(2, '0');
    const aamm = new Date(ide.dhEmi).toISOString().slice(2, 7).replace('-', '');
    const cnpj = emit.CNPJ.replace(/\D/g, '').padStart(14, '0');
    const modelo = ide.mod.padStart(2, '0');
    const serie = ide.serie.padStart(3, '0');
    const numero = ide.nNF.padStart(9, '0');
    const tipoEmissao = ide.tpEmis.padStart(1, '0');
    const codigoNumerico = ide.cNF.padStart(8, '0');
    
    const base = `${uf}${aamm}${cnpj}${modelo}${serie}${numero}${tipoEmissao}${codigoNumerico}`;
    
    // Calculate check digit (simplified - in real implementation, use proper algorithm)
    const dv = this.calculateCheckDigit(base);
    
    return `${base}${dv}`;
  }
  
  private calculateCheckDigit(base: string): string {
    // Simplified check digit calculation
    // In real implementation, use the official Brazilian algorithm
    let sum = 0;
    const weights = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3];
    
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? '0' : (11 - remainder).toString();
  }
  
  generateQRCode(): string {
    // Generate QR Code URL for NFE
    const accessKey = this.generateAccessKey();
    const { ide } = this.nfe;
    
    // Format: https://www.gov.br/nfe/consulta?p={chave_acesso}
    return `https://www.gov.br/nfe/consulta?p=${accessKey}`;
  }
} 