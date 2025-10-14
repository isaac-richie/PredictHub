import { z } from 'zod';

// Base prediction market schema
export const PredictionMarketSchema = z.object({
  id: z.string(),
  platform: z.enum(['polymarket', 'zeitgeist', 'omen', 'polkamarkets', 'limitlesslabs', 'other']),
  title: z.string(),
  question: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Market data
  totalVolume: z.number(),
  liquidity: z.number(),
  participantCount: z.number().optional(),
  
  // Price data
  yesPrice: z.number().min(0).max(1),
  noPrice: z.number().min(0).max(1),
  
  // Status
  status: z.enum(['active', 'resolved', 'cancelled', 'pending']),
  resolution: z.enum(['yes', 'no', 'pending']).optional(),
  
  // Metadata
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  slug: z.string().optional(),
  volumeNum: z.number().optional(),
  liquidityNum: z.number().optional(),
  openInterest: z.number().optional(),
  outcomes: z.array(z.string()).optional(),
  outcomePrices: z.array(z.string()).optional(),
  conditionId: z.string().optional(),
  startDate: z.date().optional(),
  resolved: z.boolean().optional(),
  
  // Additional Polymarket-specific fields (optional for other platforms)
  volume24hr: z.number().optional(),
  volume1wk: z.number().optional(),
  volume1mo: z.number().optional(),
  volume1yr: z.number().optional(),
  liquidityAmm: z.number().optional(),
  liquidityClob: z.number().optional(),
  bestBid: z.number().optional(),
  bestAsk: z.number().optional(),
  spread: z.number().optional(),
  lastTradePrice: z.number().optional(),
  oneHourPriceChange: z.number().optional(),
  oneDayPriceChange: z.number().optional(),
  oneWeekPriceChange: z.number().optional(),
  oneMonthPriceChange: z.number().optional(),
  oneYearPriceChange: z.number().optional(),
  competitive: z.number().optional(),
  cyom: z.boolean().optional(),
  feesEnabled: z.boolean().optional(),
  rfqEnabled: z.boolean().optional(),
  holdingRewardsEnabled: z.boolean().optional(),
  marketType: z.string().optional(),
  active: z.boolean().optional(),
  closed: z.boolean().optional(),
  archived: z.boolean().optional(),
  restricted: z.boolean().optional(),
  featured: z.boolean().optional(),
  pendingDeployment: z.boolean().optional(),
  deploying: z.boolean().optional(),
  fpmmLive: z.boolean().optional(),
  approved: z.boolean().optional(),
  ready: z.boolean().optional(),
  funded: z.boolean().optional(),
});

export type PredictionMarket = z.infer<typeof PredictionMarketSchema>;

// Market statistics schema
export const MarketStatsSchema = z.object({
  totalMarkets: z.number(),
  totalVolume24h: z.number(),
  totalVolume7d: z.number(),
  activeMarkets: z.number(),
  resolvedMarkets: z.number(),
  averageLiquidity: z.number(),
  topCategories: z.array(z.object({
    category: z.string(),
    count: z.number(),
    volume: z.number(),
  })),
});

export type MarketStats = z.infer<typeof MarketStatsSchema>;

// Price history schema
export const PriceHistorySchema = z.object({
  timestamp: z.date(),
  yesPrice: z.number(),
  noPrice: z.number(),
  volume: z.number().optional(),
});

export type PriceHistory = z.infer<typeof PriceHistorySchema>;

// API response schemas for different platforms
export const PolymarketMarketSchema = z.object({
  id: z.string(),
  question: z.string(),
  description: z.string().optional(),
  end_date_iso: z.string(),
  volume: z.number(),
  liquidity: z.number(),
  outcome_prices: z.array(z.number()),
  active: z.boolean(),
  archived: z.boolean(),
  closed: z.boolean(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const ZeitgeistMarketSchema = z.object({
  id: z.string(),
  question: z.string(),
  description: z.string().optional(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  volume: z.number(),
  liquidity: z.number(),
  outcomes: z.array(z.object({
    price: z.number(),
    name: z.string(),
  })),
  status: z.string(),
  categories: z.array(z.string()).optional(),
});

export const OmenMarketSchema = z.object({
  id: z.string(),
  question: z.string(),
  description: z.string().optional(),
  endDate: z.string(),
  volume: z.number(),
  liquidity: z.number(),
  outcomes: z.array(z.object({
    price: z.number(),
    name: z.string(),
  })),
  status: z.string(),
  category: z.string().optional(),
});

// Platform-specific market types
export type PolymarketMarket = z.infer<typeof PolymarketMarketSchema>;
export type ZeitgeistMarket = z.infer<typeof ZeitgeistMarketSchema>;
export type OmenMarket = z.infer<typeof OmenMarketSchema>;

// API configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  timeout?: number;
}

// Error handling
export class PredictionMarketError extends Error {
  constructor(
    message: string,
    public platform: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PredictionMarketError';
  }
}

