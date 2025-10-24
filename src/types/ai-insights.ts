import { z } from 'zod';

// ============================================================================
// AI INSIGHTS TYPE DEFINITIONS
// ============================================================================
// This file contains all type definitions for AI-powered prediction analysis
// Can be safely removed if AI features are disabled
// ============================================================================

// Web Source Type (for real-time web analysis)
export interface WebSource {
  type: 'news' | 'social' | 'forum' | 'blog';
  title: string;
  url?: string;
  snippet: string;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
  publishedAt?: Date;
  source: string;
}

// Sentiment Analysis Types
export const AISentimentDataSchema = z.object({
  marketId: z.string(),
  timestamp: z.date(),
  
  // Social media sentiment scores (-1 to 1, where -1 is bearish, 1 is bullish)
  socialSentiment: z.object({
    twitter: z.number().min(-1).max(1),
    reddit: z.number().min(-1).max(1),
    overall: z.number().min(-1).max(1),
  }),
  
  // News sentiment analysis
  newsSentiment: z.object({
    positive: z.number().min(0).max(100),
    negative: z.number().min(0).max(100),
    neutral: z.number().min(0).max(100),
    overall: z.number().min(-1).max(1),
  }),
  
  // Community sentiment from platform discussions
  communitySentiment: z.array(z.object({
    platform: z.string(),
    sentiment: z.number().min(-1).max(1),
    volume: z.number(),
  })),
  
  // Overall sentiment score (0-100)
  sentimentScore: z.number().min(0).max(100),
  
  // Confidence level (0-1)
  confidence: z.number().min(0).max(1),
  
  // Sentiment trend direction
  trend: z.enum(['bullish', 'bearish', 'neutral']),
  
  // 🌐 Web analysis metadata (optional, only when web analysis is available)
  webAnalysis: z.optional(z.object({
    sourcesCount: z.number(),
    summary: z.string(),
    keyPoints: z.array(z.string()),
    warnings: z.array(z.string()),
    sources: z.array(z.any()), // WebSource array
  })),
});

export type AISentimentData = z.infer<typeof AISentimentDataSchema>;

// Price Prediction Types
export const AIPredictionDataSchema = z.object({
  marketId: z.string(),
  timestamp: z.date(),
  
  // Predictions for different timeframes
  predictions: z.array(z.object({
    timeframe: z.enum(['1h', '6h', '24h', '7d', '30d']),
    yesPrice: z.number().min(0).max(1),
    noPrice: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    volatility: z.number().min(0).max(1),
    priceChange: z.number(), // Expected price change percentage
  })),
  
  // ML model information
  modelVersion: z.string(),
  modelAccuracy: z.number().min(0).max(1),
  
  // Historical accuracy tracking
  historicalAccuracy: z.object({
    last7Days: z.number().min(0).max(1),
    last30Days: z.number().min(0).max(1),
    allTime: z.number().min(0).max(1),
  }),
  
  // Confidence intervals
  confidenceInterval: z.object({
    lower: z.number().min(0).max(1),
    upper: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1), // e.g., 0.95 for 95% CI
  }),
});

export type AIPredictionData = z.infer<typeof AIPredictionDataSchema>;

