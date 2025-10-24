# 🤖 PredictHub AI System

## Overview

The AI-powered insights system for PredictHub provides intelligent market analysis, sentiment tracking, price predictions, and smart recommendations using both algorithmic analysis and Ollama AI language models.

## ✨ Features Implemented

### 1. **AI Sentiment Analysis**
- Real-time sentiment scoring (0-100)
- Social media sentiment tracking (Twitter, Reddit)
- News sentiment analysis
- Community sentiment aggregation
- Trend detection (bullish/bearish/neutral)

### 2. **Price Predictions**
- Multi-timeframe predictions (1h, 6h, 24h, 7d, 30d)
- Confidence intervals for each prediction
- Volatility analysis
- Historical accuracy tracking
- AI-powered or algorithmic predictions

### 3. **Market Intelligence**
- Overall opportunity score (0-100)
- Risk assessment with breakdown
- Liquidity scoring
- Volatility analysis
- AI recommendations (strong_buy, buy, hold, sell, strong_sell, avoid)

### 4. **Smart Recommendations**
- Personalized market suggestions
- High-probability opportunities
- Risk-adjusted recommendations
- Arbitrage detection (planned)
- Similar market discovery (planned)

## 🏗️ Architecture

### File Structure

```
src/
├── types/
│   └── ai-insights.ts              # AI data types and schemas
├── services/
│   ├── ai-intelligence-service.ts  # Core AI service (algorithmic)
│   └── ollama-ai-service.ts        # Ollama AI integration (real AI)
├── components/
│   └── ai-insights-dashboard.tsx   # AI dashboard UI components
├── app/api/ai/
│   └── route.ts                    # AI API endpoints
└── config/
    ├── ai-config.ts                # AI feature toggles
    └── ollama-config.ts            # Ollama API configuration
```

### Data Flow

```
User clicks AI tab in modal
    ↓
AIInsightsDashboard component loads
    ↓
Fetches from /api/ai?endpoint=insights&marketId=123
    ↓
AI API calls AIIntelligenceService
    ↓
┌─────────────────────────────────────┐
│  Can use either:                    │
│  1. Algorithmic analysis (fast)     │
│  2. Ollama AI (real AI, slower)     │
└─────────────────────────────────────┘
    ↓
Returns comprehensive AI insights
    ↓
Dashboard renders 4 tabs:
- Sentiment Analysis
- Price Predictions
- Market Intelligence
- Smart Insights
```

## 🔧 Configuration

### Feature Toggles (`src/config/ai-config.ts`)

```typescript
export const AI_CONFIG = {
  AI_ENABLED: true,                      // Master switch
  SENTIMENT_ANALYSIS_ENABLED: true,      // Sentiment feature
  PRICE_PREDICTION_ENABLED: true,        // Predictions feature
  MARKET_INTELLIGENCE_ENABLED: true,     // Intelligence feature
  RECOMMENDATIONS_ENABLED: true,         // Recommendations feature
  UPDATE_INTERVAL: 60000,                // 1 minute
  CACHE_TIMEOUT: 300000,                 // 5 minutes
};
```

### Ollama Configuration (`src/config/ollama-config.ts`)

```typescript
export const OLLAMA_CONFIG = {
  API_KEY: 'your-api-key-here',
  API_URL: 'https://api.ollama.ai/v1',
  MODEL: 'llama2',
  USE_OLLAMA_FOR_SENTIMENT: true,
  USE_OLLAMA_FOR_PREDICTIONS: true,
  FALLBACK_TO_MOCK: true,
};
```

## 🚀 Usage

### In the UI

1. Open any market modal
2. Click the "🤖 AI Insights" tab
3. View 4 different AI analysis sections:
   - **Sentiment**: Social media, news, community sentiment
   - **Predictions**: Multi-timeframe price forecasts
   - **Intelligence**: Risk assessment, opportunity scoring
   - **Insights**: Smart recommendations and key factors

### Via API

```typescript
// Get all AI insights
GET /api/ai?endpoint=insights&marketId=123

// Get sentiment only
GET /api/ai?endpoint=sentiment&marketId=123

// Get predictions only
GET /api/ai?endpoint=predictions&marketId=123

// Get intelligence only
GET /api/ai?endpoint=intelligence&marketId=123

// Get recommendations
GET /api/ai?endpoint=recommendations&limit=10

// Check AI config
GET /api/ai?endpoint=config
```

### Programmatically

```typescript
import { aiIntelligenceService } from '@/services/ai-intelligence-service';

// Analyze sentiment
const sentiment = await aiIntelligenceService.analyzeMarketSentiment(market);

// Generate predictions
const predictions = await aiIntelligenceService.generatePricePredictions(market);

// Get market intelligence
const intelligence = await aiIntelligenceService.analyzeMarketIntelligence(market);

// Get full insights
const insights = await aiIntelligenceService.getMarketInsights(market);
```

## 🛡️ Safety Features

### 1. Feature Toggles
- Master kill switch to disable all AI features
- Individual feature toggles for granular control
- Emergency disable function

### 2. Fallback Mechanisms
- Automatic fallback to algorithmic analysis if Ollama fails
- Cached results with configurable timeout
- Graceful error handling

