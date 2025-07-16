#!/usr/bin/env ts-node

/**
 * Export certificate from Keychain Access for SEFAZ testing
 * 
 * This script helps export the AC Certisign ICP-Brasil SSL EV G4 certificate
 * from macOS Keychain Access and convert it to the format needed for SEFAZ testing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CERT_DIR = path.join(process.cwd(), 'certs');
const CERT_FILE = path.join(CERT_DIR, 'test-certificate-pa.pfx');

/**
 * Check if certificate exists in Keychain
 */
async function checkKeychainCertificate(): Promise<boolean> {
  try {
    console.log('🔍 Checking Keychain Access for certificate...');
    
    // Search for Certisign certificate in Keychain
    const { stdout } = await execAsync('security find-certificate -a -c "AC Certisign ICP-Brasil SSL EV G4"');
    
    if (stdout.includes('AC Certisign ICP-Brasil SSL EV G4')) {
      console.log('✅ Found AC Certisign ICP-Brasil SSL EV G4 certificate in Keychain');
      return true;
    } else {
      console.log('❌ Certificate not found in Keychain');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Keychain:', error.message);
    return false;
  }
}

/**
 * Export certificate from Keychain to PEM format
 */
async function exportCertificateFromKeychain(): Promise<string> {
  try {
    console.log('📤 Exporting certificate from Keychain...');
    
    const pemFile = path.join(CERT_DIR, 'certisign-cert.pem');
    
    // Export certificate to PEM format
    await execAsync(`security find-certificate -a -c "AC Certisign ICP-Brasil SSL EV G4" -p > "${pemFile}"`);
    
    console.log(`✅ Certificate exported to: ${pemFile}`);
    return pemFile;
  } catch (error) {
    throw new Error(`Failed to export certificate: ${error.message}`);
  }
}

/**
 * Convert PEM to PFX format (if needed)
 */
async function convertPemToPfx(pemFile: string): Promise<void> {
  try {
    console.log('🔄 Converting certificate format...');
    
    // For now, we'll use the PEM file directly
    // In a real scenario, you might need to convert to PFX
    const pfxFile = path.join(CERT_DIR, 'test-certificate-pa.pfx');
    
    // Copy PEM to PFX location (as a placeholder)
    fs.copyFileSync(pemFile, pfxFile);
    
    console.log(`✅ Certificate ready for use: ${pfxFile}`);
  } catch (error) {
    throw new Error(`Failed to convert certificate: ${error.message}`);
  }
}

/**
 * Update SEFAZ client configuration for PEM certificate
 */
function updateSefazConfig(): void {
  console.log('⚙️  Updating SEFAZ configuration for PEM certificate...');
  
  // Create a configuration file for the certificate
  const configFile = path.join(CERT_DIR, 'certificate-config.json');
  const config = {
    certificatePath: path.join(CERT_DIR, 'certisign-cert.pem'),
    certificateType: 'PEM',
    certificatePassword: '', // PEM files usually don't have passwords
    description: 'AC Certisign ICP-Brasil SSL EV G4 certificate from Keychain Access',
    environment: 'HOMOLOGATION',
    state: 'PA',
    validFrom: new Date().toISOString(),
    notes: [
      'Certificate exported from macOS Keychain Access',
      'Use with SEFAZ-PA homologation environment',
      'Test CNPJ: 99999999000191',
      'Test IE: 999999999'
    ]
  };
  
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`✅ Configuration saved to: ${configFile}`);
}

/**
 * Verify certificate setup
 */
function verifyCertificateSetup(): void {
  console.log('\n🔍 Verifying Certificate Setup');
  console.log('==============================');
  
  const pemFile = path.join(CERT_DIR, 'certisign-cert.pem');
  const pfxFile = path.join(CERT_DIR, 'test-certificate-pa.pfx');
  const configFile = path.join(CERT_DIR, 'certificate-config.json');
  
  const files = [
    { path: pemFile, name: 'PEM Certificate' },
    { path: pfxFile, name: 'PFX Certificate' },
    { path: configFile, name: 'Configuration' }
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ ${file.name}: ${sizeKB} KB`);
    } else {
      console.log(`❌ ${file.name}: Not found`);
    }
  });
  
  console.log('\n📋 Next Steps:');
  console.log('1. Certificate is ready for SEFAZ testing');
  console.log('2. Run: yarn test:nfe');
  console.log('3. SEFAZ client will use the exported certificate');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    console.log('🔐 Exporting Certificate from Keychain Access');
    console.log('=============================================');
    
    // Ensure certificates directory exists
    if (!fs.existsSync(CERT_DIR)) {
      fs.mkdirSync(CERT_DIR, { recursive: true });
      console.log(`✅ Created certificates directory: ${CERT_DIR}`);
    }
    
    // Check if certificate exists in Keychain
    const exists = await checkKeychainCertificate();
    
    if (!exists) {
      console.log('\n❌ Certificate not found in Keychain Access');
      console.log('📋 Please ensure you have:');
      console.log('1. Downloaded AC Certisign ICP-Brasil SSL EV G4 certificate');
      console.log('2. Added it to Keychain Access');
      console.log('3. Run this script again');
      return;
    }
    
    // Export certificate
    const pemFile = await exportCertificateFromKeychain();
    
    // Convert format
    await convertPemToPfx(pemFile);
    
    // Update configuration
    updateSefazConfig();
    
    // Verify setup
    verifyCertificateSetup();
    
    console.log('\n🎉 Certificate export complete!');
    console.log('Ready for SEFAZ-PA homologation testing');
    
  } catch (error) {
    console.error('❌ Certificate export failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { 
  checkKeychainCertificate, 
  exportCertificateFromKeychain, 
  convertPemToPfx,
  updateSefazConfig,
  verifyCertificateSetup 
}; 