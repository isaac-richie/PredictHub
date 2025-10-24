# 🔗 WalletConnect Setup Complete!

## ✅ **Your WalletConnect Project ID:**
```
a57b3b54d689f7423af373642a7a3110
```

## 🚀 **Setup Instructions:**

### **1. Create .env.local file (Development)**
Create a file called `.env.local` in your project root with:

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a57b3b54d689f7423af373642a7a3110
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_POLKAMARKETS_API=https://api.polkamarkets.com
NODE_ENV=development
```

### **2. Set Vercel Environment Variables (Production)**
In your Vercel dashboard:
1. Go to **Settings → Environment Variables**
2. Add these variables:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a57b3b54d689f7423af373642a7a3110
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_POLKAMARKETS_API=https://api.polkamarkets.com
NODE_ENV=production
```

### **3. Test Locally**
```bash
# Start development server
npm run dev

# Open browser and test wallet connection
# The wallet button should now work properly!
```

### **4. Deploy to Vercel**
```bash
# Deploy with environment variables
vercel --prod
```

## 🎯 **What This Enables:**

- ✅ **Wallet Connection**: Users can connect MetaMask, WalletConnect, etc.
- ✅ **Multi-Chain Support**: Base, Polygon, Base Sepolia, Polygon Amoy
- ✅ **RainbowKit UI**: Beautiful wallet selection modal
- ✅ **Transaction Signing**: Users can sign transactions
- ✅ **Account Management**: View connected wallet address

## 🔧 **Current Configuration:**

```typescript
// src/components/onchain-providers.tsx
const wagmiConfig = getDefaultConfig({
  appName: 'PredictHub',
  projectId: 'a57b3b54d689f7423af373642a7a3110', // Your Project ID
  chains: [base, baseSepolia, polygon, polygonAmoy],
  ssr: true,
});
```

## 🚨 **Important Notes:**

- **Development**: Uses `.env.local` file
- **Production**: Uses Vercel environment variables
- **Fallback**: Code has your Project ID as fallback
- **Security**: Project ID is safe to expose (public)

## 🧪 **Testing:**

1. **Start dev server**: `npm run dev`
2. **Click wallet button** in the app
3. **Select a wallet** (MetaMask, WalletConnect, etc.)
4. **Verify connection** works properly

## 🚀 **Ready to Deploy!**

Your WalletConnect is now properly configured for both development and production! 🎉