### 3. Easy Rollback
All AI code is in separate files and can be removed by:
```bash
# Delete AI files
rm -rf src/types/ai-insights.ts
rm -rf src/services/ai-intelligence-service.ts
rm -rf src/services/ollama-ai-service.ts
rm -rf src/components/ai-insights-dashboard.tsx
rm -rf src/app/api/ai/
rm -rf src/config/ai-config.ts
rm -rf src/config/ollama-config.ts

# Remove AI tab from modal (edit polymarket-style-modal.tsx)
# Remove: { id: 'ai', label: '🤖 AI Insights', icon: Brain }
# Remove: {activeTab === 'ai' && <AIInsightsDashboard market={market} />}
```

## 🧪 Testing

### Manual Testing
1. Run dev server: `npm run dev`
2. Open any market
3. Click "🤖 AI Insights" tab
4. Verify all 4 tabs load correctly
5. Check for any console errors

### Test Ollama Connection
```typescript
import { ollamaAIService } from '@/services/ollama-ai-service';

const isConnected = await ollamaAIService.testConnection();
console.log('Ollama connected:', isConnected);
```

## 📊 Performance

### Caching
- Default cache timeout: 5 minutes
- Configurable per-feature
- Automatic cache invalidation

### API Response Times
- Algorithmic analysis: 50-200ms
- Ollama AI analysis: 2-10 seconds (depends on model)
- Cached results: <10ms

### Optimization Tips
1. Use algorithmic analysis for instant results
2. Enable Ollama only for premium users
3. Increase cache timeout for less volatile markets
4. Implement background refresh for popular markets

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time AI chat for market questions
- [ ] Automated trading signals
- [ ] Portfolio optimization
- [ ] Market forecasting (long-term)
- [ ] Social trading (follow AI recommendations)
- [ ] Custom AI models per market category
- [ ] A/B testing of AI predictions vs actual outcomes

### Ollama Models to Try
- `llama2` - General purpose (current)
- `llama3` - More advanced reasoning
- `mistral` - Faster responses
- `codellama` - For technical markets
- `mixtral` - Best accuracy

## 🐛 Troubleshooting

### AI Tab Not Showing
- Check `AI_CONFIG.AI_ENABLED` is `true`
- Check `AI_CONFIG.SHOW_AI_TAB_IN_MODAL` is `true`
- Verify modal imports `AIInsightsDashboard`

### Ollama API Errors
- Verify API key in `ollama-config.ts`
- Check network connectivity
- Try enabling `FALLBACK_TO_MOCK`
- Check API rate limits

### Slow Performance
- Reduce `UPDATE_INTERVAL`
- Increase `CACHE_TIMEOUT`
- Disable Ollama and use algorithmic only
- Implement lazy loading for AI tab

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Check all imports are correct
- Verify Zod schemas are properly defined

## 📝 API Reference

### AI Intelligence Service

```typescript
class AIIntelligenceService {
  // Analyze market sentiment
  async analyzeMarketSentiment(market: PredictionMarket): Promise<AISentimentData>
  
  // Generate price predictions
  async generatePricePredictions(market: PredictionMarket): Promise<AIPredictionData>
  
  // Analyze market intelligence
  async analyzeMarketIntelligence(market: PredictionMarket): Promise<AIIntelligenceData>
  
  // Get smart recommendations
  async getRecommendations(markets: PredictionMarket[], limit: number): Promise<AIRecommendation[]>
  
  // Get complete insights
  async getMarketInsights(market: PredictionMarket): Promise<AIInsights>
  
  // Configuration
  updateConfig(config: Partial<AIConfig>): void
  getConfig(): AIConfig
  isEnabled(): boolean
  clearCache(): void
}
```

### Ollama AI Service

```typescript
class OllamaAIService {
  // Analyze sentiment using AI
  async analyzeSentiment(market: PredictionMarket): Promise<{sentiment, confidence, reasoning}>
  
  // Predict prices using AI
  async predictPrices(market: PredictionMarket): Promise<{predictions, reasoning}>
  
  // Analyze market using AI
  async analyzeMarket(market: PredictionMarket): Promise<{analysis, recommendation, confidence, keyFactors}>
  
  // Test connection
  async testConnection(): Promise<boolean>
}
```

## 🎓 Best Practices

1. **Always use feature toggles** - Enable/disable features without code changes
2. **Implement caching** - Reduce API calls and improve performance
3. **Fallback gracefully** - Always have a fallback for AI failures
4. **Monitor performance** - Track AI response times and accuracy
5. **User feedback** - Collect feedback on AI recommendations
6. **A/B testing** - Test different AI configurations
7. **Rate limiting** - Protect against API abuse
8. **Error logging** - Log all AI errors for debugging

## 📄 License

This AI system is part of PredictHub and follows the same license.

## 🤝 Contributing

To add new AI features:
1. Add types to `ai-insights.ts`
2. Implement in `ai-intelligence-service.ts`
3. Add API endpoint in `app/api/ai/route.ts`
4. Create UI component in `components/`
5. Update configuration in `ai-config.ts`
6. Test thoroughly
7. Update this README

---

**Built with ❤️ by Jarvis de developer for Draco**

*Making prediction markets intelligent, one AI insight at a time.* 🤖✨

