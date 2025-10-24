# 🌐 Vercel Environment Variables Guide

## 📋 **Required Environment Variables for Vercel**

### **🔧 Core Configuration**

| Variable | Description | Required | Default Value |
|----------|-------------|----------|---------------|
| `NODE_ENV` | Environment mode | ✅ | `production` |
| `NEXT_PUBLIC_VERCEL_URL` | Vercel deployment URL | ✅ | Auto-set by Vercel |
| `VERCEL_URL` | Vercel deployment URL | ✅ | Auto-set by Vercel |

### **🔌 API Endpoints**

| Variable | Description | Required | Default Value |
|----------|-------------|----------|---------------|
| `NEXT_PUBLIC_POLYMARKET_API` | Polymarket API endpoint | ❌ | `https://gamma-api.polymarket.com` |
| `NEXT_PUBLIC_MYRIAD_API` | Myriad API endpoint | ❌ | `https://api.myriad.social` |
| `NEXT_PUBLIC_LIMITLESS_API` | Limitless API endpoint | ❌ | `https://api.limitless.exchange` |
| `NEXT_PUBLIC_POLKAMARKETS_API` | Polkamarkets API endpoint | ❌ | `https://api.polkamarkets.com` |

### **🔗 Web3 Configuration**

| Variable | Description | Required | Default Value |
|----------|-------------|----------|---------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | ❌ | `demo-project-id` |

---

## 🚀 **Vercel Deployment Setup**

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

```bash
# Core Environment
NODE_ENV=production

# API Endpoints (Optional - uses defaults if not set)
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_POLKAMARKETS_API=https://api.polkamarkets.com

# Web3 Configuration (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_POLYMARKET_API https://gamma-api.polymarket.com
vercel env add NEXT_PUBLIC_MYRIAD_API https://api.myriad.social
vercel env add NEXT_PUBLIC_LIMITLESS_API https://api.limitless.exchange
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID your-project-id

# Deploy
vercel --prod
```

### **Method 3: .env.production File**

Create `.env.production` in your project root:

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_POLKAMARKETS_API=https://api.polkamarkets.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

---

## 🎯 **Environment-Specific Configuration**

### **Development (.env.local)**
```bash
NODE_ENV=development
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-dev-project-id
```

### **Production (Vercel)**
```bash
NODE_ENV=production
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=https://api.myriad.social
NEXT_PUBLIC_LIMITLESS_API=https://api.limitless.exchange
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-prod-project-id
```

---

## 🔧 **How Variables Are Used in Code**

### **API Configuration**
```typescript
// src/services/polymarket-api.ts
const POLYMARKET_API_BASE_URL = process.env.NEXT_PUBLIC_POLYMARKET_API || 'https://gamma-api.polymarket.com';

// src/services/myriad-api.ts
const MYRIAD_API_BASE_URL = process.env.NEXT_PUBLIC_MYRIAD_API || 'https://api.myriad.social';

// src/services/limitlesslabs-api.ts
const LIMITLESS_API_BASE_URL = process.env.NEXT_PUBLIC_LIMITLESS_API || 'https://api.limitless.exchange';
```

### **Web3 Configuration**
```typescript
// src/components/onchain-providers.tsx
const wagmiConfig = getDefaultConfig({
  appName: 'PredictHub',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [base, baseSepolia, polygon, polygonAmoy],
  ssr: true,
});
```

### **Environment Detection**
```typescript
// src/config/ollama-config.ts
const isProduction = process.env.NODE_ENV === 'production';

// src/lib/api-url.ts
const baseUrl = 
  process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
```

---

## 🚨 **Important Notes**

### **✅ Required for Production**
- `NODE_ENV=production` - Enables production optimizations
- `NEXT_PUBLIC_VERCEL_URL` - Auto-set by Vercel
- `VERCEL_URL` - Auto-set by Vercel

### **❌ Optional (Have Defaults)**
- All `NEXT_PUBLIC_*_API` variables have sensible defaults
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` has demo fallback

### **🔒 Security**
- All variables are `NEXT_PUBLIC_*` (safe for client-side)
- No sensitive API keys required
- All APIs are public endpoints

---

## 🧪 **Testing Environment Variables**

### **Local Testing**
```bash
# Check if variables are loaded
npm run dev
# Open browser console and check:
console.log(process.env.NEXT_PUBLIC_POLYMARKET_API);
```

### **Vercel Testing**
```bash
# Deploy to preview
vercel

# Check environment variables in Vercel dashboard
# Or add temporary logging:
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  POLYMARKET_API: process.env.NEXT_PUBLIC_POLYMARKET_API,
  VERCEL_URL: process.env.VERCEL_URL
});
```

---

## 🚀 **Quick Deploy Commands**

```bash
# 1. Set up environment variables in Vercel dashboard
# 2. Deploy
vercel --prod

# Or if using GitHub integration:
# Just push to main branch - Vercel auto-deploys
git push origin main
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **API calls failing**
   - Check if `NEXT_PUBLIC_*_API` variables are set correctly
   - Verify API endpoints are accessible

2. **WalletConnect not working**
   - Get a real Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

3. **Build failures**
   - Ensure all required variables are set
   - Check for typos in variable names

### **Debug Commands**
```bash
# Check environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local

# Test build locally
npm run build
```

---

## 📊 **Environment Variable Summary**

| Category | Variables | Required | Purpose |
|----------|-----------|----------|---------|
| **Core** | `NODE_ENV`, `VERCEL_URL` | ✅ | Basic functionality |
| **APIs** | `NEXT_PUBLIC_*_API` | ❌ | External data sources |
| **Web3** | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ❌ | Wallet connectivity |

**Your app will work with just the core variables! All others are optional with sensible defaults.** 🚀
