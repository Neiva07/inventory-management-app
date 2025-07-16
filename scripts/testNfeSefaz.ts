#!/usr/bin/env ts-node

/**
 * Test script for NFE SEFAZ-PA homologation
 * Run with: yarn ts-node scripts/testNfeSefaz.ts
 */

import { runTests } from '../src/lib/nfe/examples/runTest';

console.log('🚀 Starting NFE SEFAZ-PA Test');
console.log('==============================\n');

runTests()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }); 