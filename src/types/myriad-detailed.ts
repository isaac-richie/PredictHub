// Myriad Markets API types based on the website structure
export interface MyriadMarket {
  id: string;
  question: string;
  description?: string;
  category: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity: number;
  endDate: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  closed: boolean;
  featured?: boolean;
  verified?: boolean;
  marketType: 'binary' | 'categorical' | 'scalar';
  resolutionSource?: string;
  tags: string[];
  image?: string;
  icon?: string;
  creator?: string;
  // Additional Myriad-specific fields
  points?: number;
  participants?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  lastTradeTime?: string;
  spread?: number;
  bid?: number;
  ask?: number;
}

export interface MyriadMarketDetailed extends MyriadMarket {
  // Detailed market information
  orderBook?: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
  recentTrades?: Array<{
    id: string;
    price: number;
    size: number;
    side: 'buy' | 'sell';
    timestamp: string;
    trader: string;
  }>;
  priceHistory?: Array<{
    timestamp: number;
    price: number;
    volume: number;
  }>;
  marketStats?: {
    totalTrades: number;
    uniqueTraders: number;
    avgTradeSize: number;
    volatility: number;
    sharpeRatio?: number;
  };
  resolution?: {
    status: 'pending' | 'resolved' | 'disputed';
    resolutionDate?: string;
    resolutionSource?: string;
    resolutionCriteria?: string;
  };
}

export interface MyriadCategory {
  id: string;
  name: string;
  description?: string;
  marketCount: number;
  totalVolume: number;
  icon?: string;
  color?: string;
}

export interface MyriadPriceHistory {
  timestamp: number;
  price: number;
  volume: number;
  value: number;
}

export interface MyriadMarketStats {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  totalLiquidity: number;
  averageLiquidity: number;
  topCategories: Array<{
    category: string;
    count: number;
    volume: number;
  }>;
  priceChanges: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
  };
}

// API Response types
export interface MyriadApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface MyriadError {
  error: {
    statusCode: number;
    name: string;
    message: string;
  };
}

