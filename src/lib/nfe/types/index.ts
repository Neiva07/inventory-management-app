// NFE (Nota Fiscal Eletrônica) Type Definitions
// Based on Brazilian NFE schema v4.00

export interface NFE {
  // Main NFE structure
  ide: NFEIdentification;
  emit: NFEEmitter;
  dest: NFERecipient;
  det: NFEProduct[];
  total: NFETotals;
  transp: NFETransport;
  cobr?: NFEPayment;
  infAdic?: NFEAdditionalInfo;
  exporta?: NFEExport;
  compra?: NFEPurchase;
  cana?: NFESugarCane;
}

export interface NFEIdentification {
  cUF: string;           // State code (2 digits)
  cNF: string;           // Document number (8 digits)
  natOp: string;         // Operation nature (description)
  mod: string;           // Model (55 for NFE)
  serie: string;         // Series (3 digits)
  nNF: string;           // Document number (9 digits)
  dhEmi: string;         // Emission date/time (ISO 8601)
  tpNF: string;          // Type (0=Output, 1=Input)
  idDest: string;        // Destination type (1=Internal, 2=External, 3=Internal+External)
  cMunFG: string;        // City code (7 digits)
  tpImp: string;         // Print type (0=White, 1=Receipt, 2=Self-adhesive, 3=Normal)
  tpEmis: string;        // Emission type (1=Normal, 2=Contingency, 3=SCAN, 4=EPEC, 5=FSDA)
  cDV: string;           // Check digit (1 digit)
  tpAmb: string;         // Environment (1=Production, 2=Homologation)
  finNFe: string;        // Purpose (1=Normal, 2=Complement, 3=Adjustment, 4=Devolution)
  indFinal: string;      // Final consumer (0=No, 1=Yes)
  indPres: string;       // Presence type (0=Not specified, 1=Operational, 2=Non-operational, 3=Exemption)
  procEmi: string;       // Emission process (0=Application, 3=SCAN, 4=EPEC, 5=FSDA)
  verProc: string;       // Process version
  dhCont?: string;       // Contingency date/time
  xJust?: string;        // Contingency justification
}

export interface NFEEmitter {
  CNPJ: string;          // CNPJ (14 digits)
  xNome: string;         // Company name
  xFant?: string;        // Trade name
  enderEmit: NFEAddress;
  IE: string;            // State registration
  IEST?: string;         // State registration (substitute)
  IM?: string;           // Municipal registration
  CNAE?: string;         // CNAE code
  CRT?: string;          // Tax regime (1=Simples, 2=Simplified, 3=Normal)
}

export interface NFERecipient {
  CNPJ?: string;         // CNPJ (14 digits) - if company
  CPF?: string;          // CPF (11 digits) - if individual
  xNome: string;         // Name
  enderDest: NFEAddress;
  indIEDest?: string;    // IE indicator (1=Contributor, 2=Exempt, 9=Non-contributor)
  IE?: string;           // State registration
  ISUF?: string;         // SUFRAMA registration
  email?: string;        // Email
}

export interface NFEAddress {
  xLgr: string;          // Street
  nro: string;           // Number
  xCpl?: string;         // Complement
  xBairro: string;       // Neighborhood
  cMun: string;          // City code (7 digits)
  xMun: string;          // City name
  UF: string;            // State (2 letters)
  CEP: string;           // ZIP code (8 digits)
  cPais?: string;        // Country code (1058 for Brazil)
  xPais?: string;        // Country name
  fone?: string;         // Phone
}

export interface NFEProduct {
  nItem: string;         // Item number
  prod: NFEProductDetails;
  imp: NFEProductTaxes;
  infAdProd?: string;    // Additional product info
}

export interface NFEProductDetails {
  cProd: string;         // Product code
  cEAN?: string;         // EAN code
  xProd: string;         // Product description
  NCM: string;           // NCM code (8 digits)
  NVE?: string[];        // NVE codes
  CEST?: string;         // CEST code
  indEscala?: string;    // Scale indicator (S=Yes, N=No)
  CNPJFab?: string;      // Manufacturer CNPJ
  cBenef?: string;       // Tax benefit code
  EXTIPI?: string;       // IPI exception
  CFOP: string;          // CFOP code (4 digits)
  uCom: string;          // Commercial unit
  qCom: number;          // Commercial quantity
  vUnCom: number;        // Commercial unit value
  vProd: number;         // Product total value
  cEANTrib?: string;     // EAN code for taxes
  uTrib: string;         // Tax unit
  qTrib: number;         // Tax quantity
  vUnTrib: number;       // Tax unit value
  vFrete?: number;       // Freight value
  vSeg?: number;         // Insurance value
  vDesc?: number;        // Discount value
  vOutro?: number;       // Other values
  indTot: string;        // Include in total (S=Yes, N=No)
  DI?: NFEDeclarationImport[];
  detExport?: NFEExportDetail[];
  xPed?: string;         // Purchase order
  nItemPed?: string;     // Purchase order item
  nFCI?: string;         // FCI (Foreign Trade Information)
}

