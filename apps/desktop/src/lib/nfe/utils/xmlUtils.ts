import { NFE } from '../types';

export function generateXML(nfe: NFE): string {
  // Generate NFE XML structure
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00" Id="NFe${generateAccessKey(nfe)}">
      ${generateIdentificationXML(nfe.ide)}
      ${generateEmitterXML(nfe.emit)}
      ${generateRecipientXML(nfe.dest)}
      ${generateProductsXML(nfe.det)}
      ${generateTotalsXML(nfe.total)}
      ${generateTransportXML(nfe.transp)}
      ${nfe.cobr ? generatePaymentXML(nfe.cobr) : ''}
      ${nfe.infAdic ? generateAdditionalInfoXML(nfe.infAdic) : ''}
    </infNFe>
  </NFe>
</nfeProc>`;

  return xml;
}

function generateAccessKey(nfe: NFE): string {
  // Simplified access key generation
  const { ide, emit } = nfe;
  const uf = ide.cUF.padStart(2, '0');
  const aamm = new Date(ide.dhEmi).toISOString().slice(2, 7).replace('-', '');
  const cnpj = emit.CNPJ.replace(/\D/g, '').padStart(14, '0');
  const modelo = ide.mod.padStart(2, '0');
  const serie = ide.serie.padStart(3, '0');
  const numero = ide.nNF.padStart(9, '0');
  const tipoEmissao = ide.tpEmis.padStart(1, '0');
  const codigoNumerico = ide.cNF.padStart(8, '0');
  
  return `${uf}${aamm}${cnpj}${modelo}${serie}${numero}${tipoEmissao}${codigoNumerico}0`;
}

function generateIdentificationXML(ide: any): string {
  return `<ide>
    <cUF>${ide.cUF}</cUF>
    <cNF>${ide.cNF}</cNF>
    <natOp>${escapeXML(ide.natOp)}</natOp>
    <mod>${ide.mod}</mod>
    <serie>${ide.serie}</serie>
    <nNF>${ide.nNF}</nNF>
    <dhEmi>${ide.dhEmi}</dhEmi>
    <tpNF>${ide.tpNF}</tpNF>
    <idDest>${ide.idDest}</idDest>
    <cMunFG>${ide.cMunFG}</cMunFG>
    <tpImp>${ide.tpImp}</tpImp>
    <tpEmis>${ide.tpEmis}</tpEmis>
    <cDV>${ide.cDV}</cDV>
    <tpAmb>${ide.tpAmb}</tpAmb>
    <finNFe>${ide.finNFe}</finNFe>
    <indFinal>${ide.indFinal}</indFinal>
    <indPres>${ide.indPres}</indPres>
    <procEmi>${ide.procEmi}</procEmi>
    <verProc>${escapeXML(ide.verProc)}</verProc>
  </ide>`;
}

function generateEmitterXML(emit: any): string {
  return `<emit>
    <CNPJ>${emit.CNPJ}</CNPJ>
    <xNome>${escapeXML(emit.xNome)}</xNome>
    ${emit.xFant ? `<xFant>${escapeXML(emit.xFant)}</xFant>` : ''}
    ${generateAddressXML(emit.enderEmit, 'enderEmit')}
    <IE>${emit.IE}</IE>
    ${emit.IEST ? `<IEST>${emit.IEST}</IEST>` : ''}
    ${emit.IM ? `<IM>${emit.IM}</IM>` : ''}
    ${emit.CNAE ? `<CNAE>${emit.CNAE}</CNAE>` : ''}
    ${emit.CRT ? `<CRT>${emit.CRT}</CRT>` : ''}
  </emit>`;
}

function generateRecipientXML(dest: any): string {
  return `<dest>
    ${dest.CNPJ ? `<CNPJ>${dest.CNPJ}</CNPJ>` : ''}
    ${dest.CPF ? `<CPF>${dest.CPF}</CPF>` : ''}
    <xNome>${escapeXML(dest.xNome)}</xNome>
    ${generateAddressXML(dest.enderDest, 'enderDest')}
    ${dest.indIEDest ? `<indIEDest>${dest.indIEDest}</indIEDest>` : ''}
    ${dest.IE ? `<IE>${dest.IE}</IE>` : ''}
    ${dest.ISUF ? `<ISUF>${dest.ISUF}</ISUF>` : ''}
    ${dest.email ? `<email>${dest.email}</email>` : ''}
  </dest>`;
}

function generateAddressXML(address: any, tagName: string): string {
  return `<${tagName}>
    <xLgr>${escapeXML(address.xLgr)}</xLgr>
    <nro>${address.nro}</nro>
    ${address.xCpl ? `<xCpl>${escapeXML(address.xCpl)}</xCpl>` : ''}
    <xBairro>${escapeXML(address.xBairro)}</xBairro>
    <cMun>${address.cMun}</cMun>
    <xMun>${escapeXML(address.xMun)}</xMun>
    <UF>${address.UF}</UF>
    <CEP>${address.CEP}</CEP>
    ${address.cPais ? `<cPais>${address.cPais}</cPais>` : ''}
    ${address.xPais ? `<xPais>${escapeXML(address.xPais)}</xPais>` : ''}
    ${address.fone ? `<fone>${address.fone}</fone>` : ''}
  </${tagName}>`;
}

function generateProductsXML(det: any[]): string {
  return det.map((item, index) => `
    <det nItem="${item.nItem}">
      <prod>
        <cProd>${escapeXML(item.prod.cProd)}</cProd>
        ${item.prod.cEAN ? `<cEAN>${item.prod.cEAN}</cEAN>` : ''}
        <xProd>${escapeXML(item.prod.xProd)}</xProd>
        <NCM>${item.prod.NCM}</NCM>
        <CFOP>${item.prod.CFOP}</CFOP>
        <uCom>${escapeXML(item.prod.uCom)}</uCom>
        <qCom>${item.prod.qCom}</qCom>
        <vUnCom>${item.prod.vUnCom.toFixed(2)}</vUnCom>
        <vProd>${item.prod.vProd.toFixed(2)}</vProd>
        <uTrib>${escapeXML(item.prod.uTrib)}</uTrib>
        <qTrib>${item.prod.qTrib}</qTrib>
        <vUnTrib>${item.prod.vUnTrib.toFixed(2)}</vUnTrib>
        ${item.prod.vFrete ? `<vFrete>${item.prod.vFrete.toFixed(2)}</vFrete>` : ''}
        ${item.prod.vSeg ? `<vSeg>${item.prod.vSeg.toFixed(2)}</vSeg>` : ''}
        ${item.prod.vDesc ? `<vDesc>${item.prod.vDesc.toFixed(2)}</vDesc>` : ''}
        ${item.prod.vOutro ? `<vOutro>${item.prod.vOutro.toFixed(2)}</vOutro>` : ''}
        <indTot>${item.prod.indTot}</indTot>
      </prod>
      ${generateProductTaxesXML(item.imp)}
    </det>
  `).join('');
}

function generateProductTaxesXML(imp: any): string {
  return `<imp>
    ${imp.ICMS ? generateICMSXML(imp.ICMS) : ''}
    ${imp.IPI ? generateIPIXML(imp.IPI) : ''}
    ${imp.PIS ? generatePISXML(imp.PIS) : ''}
    ${imp.COFINS ? generateCOFINSXML(imp.COFINS) : ''}
  </imp>`;
}

function generateICMSXML(icms: any): string {
  // Simplified ICMS generation - in real implementation, handle all ICMS types
  const icmsType = Object.keys(icms)[0];
  const icmsData = icms[icmsType];
  
  return `<ICMS>
    <${icmsType}>
      <orig>${icmsData.orig}</orig>
      <CST>${icmsData.CST}</CST>
      <modBC>${icmsData.modBC}</modBC>
      <vBC>${icmsData.vBC.toFixed(2)}</vBC>
      <pICMS>${icmsData.pICMS.toFixed(2)}</pICMS>
      <vICMS>${icmsData.vICMS.toFixed(2)}</vICMS>
    </${icmsType}>
  </ICMS>`;
}

function generateIPIXML(ipi: any): string {
  return `<IPI>
    <cEnq>${ipi.cEnq}</cEnq>
    ${ipi.IPITrib ? `
      <IPITrib>
        <CST>${ipi.IPITrib.CST}</CST>
        <vIPI>${ipi.IPITrib.vIPI.toFixed(2)}</vIPI>
      </IPITrib>
    ` : ''}
  </IPI>`;
}

function generatePISXML(pis: any): string {
  return `<PIS>
    <CST>${pis.CST}</CST>
    <vPIS>${pis.vPIS.toFixed(2)}</vPIS>
  </PIS>`;
}

function generateCOFINSXML(cofins: any): string {
  return `<COFINS>
    <CST>${cofins.CST}</CST>
    <vCOFINS>${cofins.vCOFINS.toFixed(2)}</vCOFINS>
  </COFINS>`;
}

function generateTotalsXML(total: any): string {
  return `<total>
    <ICMSTot>
      <vBC>${total.ICMSTot.vBC.toFixed(2)}</vBC>
      <vICMS>${total.ICMSTot.vICMS.toFixed(2)}</vICMS>
      <vICMSDeson>${total.ICMSTot.vICMSDeson.toFixed(2)}</vICMSDeson>
      <vFCP>${total.ICMSTot.vFCP.toFixed(2)}</vFCP>
      <vBCST>${total.ICMSTot.vBCST.toFixed(2)}</vBCST>
      <vST>${total.ICMSTot.vST.toFixed(2)}</vST>
      <vFCPST>${total.ICMSTot.vFCPST.toFixed(2)}</vFCPST>
      <vFCPSTRet>${total.ICMSTot.vFCPSTRet.toFixed(2)}</vFCPSTRet>
      <vProd>${total.ICMSTot.vProd.toFixed(2)}</vProd>
      <vFrete>${total.ICMSTot.vFrete.toFixed(2)}</vFrete>
      <vSeg>${total.ICMSTot.vSeg.toFixed(2)}</vSeg>
      <vDesc>${total.ICMSTot.vDesc.toFixed(2)}</vDesc>
      <vII>${total.ICMSTot.vII.toFixed(2)}</vII>
      <vIPI>${total.ICMSTot.vIPI.toFixed(2)}</vIPI>
      <vIPIDevol>${total.ICMSTot.vIPIDevol.toFixed(2)}</vIPIDevol>
      <vPIS>${total.ICMSTot.vPIS.toFixed(2)}</vPIS>
      <vCOFINS>${total.ICMSTot.vCOFINS.toFixed(2)}</vCOFINS>
      <vOutro>${total.ICMSTot.vOutro.toFixed(2)}</vOutro>
      <vNF>${total.ICMSTot.vNF.toFixed(2)}</vNF>
    </ICMSTot>
  </total>`;
}

function generateTransportXML(transp: any): string {
  return `<transp>
    <modFrete>${transp.modFrete}</modFrete>
    ${transp.transporta ? `
      <transporta>
        ${transp.transporta.CNPJ ? `<CNPJ>${transp.transporta.CNPJ}</CNPJ>` : ''}
        ${transp.transporta.CPF ? `<CPF>${transp.transporta.CPF}</CPF>` : ''}
        ${transp.transporta.xNome ? `<xNome>${escapeXML(transp.transporta.xNome)}</xNome>` : ''}
        ${transp.transporta.IE ? `<IE>${transp.transporta.IE}</IE>` : ''}
        ${transp.transporta.xEnder ? `<xEnder>${escapeXML(transp.transporta.xEnder)}</xEnder>` : ''}
        ${transp.transporta.xMun ? `<xMun>${escapeXML(transp.transporta.xMun)}</xMun>` : ''}
        ${transp.transporta.UF ? `<UF>${transp.transporta.UF}</UF>` : ''}
      </transporta>
    ` : ''}
  </transp>`;
}

function generatePaymentXML(cobr: any): string {
  return `<cobr>
    ${cobr.fat ? `
      <fat>
        ${cobr.fat.nFat ? `<nFat>${escapeXML(cobr.fat.nFat)}</nFat>` : ''}
        ${cobr.fat.vOrig ? `<vOrig>${cobr.fat.vOrig.toFixed(2)}</vOrig>` : ''}
        ${cobr.fat.vDesc ? `<vDesc>${cobr.fat.vDesc.toFixed(2)}</vDesc>` : ''}
        ${cobr.fat.vLiq ? `<vLiq>${cobr.fat.vLiq.toFixed(2)}</vLiq>` : ''}
      </fat>
    ` : ''}
    ${cobr.dup ? cobr.dup.map((dup: any) => `
      <dup>
        <nDup>${escapeXML(dup.nDup)}</nDup>
        <dVenc>${dup.dVenc}</dVenc>
        <vDup>${dup.vDup.toFixed(2)}</vDup>
      </dup>
    `).join('') : ''}
  </cobr>`;
}

function generateAdditionalInfoXML(infAdic: any): string {
  return `<infAdic>
    ${infAdic.infAdFisco ? `<infAdFisco>${escapeXML(infAdic.infAdFisco)}</infAdFisco>` : ''}
    ${infAdic.infCpl ? `<infCpl>${escapeXML(infAdic.infCpl)}</infCpl>` : ''}
  </infAdic>`;
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 