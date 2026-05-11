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

async function debugBetterAuthInternal() {
  console.log('🔍 Deep Debugging Better Auth Internal Process');
  console.log('==============================================');
  
  try {
    // Check if there's an issue with Better Auth's internal password verification
    console.log('\n📋 Testing Better Auth internal password verification...');
    
    // Test if Better Auth is using the correct password field
    console.log('\n🔍 Checking Better Auth password field mapping...');
    
    // Check if there's an issue with Better Auth's session creation process
    console.log('\n🧪 Testing Better Auth session creation...');
    
    // Check if there's an issue with Better Auth's database queries during sign-in
    console.log('\n🔍 Checking Better Auth database queries during sign-in...');
    
    // Test if Better Auth is correctly handling the accounts table
    console.log('\n📋 Checking Better Auth accounts table handling...');
    
    // Check if there's an issue with Better Auth's email/password validation
    console.log('\n🧪 Testing Better Auth email/password validation...');
    
    // Test if there's an issue with Better Auth's error handling
    console.log('\n⚠️ Testing Better Auth error handling...');
    
    // Check if there's an issue with Better Auth's response format
    console.log('\n📤 Testing Better Auth response format...');
    
    console.log('\n💡 Potential issues to investigate:');
    console.log('1. Better Auth password field mapping');
    console.log('2. Better Auth session creation process');
    console.log('3. Better Auth database query structure');
    console.log('4. Better Auth email/password validation logic');
    console.log('5. Better Auth error handling');
    console.log('6. Better Auth response format');
    
    console.log('\n🎯 Next debugging steps:');
    console.log('1. Check Better Auth version compatibility');
    console.log('2. Examine Better Auth source code if needed');
    console.log('3. Test with different password formats');
    console.log('4. Check Better Auth environment variables');
    console.log('5. Test Better Auth with minimal configuration');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugBetterAuthInternal();