export interface NFEProductTaxes {
  vTotTrib?: number;     // Total taxes
  ICMS?: NFEICMS;
  IPI?: NFEIPI;
  PIS?: NFEPIS;
  COFINS?: NFECOFINS;
  ISSQN?: NFEISSQN;
}

export interface NFEICMS {
  ICMS00?: NFEICMS00;
  ICMS10?: NFEICMS10;
  ICMS20?: NFEICMS20;
  ICMS30?: NFEICMS30;
  ICMS40?: NFEICMS40;
  ICMS51?: NFEICMS51;
  ICMS60?: NFEICMS60;
  ICMS70?: NFEICMS70;
  ICMS90?: NFEICMS90;
  ICMSSN101?: NFEICMSSN101;
  ICMSSN102?: NFEICMSSN102;
  ICMSSN201?: NFEICMSSN201;
  ICMSSN202?: NFEICMSSN202;
  ICMSSN500?: NFEICMSSN500;
  ICMSSN900?: NFEICMSSN900;
}

export interface NFEICMS00 {
  orig: string;          // Origin (0=National, 1=Foreign, 2=Foreign with similar product)
  CST: string;           // CST (00, 20, 40, 41, 60)
  modBC: string;         // BC calculation method (0=Value, 1=List, 2=Price, 3=Own)
  vBC: number;           // BC value
  pICMS: number;         // ICMS rate
  vICMS: number;         // ICMS value
  vICMSDeson?: number;   // Discharged ICMS value
  vFCP?: number;         // FCP value
  vBCST?: number;        // ST BC value
  vST?: number;          // ST value
  vFCPST?: number;       // ST FCP value
  vFCPSTRet?: number;    // Retained ST FCP value
  vII?: number;          // Import tax value
  vIPI?: number;         // IPI value
  vIPIDevol?: number;    // Devolved IPI value
  vOutro?: number;       // Other values
}

export interface NFEIPI {
  CNPJProd?: string;     // Manufacturer CNPJ
  cSelo?: string;        // Seal code
  qSelo?: number;        // Seal quantity
  cEnq: string;          // IPI code
  IPITrib?: NFEIPITrib;
  IPINT?: NFEIPINT;
}

export interface NFEIPITrib {
  CST: string;           // CST (00, 49, 50, 99)
  vBC?: number;          // BC value
  pIPI?: number;         // IPI rate
  qUnid?: number;        // Quantity per unit
  vUnid?: number;        // Unit value
  vIPI: number;          // IPI value
}

export interface NFEIPINT {
  CST: string;           // CST (01, 02, 03, 04, 05, 51, 52, 53, 54, 55)
}

export interface NFEPIS {
  CST: string;           // CST (01, 02, 03, 04, 05, 06, 07, 08, 09, 49, 99)
  vBC?: number;          // BC value
  pPIS?: number;         // PIS rate
  qBCProd?: number;      // BC quantity
  vAliqProd?: number;    // Product aliquot
  vPIS: number;          // PIS value
}

export interface NFECOFINS {
  CST: string;           // CST (01, 02, 03, 04, 05, 06, 07, 08, 09, 49, 99)
  vBC?: number;          // BC value
  pCOFINS?: number;      // COFINS rate
  qBCProd?: number;      // BC quantity
  vAliqProd?: number;    // Product aliquot
  vCOFINS: number;       // COFINS value
}

