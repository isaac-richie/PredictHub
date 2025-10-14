// Detailed Polymarket API Types based on actual API response
export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  sortBy: string;
  category: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  liquidityAmm: number;
  liquidityClob: number;
  commentCount: number;
  cyom: boolean;
  closedTime: string;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  enableNegRisk: boolean;
  negRiskAugmented: boolean;
  pendingDeployment: boolean;
  deploying: boolean;
}

export interface PolymarketMarket {
  // Core market data
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  description: string;
  category: string;
  
  // Visual assets
  image: string;
  icon: string;
  twitterCardImage: string;
  
  // Market outcomes and pricing
  outcomes: string; // JSON string array
  outcomePrices: string; // JSON string array
  clobTokenIds: string; // JSON string array
  
  // Market status
  active: boolean;
  closed: boolean;
  archived: boolean;
  restricted: boolean;
  marketType: string;
  
  // Financial data
  volume: string; // String representation
  volumeNum: number; // Numeric representation
  liquidity: string; // String representation
  liquidityNum: number; // Numeric representation
  
  // Volume metrics
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  
  // AMM vs CLOB volume breakdown
  volume1wkAmm: number;
  volume1moAmm: number;
  volume1yrAmm: number;
  volume1wkClob: number;
  volume1moClob: number;
  volume1yrClob: number;
  
  // Price data
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  
  // Price changes
  oneDayPriceChange: number;
  oneHourPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  oneYearPriceChange: number;
  
  // Dates
  endDate: string;
  endDateIso: string;
  createdAt: string;
  updatedAt: string;
  closedTime: string;
  
  // Market configuration
  hasReviewedDates: boolean;
  readyForCron: boolean;
  clearBookOnStart: boolean;
  manualActivation: boolean;
  negRiskOther: boolean;
  umaResolutionStatuses: string; // JSON string array
  
  // Deployment status
  pendingDeployment: boolean;
  deploying: boolean;
  fpmmLive: boolean;
  
  // Market features
  cyom: boolean; // Create Your Own Market
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  
  // Rewards system
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  
  // Trading features
  rfqEnabled: boolean; // Request for Quote
  holdingRewardsEnabled: boolean;
  feesEnabled: boolean;
  
  // Market maker
  marketMakerAddress: string;
  
  // Metadata
  updatedBy: number;
  mailchimpTag: string;
  creator: string;
  ready: boolean;
  funded: boolean;
  
  // Events (nested event data)
  events: PolymarketEvent[];
}

export interface PolymarketCategory {
  id: string;
  label: string;
  parentCategory: string;
  slug: string;
  publishedAt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PolymarketMarketsResponse {
  data: PolymarketMarket[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PolymarketCategoriesResponse {
  data: PolymarketCategory[];
  total?: number;
}

// Search parameters
export interface PolymarketSearchParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  archived?: boolean;
  closed?: boolean;
  category?: string;
  q?: string; // Search query
}

// Market statistics (derived from market data)
export interface PolymarketMarketStats {
  totalMarkets: number;
  activeMarkets: number;
  closedMarkets: number;
  archivedMarkets: number;
  totalVolume: number;
  totalVolume24h: number;
  totalVolume7d: number;
  totalVolume30d: number;
  totalLiquidity: number;
  averageLiquidity: number;
  categories: Array<{
    category: string;
    count: number;
    volume: number;
    liquidity: number;
  }>;
  topMarkets: Array<{
    id: string;
    question: string;
    volume: number;
    liquidity: number;
    category: string;
  }>;
}

// Price history data (if available)
export interface PolymarketPriceHistory {
  timestamp: string;
  price: number;
  volume: number;
  liquidity: number;
}

// Trade data (if available)
export interface PolymarketTrade {
  id: string;
  marketId: string;
  outcome: string;
  price: number;
  amount: number;
  timestamp: string;
  user: string;
  type: 'buy' | 'sell';
}

// Order book data (if available)
export interface PolymarketOrder {
  id: string;
  marketId: string;
  outcome: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
  user: string;
  status: 'open' | 'filled' | 'cancelled';
}

// Error types
export interface PolymarketError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// API Configuration
export interface PolymarketApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Utility types for data transformation
export type PolymarketMarketStatus = 'active' | 'closed' | 'archived';
export type PolymarketMarketType = 'normal' | 'binary' | 'multi';
export type PolymarketVolumePeriod = '24h' | '7d' | '30d' | '1y';
export type PolymarketPriceChangePeriod = '1h' | '1d' | '1w' | '1m' | '1y';




