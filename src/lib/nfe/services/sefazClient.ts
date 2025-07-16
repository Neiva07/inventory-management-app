import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';
import { SignedXml } from 'xml-crypto';

// SEFAZ Web Service Endpoints
// Using SVRS (Sistema Virtual de Recepção de Serviços) for better accessibility
const SEFAZ_ENDPOINTS = {
  HOMOLOGATION: {
    AUTHORIZATION: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NFeAutorizacao/NFeAutorizacao4.asmx',
    RET_AUTHORIZATION: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NFeRetAutorizacao/NFeRetAutorizacao4.asmx',
    CONSULTATION: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NFeConsulta/NFeConsulta4.asmx',
    STATUS: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
  },
  PRODUCTION: {
    AUTHORIZATION: 'https://nfe.svrs.rs.gov.br/ws/NFeAutorizacao/NFeAutorizacao4.asmx',
    RET_AUTHORIZATION: 'https://nfe.svrs.rs.gov.br/ws/NFeRetAutorizacao/NFeRetAutorizacao4.asmx',
    CONSULTATION: 'https://nfe.svrs.rs.gov.br/ws/NFeConsulta/NFeConsulta4.asmx',
    STATUS: 'https://nfe.svrs.rs.gov.br/ws/NFeStatusServico/NFeStatusServico4.asmx'
  }
} as const;

// Official SEFAZ Test Certificate Data for Pará (PA)
// These are the official test certificates provided by SEFAZ for homologation
const SEFAZ_TEST_CERTIFICATES = {
  PA: {
    // Official SEFAZ-PA test certificate (A1)
    // Download from: https://www.gov.br/iti/pt-br/assuntos/repositorio/certificados-das-acs-da-icp-brasil
    // certificatePath: './certs/test-certificate-pa.pfx',
    // certificatePassword: '123456',

    // certificatePath: './certs/lucas-cnpj-a1-cert.pfx',
    // certificatePassword: '3bakEvYz8HsVp6',

    certificatePath: './certs/p12/Certificates.p12',
    certificatePassword: 's9RKhS9LZMNj',

    // Alternative PEM certificate from Keychain Access
    pemCertificatePath: './certs/certisign-cert.pem',
    
    // Official test CNPJ/IE for Pará homologation
    testCNPJ: '48479510000110',
    testIE: '999999999',
    testCompanyName: 'EMPRESA TESTE LTDA',
    
    // Test environment configuration
    environment: 'HOMOLOGATION',
    stateCode: '15', // Pará
    cityCode: '1501402', // Belém
  }
} as const;

export interface SEFAZConfig {
  environment: 'HOMOLOGATION' | 'PRODUCTION';
  certificatePath?: string;
  certificatePassword?: string;
  timeout?: number;
  retryAttempts?: number;
  useTestCertificate?: boolean; // Use official SEFAZ test certificate
}

export interface SEFAZResponse {
  success: boolean;
  protocol?: string;
  authorizedXML?: string;
  errorCode?: string;
  errorMessage?: string;
  receiptNumber?: string;
}

export interface SEFAZStatusResponse {
  status: 'OK' | 'ERROR';
  message: string;
  timestamp: string;
}

export class SEFAZClient {
  private config: SEFAZConfig;
  private endpoints: typeof SEFAZ_ENDPOINTS.HOMOLOGATION | typeof SEFAZ_ENDPOINTS.PRODUCTION;
  private certificate: Buffer;
  private certificatePassword: string;
  private certificateType: 'PEM' | 'PFX';

  constructor(config: SEFAZConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      useTestCertificate: true, // Default to test certificate
      ...config
    };
    
    this.endpoints = SEFAZ_ENDPOINTS[config.environment];
    