export interface NFEISSQN {
  vBC: number;           // BC value
  vAliq: number;         // Aliquot
  vISSQN: number;        // ISSQN value
  cMunFG: string;        // City code
  cListServ: string;     // Service list code
  vDeducao?: number;     // Deduction value
  vOutro?: number;       // Other values
  vDescIncond?: number;  // Unconditional discount
  vDescCond?: number;    // Conditional discount
  vISSRet?: number;      // Retained ISSQN
  indISS: string;        // ISSQN indicator (1=Exempt, 2=Not exempt, 3=Not applicable)
  cServico?: string;     // Service code
  cMun?: string;         // City code
  cPais?: string;        // Country code
  nProcesso?: string;    // Process number
  indIncentivo: string;  // Incentive indicator (1=Yes, 2=No)
}

export interface NFETotals {
  ICMSTot: NFEICMSTotals;
  ISSQNTot?: NFEISSQNTotals;
  retTrib?: NFERetTrib;
}

export interface NFEICMSTotals {
  vBC: number;           // BC value
  vICMS: number;         // ICMS value
  vICMSDeson: number;    // Discharged ICMS value
  vFCPUFDest?: number;   // FCP for destination UF
  vICMSUFDest?: number;  // ICMS for destination UF
  vICMSUFRemet?: number; // ICMS for origin UF
  vFCP: number;          // FCP value
  vBCST: number;         // ST BC value
  vST: number;           // ST value
  vFCPST: number;        // ST FCP value
  vFCPSTRet: number;     // Retained ST FCP value
  vProd: number;         // Product total value
  vFrete: number;        // Freight value
  vSeg: number;          // Insurance value
  vDesc: number;         // Discount value
  vII: number;           // Import tax value
  vIPI: number;          // IPI value
  vIPIDevol: number;     // Devolved IPI value
  vPIS: number;          // PIS value
  vCOFINS: number;       // COFINS value
  vOutro: number;        // Other values
  vNF: number;           // Document total value
  vTotTrib?: number;     // Total taxes
}

export interface NFEISSQNTotals {
  vServ: number;         // Service value
  vBC: number;           // BC value
  vISS: number;          // ISSQN value
  vPIS: number;          // PIS value
  vCOFINS: number;       // COFINS value
  dCompet: string;       // Competition date
  vDeducao: number;      // Deduction value
  vOutro: number;        // Other values
  vDescIncond: number;   // Unconditional discount
  vDescCond: number;     // Conditional discount
  vISSRet: number;       // Retained ISSQN
  cRegTrib?: string;     // Tax regime
}

export interface NFERetTrib {
  vRetPrev?: number;     // Social security retention
  vRetTrib?: number;     // Tax retention
}

export interface NFETransport {
  modFrete: string;      // Freight mode (0=By sender, 1=By recipient, 2=By third party, 3=Own, 4=By recipient with sender, 9=No freight)
  transporta?: NFETransportCompany;
  retTransp?: NFERetTransp;
  veiculo?: NFEVehicle;
  reboque?: NFETrailer[];
  vagao?: string;        // Wagon
  balsa?: string;        // Barge
  vol?: NFEVolume[];
}

export interface NFETransportCompany {
  CNPJ?: string;         // CNPJ
  CPF?: string;          // CPF
  xNome?: string;        // Name
  IE?: string;           // State registration
  xEnder?: string;       // Address
  xMun?: string;         // City
  UF?: string;           // State
}

export interface NFERetTransp {
  vServ: number;         // Service value
  vBCRet: number;        // BC retention
  pICMSRet: number;      // ICMS retention rate
  vICMSRet: number;      // ICMS retention value
  CFOP: string;          // CFOP
  cMunFG: string;        // City code
}

export interface NFEVehicle {
  placa: string;         // License plate
  UF: string;            // State
  RNTC?: string;         // RNTC
}

export interface NFETrailer {
  placa: string;         // License plate
  UF: string;            // State
  RNTC?: string;         // RNTC
}

export interface NFEVolume {
  qVol?: number;         // Volume quantity
  esp?: string;          // Specification
  marca?: string;        // Brand
  nVol?: string;         // Volume number
  pesoL?: number;        // Gross weight
  pesoB?: number;        // Net weight
  lacres?: NFELacres[];
}

export interface NFELacres {
  nLacre: string;        // Seal number
}

export interface NFEPayment {
  fat?: NFEFatura;
  dup?: NFEDuplicata[];
}

export interface NFEFatura {
  nFat?: string;         // Invoice number
  vOrig?: number;        // Original value
  vDesc?: number;        // Discount value
  vLiq?: number;         // Net value
}

export interface NFEDuplicata {
  nDup?: string;         // Duplicate number
  dVenc?: string;        // Due date
  vDup: number;          // Duplicate value
}

