#!/usr/bin/env node

/**
 * WalletConnect Setup Script
 * 
 * This script helps you set up your WalletConnect Project ID
 * for PredictHub prediction market platform.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 WalletConnect Project ID Setup for PredictHub\n');

console.log('📋 Steps to get your WalletConnect Project ID:');
console.log('1. Go to https://cloud.walletconnect.com/');
console.log('2. Sign up/Login with GitHub');
console.log('3. Click "Create Project"');
console.log('4. Enter project name: "PredictHub"');
console.log('5. Enter description: "Prediction Market Aggregator"');
console.log('6. Select "App" as project type');
console.log('7. Copy your Project ID (looks like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6)\n');

rl.question('Enter your WalletConnect Project ID: ', (projectId) => {
  if (!projectId || projectId.length < 20) {
    console.log('❌ Invalid Project ID. Please try again.');
    rl.close();
    return;
  }

  console.log('\n✅ Project ID received:', projectId);
  
  console.log('\n🔧 Next steps:');
  console.log('1. Add to your .env.local file:');
  console.log(`   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${projectId}`);
  
  console.log('\n2. For Vercel deployment:');
  console.log('   - Go to Vercel Dashboard → Settings → Environment Variables');
  console.log(`   - Add: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = ${projectId}`);
  
  console.log('\n3. Test locally:');
  console.log('   npm run dev');
  console.log('   - Open browser and test wallet connection');
  
  console.log('\n🚀 Your WalletConnect is now configured!');
  rl.close();
});

rl.on('close', () => {
  console.log('\n💡 Pro tip: You can also set this via Vercel CLI:');
  console.log('   vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID your-project-id');
  process.exit(0);
});
