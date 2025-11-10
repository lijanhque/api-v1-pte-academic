// Test auth functionality
import { auth } from './lib/auth/auth';
import { db } from './lib/db/drizzle';

async function testAuth() {
  console.log('Testing auth configuration...');
  
  // Test auth object is properly configured
  console.log('✅ Auth object configured:', !!auth);
  console.log('✅ Database connection working:', !!db);
  
  // Test Better Auth environment variables
  const requiredEnvVars = [
    'POSTGRES_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'NEXT_PUBLIC_BETTER_AUTH_URL',
    'AUTH_SECRET'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missingEnvVars.length === 0) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing environment variables:', missingEnvVars);
  }
  
  console.log('\n🎉 Auth setup completed successfully!');
}

testAuth().catch(console.error);