export interface NFEAdditionalInfo {
  infAdFisco?: string;   // Tax authority additional info
  infCpl?: string;       // Additional info
  obsCont?: NFEAdditionalInfoObs[];
  obsFisco?: NFEAdditionalInfoObs[];
  procRef?: NFEAdditionalInfoProc[];
}

export interface NFEAdditionalInfoObs {
  xCampo: string;        // Field name
  xTexto: string;        // Field text
}

export interface NFEAdditionalInfoProc {
  nProc: string;         // Process number
  indProc: string;       // Process indicator (0=SEFAZ, 1=Justiça Federal, 2=Justiça Estadual, 3=Secex/RFB, 9=Outros)
  tpAto?: string;        // Act type
  xJust?: string;        // Justification
}

export interface NFEExport {
  UFSaidaPais: string;   // Exit UF
  xLocExporta: string;   // Export location
  xLocDespacho?: string; // Dispatch location
}

export interface NFEPurchase {
  xNEmp?: string;        // Purchase order
  xPed?: string;         // Purchase order
  cont?: NFEPurchaseContract[];
}

export interface NFEPurchaseContract {
  nCont?: string;        // Contract number
  xPed?: string;         // Purchase order
}

export interface NFEExportDetail {
  detExport: {
    nDraw?: string;      // Drawback number
    exportInd?: NFEExportInd;
  };
}

export interface NFEExportInd {
  nRE?: string;          // Export registration
  chNFe?: string;        // NFE key
  qExport?: number;      // Export quantity
}

export interface NFEDeclarationImport {
  nDI: string;           // Declaration number
  dDI: string;           // Declaration date
  xLocDesemb: string;    // Disembarkation location
  UFDesemb: string;      // Disembarkation UF
  dDesemb: string;       // Disembarkation date
  tpViaTransp: string;   // Transport type (1=Maritime, 2=Fluvial, 3=Lacustre, 4=Aérea, 5=Postal, 6=Ferroviária, 7=Rodoviária, 8=Rodoviário-trem, 9=Other)
  vAFRMM?: number;       // AFRMM value
  tpIntermedio: string;  // Intermediary type (1=Import by own account, 2=Import by order and account, 3=Import by order and account, 9=Other)
  CNPJ?: string;         // CNPJ
  UFTerceiro?: string;   // Third party UF
  cExportador: string;   // Exporter code
  adi?: NFEDeclarationImportItem[];
}

export interface NFEDeclarationImportItem {
  nAdicao: string;       // Addition number
  nSeqAdic: string;      // Addition sequence
  cFabricante: string;   // Manufacturer code
  vDescDI?: number;      // DI discount value
  nDraw?: string;        // Drawback number
}

export interface NFESugarCane {
  safra: string;         // Harvest
  ref: string;           // Reference month/year
  forDia: NFESugarCaneDay[];
  qTotMes: number;       // Total month quantity
  qTotAnt: number;       // Total previous quantity
  qTotGer: number;       // Total general quantity
  deduc: NFESugarCaneDeduction[];
  vFor: number;          // For value
  vTotDed: number;       // Total deduction value
  vLiqFor: number;       // Net for value
}

export interface NFESugarCaneDay {
  dia: string;           // Day
  qtde: number;          // Quantity
}

export interface NFESugarCaneDeduction {
  xDed: string;          // Deduction description
  vDed: number;          // Deduction value
}

// Additional types for specific ICMS situations
export interface NFEICMS10 extends NFEICMS00 {
  modBCST: string;       // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
}

export interface NFEICMS20 extends NFEICMS00 {
  pRedBC: number;        // BC reduction rate
  vBCFCP?: number;       // FCP BC value
  pFCP?: number;         // FCP rate
  vFCP: number;          // FCP value
}

export interface NFEICMS30 extends NFEICMS00 {
  modBCST: string;       // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
}

export interface NFEICMS40 {
  orig: string;          // Origin
  CST: string;           // CST (40, 41, 50)
  vICMSDeson: number;    // Discharged ICMS value
  motDesICMS: string;    // ICMS discharge reason
  vICMS?: number;        // ICMS value
  vBCFCP?: number;       // FCP BC value
  pFCP?: number;         // FCP rate
  vFCP: number;          // FCP value
}

