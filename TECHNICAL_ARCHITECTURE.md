# 🏗️ PredictHub Technical Architecture

## 📊 **System Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        PREDICTHUB                              │
│                    Prediction Market Aggregator                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Next.js   │  │    React    │  │   Tailwind  │            │
│  │  App Router │  │     19      │  │     CSS     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Wagmi     │  │ RainbowKit  │  │   Zod       │            │
│  │  Web3 Hooks │  │   Wallet    │  │ Validation  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Next.js   │  │  API Routes │  │  Middleware │            │
│  │  API Routes │  │  (RESTful)  │  │   (CORS)    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │Aggregation  │  │   AI Intel  │  │   Web Anal  │            │
│  │  Service    │  │   Service   │  │   Service   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Polymarket  │  │   Myriad    │  │ Limitless   │            │
│  │   Service   │  │   Service   │  │   Service   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL APIS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Polymarket  │  │   Myriad    │  │ Limitless   │            │
│  │   Gamma     │  │     API     │  │     API     │            │
│  │    API      │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ DuckDuckGo  │  │   Ollama    │  │   Mock AI   │            │
│  │     API     │  │  (Local)    │  │   (Prod)    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **Data Flow Architecture**

### **1. Market Data Flow**
```
User Request → Server Component → API Routes → Service Layer → External APIs
     ↓
Client Component ← Transformed Data ← Aggregation Service ← Raw API Data
```

### **2. AI Insights Flow**
```
Market Click → AI API → AI Intelligence Service → {
  Web Analysis Service → DuckDuckGo API → News Sentiment
  Ollama AI Service → Local AI Model → AI Analysis (Dev)
  Mock AI Service → Simulated Data → AI Analysis (Prod)
}
```

### **3. Real-time Updates**
```
WebSocket/SSE → Client State → React Re-render → UI Update
```

## 🎯 **Component Architecture**

### **Server-Side Rendering (SSR)**
```typescript
// app/page.tsx (Server Component)
export default async function Home() {
  const markets = await aggregationService.getAllMarkets();
  return <HomeClient markets={markets} />;
}
```

### **Client-Side Interactivity**
```typescript
// components/home-client.tsx (Client Component)
'use client';
export function HomeClient({ markets }) {
  const [selectedMarket, setSelectedMarket] = useState(null);
  // Interactive logic here
}
```

### **Modal System**
```typescript
// PolymarketStyleModal with AI Insights
<Modal>
  <Tabs>
    <Tab>Chart</Tab>
    <Tab>AI Insights</Tab>
    <Tab>Comments</Tab>
  </Tabs>
  <AIInsightsDashboard market={market} />
</Modal>
```

## 🔌 **API Architecture**

### **RESTful API Design**
```
GET /api/load-more?platform=polymarket&category=crypto&limit=20
GET /api/ai?endpoint=insights&marketId=123
GET /api/polymarket?endpoint=price-history&marketId=123
```

### **Service Layer Pattern**
```typescript
class ApiService {
  private apiClient: ApiClient;
  
  async getData(): Promise<TransformedData[]> {
    const rawData = await this.apiClient.get('/endpoint');
    return rawData.map(item => this.transform(item));
  }
}
```

## 🤖 **AI System Architecture**

### **Development Environment**
```
Web Analysis → DuckDuckGo API → Real News Data
AI Analysis → Ollama (Local) → llama3.2 Model
Fallback → Mock Data Service
```

### **Production Environment**
```
Web Analysis → DuckDuckGo API → Real News Data
AI Analysis → Mock Data Service → Simulated AI Responses
```

## 🗄️ **Data Models**

### **Core Market Model**
```typescript
interface PredictionMarket {
  id: string;
  title: string;
  platform: 'polymarket' | 'myriad' | 'limitlesslabs';
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  liquidity: number;
  endDate: Date;
  status: 'active' | 'resolved' | 'cancelled';
}
```

### **AI Insights Model**
```typescript
interface AIInsights {
  sentiment: AISentimentData;
  predictions: AIPredictionData;
  intelligence: AIIntelligenceData;
  recommendations: AIRecommendation[];
}
```

## 🔧 **Configuration Management**

### **Environment-Based Config**
```typescript
// Development
const config = {
  ollama: { enabled: true, url: 'http://localhost:11434' },
  webAnalysis: { enabled: true, api: 'duckduckgo' }
};

// Production
const config = {
  ollama: { enabled: false, url: '' },
  webAnalysis: { enabled: true, api: 'duckduckgo' }
};
```

## 🚀 **Deployment Architecture**

### **Vercel Deployment**
```
GitHub → Vercel → Serverless Functions → External APIs
```

### **Environment Variables**
```bash
NODE_ENV=production
NEXT_PUBLIC_POLYMARKET_API=https://gamma-api.polymarket.com
NEXT_PUBLIC_MYRIAD_API=your_myriad_api
NEXT_PUBLIC_LIMITLESS_API=your_limitless_api
```

## 📊 **Performance Optimizations**

### **Caching Strategy**
- **Server-Side**: Next.js built-in caching (60s revalidation)
- **Client-Side**: React state management
- **API**: Response caching with appropriate headers

### **Bundle Optimization**
- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: Remove unused code
- **Image Optimization**: Next.js automatic optimization

## 🔒 **Security Considerations**

### **API Security**
- **CORS**: Properly configured for production
- **Rate Limiting**: Implemented in API client
- **Input Validation**: Zod schemas for all inputs

### **Web3 Security**
- **Wallet Integration**: Secure via RainbowKit
- **Transaction Signing**: Handled by wallet providers

## 📈 **Monitoring & Analytics**

### **Error Tracking**
```typescript
// Error boundaries for React components
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### **Performance Monitoring**
- **Core Web Vitals**: Next.js built-in monitoring
- **API Response Times**: Logged in services
- **User Interactions**: Tracked via analytics

## 🔮 **Future Architecture Considerations**

### **Scalability**
- **Microservices**: Split services into separate deployments
- **Database**: Add persistent storage for user data
- **CDN**: Implement for static assets

### **Real-time Features**
- **WebSockets**: For live market updates
- **Server-Sent Events**: For AI analysis updates
- **Push Notifications**: For market alerts

---

**This architecture supports the current feature set while providing a foundation for future enhancements! 🚀**