// Market Intelligence Types
export const AIIntelligenceDataSchema = z.object({
  marketId: z.string(),
  timestamp: z.date(),
  
  // Risk assessment scores (0-100, higher = more risk)
  riskScore: z.number().min(0).max(100),
  liquidityScore: z.number().min(0).max(100), // Higher = better liquidity
  volatilityScore: z.number().min(0).max(100), // Higher = more volatile
  timeToExpiryScore: z.number().min(0).max(100), // Based on time remaining
  
  // Overall opportunity score (0-100, higher = better opportunity)
  overallScore: z.number().min(0).max(100),
  
  // Risk breakdown
  riskFactors: z.object({
    liquidityRisk: z.number().min(0).max(100),
    volatilityRisk: z.number().min(0).max(100),
    timeRisk: z.number().min(0).max(100),
    marketRisk: z.number().min(0).max(100),
  }),
  
  // Similar markets (by question similarity)
  similarMarkets: z.array(z.object({
    marketId: z.string(),
    similarity: z.number().min(0).max(1),
    platform: z.string(),
  })),
  
  // Arbitrage opportunities across platforms
  arbitrageOpportunities: z.array(z.object({
    platform: z.string(),
    priceDifference: z.number(),
    profitPotential: z.number(),
    liquidity: z.number(),
  })),
  
  // Market trends
  trends: z.array(z.object({
    direction: z.enum(['up', 'down', 'sideways']),
    strength: z.number().min(0).max(100),
    timeframe: z.string(),
    indicator: z.string(), // e.g., 'volume', 'price', 'sentiment'
  })),
  
  // AI recommendations
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell', 'avoid']),
  recommendationReason: z.string(),
});

export type AIIntelligenceData = z.infer<typeof AIIntelligenceDataSchema>;

// Smart Recommendations Types
export const AIRecommendationSchema = z.object({
  marketId: z.string(),
  score: z.number().min(0).max(100),
  reason: z.string(),
  category: z.enum(['high_probability', 'arbitrage', 'trending', 'undervalued', 'risk_adjusted']),
  confidence: z.number().min(0).max(1),
  estimatedReturn: z.number(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  timeframe: z.string(),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

// Combined AI Insights (all data together)
export const AIInsightsSchema = z.object({
  marketId: z.string(),
  timestamp: z.date(),
  sentiment: AISentimentDataSchema,
  predictions: AIPredictionDataSchema,
  intelligence: AIIntelligenceDataSchema,
  recommendations: z.array(AIRecommendationSchema),
  
  // Feature availability flags
  features: z.object({
    sentimentAnalysis: z.boolean(),
    pricePrediction: z.boolean(),
    marketIntelligence: z.boolean(),
    recommendations: z.boolean(),
  }),
});

export type AIInsights = z.infer<typeof AIInsightsSchema>;

// AI Configuration
export interface AIConfig {
  enabled: boolean;
  sentimentAnalysisEnabled: boolean;
  pricePredictionEnabled: boolean;
  marketIntelligenceEnabled: boolean;
  recommendationsEnabled: boolean;
  updateInterval: number; // milliseconds
  cacheTimeout: number; // milliseconds
}

// Default AI configuration
export const defaultAIConfig: AIConfig = {
  enabled: true,
  sentimentAnalysisEnabled: true,
  pricePredictionEnabled: true,
  marketIntelligenceEnabled: true,
  recommendationsEnabled: true,
  updateInterval: 60000, // 1 minute
  cacheTimeout: 300000, // 5 minutes
};

// AI Error Types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    const safeMessage = typeof message === 'string' && message.trim() ? message : 'Unknown AI service error';
    super(safeMessage);
    this.name = 'AIServiceError';
    this.service = typeof service === 'string' && service.trim() ? service : 'unknown';
    this.statusCode = typeof statusCode === 'number' && statusCode > 0 ? statusCode : undefined;
    this.originalError = originalError instanceof Error ? originalError : undefined;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIServiceError);
    }
  }
}

// News Article Type
export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
}

// Social Media Post Type
export interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'reddit' | 'discord';
  content: string;
  author: string;
  timestamp: Date;
  sentiment: number; // -1 to 1
  engagement: number; // likes, upvotes, etc.
}

// Trading Signal Type
export interface TradingSignal {
  marketId: string;
  signal: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  confidence: number; // 0-1
  reasoning: string;
  timestamp: Date;
  expiresAt: Date;
}

// Market Correlation Type
export interface MarketCorrelation {
  market1Id: string;
  market2Id: string;
  correlation: number; // -1 to 1
  timeframe: string;
  strength: 'strong' | 'moderate' | 'weak';
}

