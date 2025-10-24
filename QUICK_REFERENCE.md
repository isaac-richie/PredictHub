# 🚀 PredictHub Quick Reference

## 🎯 **Essential Commands**

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Check linting
npm run type-check   # TypeScript check
```

## 📁 **Key Files to Know**

### **Core Components**
- `src/app/page.tsx` - Home page (Server Component)
- `src/components/home-client.tsx` - Client-side logic
- `src/components/enhanced-server-markets.tsx` - Main market grid
- `src/components/polymarket-style-modal.tsx` - Market detail modal
- `src/components/ai-insights-dashboard.tsx` - AI insights UI

### **Services**
- `src/services/aggregation-service.ts` - Main data aggregation
- `src/services/ai-intelligence-service.ts` - AI analysis logic
- `src/services/polymarket-api.ts` - Polymarket integration
- `src/services/limitlesslabs-api.ts` - Limitless integration
- `src/services/myriad-api.ts` - Myriad integration

### **Configuration**
- `src/config/ollama-config.ts` - AI configuration
- `src/types/prediction-market.ts` - Core data types
- `src/types/ai-insights.ts` - AI data types

## 🔧 **Common Tasks**

### **Add New Platform**
1. Create API service in `src/services/`
2. Add to `aggregation-service.ts`
3. Add platform card in `enhanced-server-markets.tsx`
4. Update types in `prediction-market.ts`

### **Modify AI Features**
1. Edit `ai-intelligence-service.ts` for logic
2. Edit `ai-insights-dashboard.tsx` for UI
3. Update `ollama-config.ts` for configuration

### **Fix API Issues**
1. Check API service files
2. Verify API routes in `src/app/api/`
3. Check `api-client.ts` for generic issues

## 🐛 **Common Issues & Fixes**

### **WagmiProviderNotFoundError**
```typescript
// Ensure OnchainProviders wraps client components
<OnchainProviders>
  <YourComponent />
</OnchainProviders>
```

### **API 404 Errors**
- Check if API route file exists
- Verify Next.js dev server port (3000 vs 3001)
- Check API endpoint URLs

### **Volume Display Issues**
```typescript
// Use formatCurrency helper
const formatCurrency = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
};
```

### **AI Features Not Working**
- Development: Check Ollama is running (`ollama serve`)
- Production: Features use mock data (expected)
- Check `ollama-config.ts` settings

## 🎨 **UI Patterns**

### **Server vs Client Components**
```typescript
// Server Component (data fetching)
export default async function ServerComponent() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component (interactions)
'use client';
export function ClientComponent({ data }) {
  const [state, setState] = useState();
  // Interactive logic
}
```

### **Modal Pattern**
```typescript
// Conditional rendering
{isModalOpen && selectedMarket && (
  <Modal 
    market={selectedMarket}
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
  />
)}
```

## 🔌 **API Patterns**

### **Service Pattern**
```typescript
export class ApiService {
  private apiClient: ApiClient;
  
  constructor() {
    this.apiClient = new ApiClient(baseUrl, config);
  }
  
  async getData(): Promise<DataType[]> {
    const response = await this.apiClient.get('/endpoint');
    return response.map(item => this.transformData(item));
  }
}
```

### **API Route Pattern**
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await service.getData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## 🚀 **Deployment Checklist**

- [ ] `npm run build` succeeds
- [ ] No lint errors (`npm run lint`)
- [ ] Environment variables set
- [ ] AI features work (mock data in production)
- [ ] All platforms load data
- [ ] Modal interactions work
- [ ] Responsive design works

## 📊 **Debugging Tips**

### **Console Logging**
```typescript
// Service debugging
console.log('🔍 ServiceName: Action', data);

// API debugging
console.log('🔍 ApiClient: Request to:', endpoint);
console.log('🔍 ApiClient: Response:', status, data);
```

### **Common Debug Commands**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/load-more

# Check build
npm run build
```

## 🎯 **Performance Tips**

- Use Server Components for data fetching
- Implement proper loading states
- Use React.memo for expensive components
- Optimize images with Next.js Image component
- Implement proper error boundaries

## 📝 **Code Style**

- **Components**: PascalCase (`MarketCard`)
- **Functions**: camelCase (`fetchMarkets`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case (`market-card.tsx`)

## 🔗 **Useful Links**

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Need Help?** Check the full `DEVELOPER_GUIDE.md` for detailed explanations! 🚀