export interface NFEICMS51 {
  orig: string;          // Origin
  CST: string;           // CST (51)
  modBC?: string;        // BC calculation method
  pRedBC?: number;       // BC reduction rate
  vBC?: number;          // BC value
  pICMS?: number;        // ICMS rate
  vICMSOp?: number;      // ICMS operation value
  pDif?: number;         // Difference rate
  vICMSDif?: number;     // ICMS difference value
  vICMS: number;         // ICMS value
  vBCFCP?: number;       // FCP BC value
  pFCP?: number;         // FCP rate
  vFCP: number;          // FCP value
}

export interface NFEICMS60 {
  orig: string;          // Origin
  CST: string;           // CST (60)
  vBCSTRet: number;      // Retained ST BC value
  pST?: number;          // ST rate
  pICMSSTRet?: number;   // Retained ST ICMS rate
  vICMSSTRet: number;    // Retained ST ICMS value
  vBCFCPSTRet?: number;  // Retained ST FCP BC value
  pFCPSTRet?: number;    // Retained ST FCP rate
  vFCPSTRet: number;     // Retained ST FCP value
  pRedBCEfet?: number;   // Effective BC reduction rate
  vBCEfet: number;       // Effective BC value
  pICMSEfet: number;     // Effective ICMS rate
  vICMSEfet: number;     // Effective ICMS value
}

export interface NFEICMS70 {
  orig: string;          // Origin
  CST: string;           // CST (70)
  modBC: string;         // BC calculation method
  pRedBC: number;        // BC reduction rate
  vBC: number;           // BC value
  pICMS: number;         // ICMS rate
  vICMS: number;         // ICMS value
  vBCFCP?: number;       // FCP BC value
  pFCP?: number;         // FCP rate
  vFCP: number;          // FCP value
  modBCST: string;       // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
}

export interface NFEICMS90 {
  orig: string;          // Origin
  CST: string;           // CST (90)
  modBC: string;         // BC calculation method
  vBC: number;           // BC value
  pRedBC?: number;       // BC reduction rate
  pICMS: number;         // ICMS rate
  vICMS: number;         // ICMS value
  vBCFCP?: number;       // FCP BC value
  pFCP?: number;         // FCP rate
  vFCP: number;          // FCP value
  modBCST: string;       // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
}

// Simples Nacional ICMS types
export interface NFEICMSSN101 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (101)
  pCredSN?: number;      // SN credit rate
  vCredICMSSN?: number;  // SN ICMS credit value
}

export interface NFEICMSSN102 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (102, 103, 300, 400)
}

export interface NFEICMSSN201 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (201)
  modBCST?: string;      // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
  pCredSN?: number;      // SN credit rate
  vCredICMSSN?: number;  // SN ICMS credit value
}

export interface NFEICMSSN202 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (202, 203)
  modBCST?: string;      // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
}

export interface NFEICMSSN500 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (500)
  vBCSTRet: number;      // Retained ST BC value
  pST?: number;          // ST rate
  pICMSSTRet?: number;   // Retained ST ICMS rate
  vICMSSTRet: number;    // Retained ST ICMS value
  vBCFCPSTRet?: number;  // Retained ST FCP BC value
  pFCPSTRet?: number;    // Retained ST FCP rate
  vFCPSTRet: number;     // Retained ST FCP value
  pRedBCEfet?: number;   // Effective BC reduction rate
  vBCEfet: number;       // Effective BC value
  pICMSEfet: number;     // Effective ICMS rate
  vICMSEfet: number;     // Effective ICMS value
}

export interface NFEICMSSN900 {
  orig: string;          // Origin
  CSOSN: string;         // CSOSN (900)
  modBC?: string;        // BC calculation method
  vBC?: number;          // BC value
  pRedBC?: number;       // BC reduction rate
  pICMS?: number;        // ICMS rate
  vICMS?: number;        // ICMS value
  modBCST: string;       // ST BC calculation method
  pMVAST?: number;       // ST MVA
  pRedBCST?: number;     // ST BC reduction rate
  vBCST: number;         // ST BC value
  pICMSST: number;       // ST ICMS rate
  vICMSST: number;       // ST ICMS value
  vBCFCPST?: number;     // ST FCP BC value
  pFCPST?: number;       // ST FCP rate
  vFCPST: number;        // ST FCP value
  pCredSN?: number;      // SN credit rate
  vCredICMSSN?: number;  // SN ICMS credit value
} 