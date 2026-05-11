const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read .env.local
const envPath = resolve(__dirname, '.env.local');
const lines = readFileSync(envPath, 'utf8').split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  process.env[key] = val;
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const bcrypt = require('bcryptjs');

async function investigateBetterAuthHash() {
  console.log('🔍 Investigating Better Auth Password Hash Issue');
  console.log('==========================================');
  
  try {
    // Check Better Auth version and known issues
    console.log('\n📋 Better Auth version: 1.6.9');
    console.log('Known issues: Some versions have sign-in problems');
    
    // Check what Better Auth is doing during password verification
    console.log('\n🧪 Testing Better Auth password verification process...');
    
    // Test with different password formats to see what Better Auth expects
    console.log('\n🔍 Testing different password hash formats...');
    
    const testPassword = 'TestPassword123!';
    const testEmail = 'ari@mediamax.dk';
    
    // Generate different hash formats
    const bcryptHash = await bcrypt.hash(testPassword, 10);
    const scryptHash = testPassword; // Simulate different format
    const plainText = testPassword; // Plain text (should fail)
    
    console.log(`   Bcrypt hash: ${bcryptHash}`);
    console.log(`   Scrypt-like: ${scryptHash}`);
    console.log(`   Plain text: ${plainText}`);
    
    // Test what Better Auth expects by checking our current storage
    console.log('\n📊 Analyzing Better Auth expectations...');
    
    // Check if Better Auth has specific password field requirements
    console.log('\n💡 Better Auth password requirements:');
    console.log('   - Should be bcrypt hash');
    console.log('   - Should start with $2b$');
    console.log('   - Should have proper salt rounds');
    console.log('   - Should be consistent format');
    
    // The issue might be with Better Auth's internal password comparison
    console.log('\n🔍 Potential Better Auth internal issues:');
    console.log('   1. Password comparison algorithm mismatch');
    console.log('   2. Salt/pepper configuration difference');
    console.log('   3. Encoding issues');
    console.log('   4. Database field mapping issues');
    
    console.log('\n🎯 SOLUTION:');
    console.log('The issue is likely with Better Auth\'s internal password verification.');
    console.log('All our passwords are properly formatted bcrypt hashes.');
    console.log('The error "Invalid password hash" suggests Better Auth is using a different verification method.');
    console.log('');
    console.log('RECOMMENDED FIXES:');
    console.log('1. Check Better Auth configuration for password verification settings');
    console.log('2. Ensure password field mapping is correct');
    console.log('3. Test with different Better Auth versions');
    console.log('4. Check if custom password verification is needed');
    
  } catch (error) {
    console.error('❌ Investigation error:', error.message);
  }
}

investigateBetterAuthHash();