    // Load certificate
    if (this.config.useTestCertificate && config.environment === 'HOMOLOGATION') {
      // Use official SEFAZ test certificate
      this.loadTestCertificate();
    } else if (config.certificatePath) {
      // Use provided certificate
      this.loadCertificate(config.certificatePath, config.certificatePassword || '');
    } else {
      // Fallback to placeholder (for development)
      this.loadPlaceholderCertificate();
    }
  }

  /**
   * Load official SEFAZ test certificate
   */
  private loadTestCertificate(): void {
    try {
      const testCert = SEFAZ_TEST_CERTIFICATES.PA;
      
      // Try PFX certificate
      const certPath = path.resolve(process.cwd(), testCert.certificatePath);
      if (fs.existsSync(certPath)) {
        this.certificate = fs.readFileSync(certPath);
        this.certificatePassword = testCert.certificatePassword;
        this.certificateType = 'PFX';

        console.log('--------------------------------');
        console.log('CERTIFICATESSS');
        console.log(this.certificate.toString('base64'));
        console.log(this.certificatePassword);
        console.log('✅ Loaded official SEFAZ test certificate (PFX)');
        return;
      }
      
      console.warn('⚠️  No test certificate found, using placeholder');
      this.loadPlaceholderCertificate();
    } catch (error) {
      console.warn('⚠️  Failed to load test certificate, using placeholder:', error.message);
      this.loadPlaceholderCertificate();
    }
  }

  /**
   * Load custom certificate from file
   */
  private loadCertificate(certPath: string, password: string): void {
    try {
      this.certificate = fs.readFileSync(certPath);
      this.certificatePassword = password;
      this.certificateType = certPath.endsWith('.pem') ? 'PEM' : 'PFX';
      console.log('✅ Loaded custom certificate');
    } catch (error) {
      throw new Error(`Failed to load certificate: ${error.message}`);
    }
  }

  /**
   * Load placeholder certificate (for development)
   */
  private loadPlaceholderCertificate(): void {
    this.certificate = Buffer.from('placeholder-certificate-data', 'utf8');
    this.certificatePassword = 'test123';
    this.certificateType = 'PEM';
    console.warn('⚠️  Using placeholder certificate - not suitable for SEFAZ communication');
  }

  /**
   * Create HTTPS agent with proper certificate configuration
   */
  private createHttpsAgent(): https.Agent {
    console.log(`🔍 Certificate Type: ${this.certificateType}`);
    console.log(`🔍 Certificate Size: ${this.certificate?.length ?? 0} bytes`);
    console.log(`🔍 Certificate Password: ${this.certificatePassword ? 'Set' : 'Not set'}`);
    
    const agentOptions: https.AgentOptions = {
      rejectUnauthorized: false, // Allow self-signed certificates for testing
      timeout: this.config.timeout,
    };

    // Configure certificate based on type
    if (this.certificateType === 'PFX') {
      agentOptions.pfx = this.certificate;
      agentOptions.passphrase = this.certificatePassword;
      
      // Note: For RC2-40-CBC certificates, run with: NODE_OPTIONS='--openssl-legacy-provider' yarn test:nfe
      
      console.log('✅ Configured HTTPS agent with PFX certificate (legacy algorithms enabled)');
    } else if (this.certificateType === 'PEM') {
      // For PEM certificates, we need to handle them differently
      // For now, try without client certificate for testing
      console.log('⚠️  PEM certificate detected - trying without client certificate for testing');
    } else {
      console.log('⚠️  Unknown certificate type - trying without client certificate for testing');
    }

    return new https.Agent(agentOptions);
  }

  /**
   * Check SEFAZ service status
   */
  async checkStatus(): Promise<SEFAZStatusResponse> {
    try {
      console.log('📝 Attempting SEFAZ service status check...');
      console.log(`🔗 Endpoint: ${this.endpoints.STATUS}`);
      
      // Create HTTPS agent with proper certificate configuration
      const httpsAgent = this.createHttpsAgent();
      
      // Build SOAP request
      const soapEnvelope = this.buildStatusSoapEnvelope();
      
      // Make request with axios
      const response = await axios.post(this.endpoints.STATUS, soapEnvelope, {
        httpsAgent,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF'
        },
        timeout: this.config.timeout
      });
      
      // Parse the SOAP response
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(response.data);
      
      // Extract the NFE response from SOAP envelope
      const nfeResponse = parsed['soap:Envelope']['soap:Body'][0]['nfeStatusServicoNFResponse'][0]['nfeResultMsg'][0];
      const statusResponse = await parser.parseStringPromise(nfeResponse);
      
      const status = statusResponse.retConsStatServ;
      
      return {
        status: status.cStat[0] === '107' ? 'OK' : 'ERROR',
        message: status.xMotivo[0],
        timestamp: status.dhRecbto[0]
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        message: `Service status check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send NFE for authorization
   */
  async authorizeNFE(signedXML: string): Promise<SEFAZResponse> {
    try {
      const httpsAgent = this.createHttpsAgent();
      
      // Build SOAP envelope
      const soapEnvelope = this.buildAuthorizationEnvelope(signedXML);
      
      // Make request with axios
      const response = await axios.post(this.endpoints.AUTHORIZATION, soapEnvelope, {
        httpsAgent,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote'
        },
        timeout: this.config.timeout
      });
      
      // Parse the SOAP response
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(response.data);
      
      // Extract the NFE response from SOAP envelope
      const nfeResponse = parsed['soap:Envelope']['soap:Body'][0]['nfeAutorizacaoLoteResponse'][0]['nfeResultMsg'][0];
      const authResponse = await parser.parseStringPromise(nfeResponse);
      
      const retEnviNFe = authResponse.retEnviNFe;
      const status = retEnviNFe.cStat[0];
      
      if (status === '103') {
        // Success - batch received
        const receiptNumber = retEnviNFe.infRec[0].nRec[0];
        return {
          success: true,
          receiptNumber,
          errorMessage: retEnviNFe.xMotivo[0]
        };
      } else {
        // Error
        return {
          success: false,
          errorCode: status,
          errorMessage: retEnviNFe.xMotivo[0]
        };
      }
    } catch (error) {
      return {
        success: false,
        errorCode: '999',
        errorMessage: `Authorization failed: ${error.message}`
      };
    }
  }

  /**
   * Poll for authorization result
   */
  async pollAuthorization(receiptNumber: string, maxAttempts: number = 10): Promise<SEFAZResponse> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const httpsAgent = this.createHttpsAgent();
        
        // Build SOAP envelope
        const soapEnvelope = this.buildPollingEnvelope(receiptNumber);
        
        // Make request with axios
        const response = await axios.post(this.endpoints.RET_AUTHORIZATION, soapEnvelope, {
          httpsAgent,
          headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote'
          },
          timeout: this.config.timeout
        });
        
        // Parse the SOAP response
        const parser = new xml2js.Parser();
        const parsed = await parser.parseStringPromise(response.data);
        
        // Extract the NFE response from SOAP envelope
        const nfeResponse = parsed['soap:Envelope']['soap:Body'][0]['nfeRetAutorizacaoLoteResponse'][0]['nfeResultMsg'][0];
        const pollResponse = await parser.parseStringPromise(nfeResponse);
        
        const retConsReciNFe = pollResponse.retConsReciNFe;
        const status = retConsReciNFe.cStat[0];
        
        if (status === '104') {
          // Processing - wait and retry
          await this.delay(5000); // Wait 5 seconds
          continue;
        } else if (status === '105') {
          // Success - NFE authorized
          const protocol = retConsReciNFe.protNFe[0].infProt[0];
          return {
            success: true,
            protocol: protocol.nProt[0],
            authorizedXML: response.data,
            errorMessage: protocol.xMotivo[0]
          };
        } else {
          // Error or rejection
          return {
            success: false,
            errorCode: status,
            errorMessage: retConsReciNFe.xMotivo[0]
          };
        }
      } catch (error) {
        if (attempt === maxAttempts) {
          return {
            success: false,
            errorCode: '999',
            errorMessage: `Polling failed after ${maxAttempts} attempts: ${error.message}`
          };
        }
        await this.delay(2000); // Wait 2 seconds before retry
      }
    }
    
    return {
      success: false,
      errorCode: '999',
      errorMessage: 'Polling timeout'
    };
  }

  /**
   * Sign XML with digital certificate
   */
  signXML(xml: string): string {
    try {
      // For now, return the XML without signature (placeholder)
      // TODO: Implement proper XML digital signature with A1 certificate
      console.warn('XML digital signature not implemented yet - using unsigned XML');
      return xml;
    } catch (error) {
      throw new Error(`XML signing failed: ${error.message}`);
    }
  }

  private buildStatusSoapEnvelope(): string {
    const statusRequest = this.buildStatusRequestXML();
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    <nfeStatusServicoNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
      <nfeDadosMsg>${statusRequest}</nfeDadosMsg>
    </nfeStatusServicoNF>
  </soap:Body>
</soap:Envelope>`;
  }

  private buildStatusRequestXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <tpAmb>2</tpAmb>
  <cUF>15</cUF>
  <xServ>STATUS</xServ>
</consStatServ>`;
  }

  private buildAuthorizationEnvelope(xml: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
      ${xml}
    </nfeDadosMsg>
  </soap:Body>
</soap:Envelope>`;
  }

  private buildPollingEnvelope(receiptNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4">
      <?xml version="1.0" encoding="UTF-8"?>
      <consReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <tpAmb>2</tpAmb>
        <nRec>${receiptNumber}</nRec>
      </consReciNFe>
    </nfeDadosMsg>
  </soap:Body>
</soap:Envelope>`;
  }

  private getCertificateBase64(): string {
    // Return placeholder certificate data
    return 'PLACEHOLDER_CERTIFICATE_DATA';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 