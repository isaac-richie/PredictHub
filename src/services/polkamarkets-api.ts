import { createApiClient } from '@/lib/api-client';
import { PredictionMarket } from '@/types/prediction-market';

// Polkamarkets API types
export interface PolkamarketsMarket {
  id: string;
  question: string;
  description?: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  endDate: string;
  category?: string;
  image?: string;
  icon?: string;
  creator?: string;
  createdAt: string;
  updatedAt: string;
  // Additional Polkamarkets-specific fields
  marketType?: 'binary' | 'categorical' | 'scalar';
  resolutionSource?: string;
  tags?: string[];
  featured?: boolean;
  verified?: boolean;
}

export class PolkamarketsApiService {
  private apiClient;

  constructor(apiKey?: string) {
    // For now, we'll use a mock approach since Polkamarkets doesn't seem to have a public REST API
    // In the future, this could be updated to use their SDK or any discovered endpoints
    this.apiClient = createApiClient(
      '/api/polkamarkets', // We'll create a proxy route
      {
        apiKey,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        timeout: 15000,
      }
    );
  }

  // Fetch all active markets
  async getActiveMarkets(limit: number = 150, offset: number = 0): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching active markets, limit:', limit, 'offset:', offset);
      
      // Fetch from our enhanced Polkamarkets API route with 200 markets
      const markets = await this.apiClient.get<any[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          offset,
        },
      });
      
      console.log('🔍 PolkamarketsAPI: Fetched markets from API, count:', markets.length);
      
      // Transform the API data to match PredictionMarket format
      // The API already returns most fields we need, we just need to ensure proper field mapping
      const transformedMarkets = markets.map((market: any) => ({
        id: market.id,
        question: market.question,
        title: market.question,
        description: market.description || '',
        platform: 'polkamarkets' as const,
        status: (market.closed ? 'resolved' : market.active ? 'active' : 'pending') as 'active' | 'pending' | 'resolved' | 'cancelled',
        category: market.category || 'General',
        yesPrice: Array.isArray(market.outcomePrices) ? market.outcomePrices[0] : 0.5,
        noPrice: Array.isArray(market.outcomePrices) ? market.outcomePrices[1] : 0.5,
        totalVolume: market.volume || 0,
        liquidity: market.liquidity || 0,
        endDate: market.endDate ? new Date(market.endDate) : new Date(),
        active: market.active !== false,
        resolved: market.closed || false,
        createdAt: market.createdAt ? new Date(market.createdAt) : new Date(),
        updatedAt: market.updatedAt ? new Date(market.updatedAt) : new Date(),
      }));
      
      console.log('🔍 PolkamarketsAPI: Transformed markets count:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error('Error fetching Polkamarkets active markets:', error);
      // Return empty array instead of throwing during build
      return [];
    }
  }

  // Get market by ID
  async getMarketById(marketId: string): Promise<PredictionMarket | null> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching market by ID:', marketId);
      
      // Mock implementation
      const mockMarkets = this.getMockMarkets();
      const market = mockMarkets.find(m => m.id === marketId);
      
      if (!market) {
        console.log('🔍 PolkamarketsAPI: Market not found:', marketId);
        return null;
      }
      
      const transformedMarket = this.transformMarketData(market);
      console.log('🔍 PolkamarketsAPI: Market found and transformed:', transformedMarket?.id);
      return transformedMarket;
    } catch (error) {
      console.error('Error fetching Polkamarkets market by ID:', error);
      throw error;
    }
  }

  // Get market statistics
  async getMarketStats(): Promise<{
    totalMarkets: number;
    activeMarkets: number;
    totalVolume: number;
    totalLiquidity: number;
  }> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching market stats');
      
      const mockMarkets = this.getMockMarkets();
      const activeMarkets = mockMarkets.filter(m => m.active && !m.closed);
      const totalVolume = mockMarkets.reduce((sum, m) => sum + m.volume, 0);
      const totalLiquidity = mockMarkets.reduce((sum, m) => sum + m.liquidity, 0);
      
      const stats = {
        totalMarkets: mockMarkets.length,
        activeMarkets: activeMarkets.length,
        totalVolume,
        totalLiquidity,
      };
      
      console.log('🔍 PolkamarketsAPI: Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching Polkamarkets market stats:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching categories');
      
      const mockMarkets = this.getMockMarkets();
      const categories = [...new Set(mockMarkets.map(m => m.category).filter(Boolean))] as string[];
      
      console.log('🔍 PolkamarketsAPI: Categories found:', categories);
      return categories;
    } catch (error) {
      console.error('Error fetching Polkamarkets categories:', error);
      throw error;
    }
  }

  // Search markets
  async searchMarkets(query: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsAPI: Searching markets with query:', query);
      
      const mockMarkets = this.getMockMarkets();
      const filteredMarkets = mockMarkets.filter(market => 
        market.question.toLowerCase().includes(query.toLowerCase()) ||
        market.description?.toLowerCase().includes(query.toLowerCase()) ||
        market.category?.toLowerCase().includes(query.toLowerCase())
      );
      
      const transformedMarkets = filteredMarkets
        .slice(0, limit)
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 PolkamarketsAPI: Search results count:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error('Error searching Polkamarkets markets:', error);
      throw error;
    }
  }

  // Get markets by category
  async getMarketsByCategory(category: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching markets by category:', category);
      
      const mockMarkets = this.getMockMarkets();
      const filteredMarkets = mockMarkets.filter(market => 
        market.category?.toLowerCase() === category.toLowerCase()
      );
      
      const transformedMarkets = filteredMarkets
        .slice(0, limit)
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 PolkamarketsAPI: Category results count:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error('Error fetching Polkamarkets markets by category:', error);
      throw error;
    }
  }

  // Get price history for a market (if available)
  async getPriceHistory(marketId: string, days: number = 30): Promise<any[]> {
    try {
      console.log('🔍 PolkamarketsAPI: Fetching price history for market:', marketId);
      
      const response = await this.apiClient.get('', {
        params: {
          endpoint: `price-history`,
          marketId,
          days,
        },
      });
      
      console.log('🔍 PolkamarketsAPI: Price history fetched, data points:', Array.isArray(response) ? response.length : 'not array');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching price history for market ${marketId}:`, error);
      return [];
    }
  }

  // Transform Polkamarkets market data to our PredictionMarket format
  private transformMarketData(marketData: PolkamarketsMarket): PredictionMarket | null {
    try {
      console.log('🔍 TransformMarketData: Processing Polkamarkets market:', marketData.id, marketData.question);
      
      // Determine status
      let status: 'active' | 'pending' | 'resolved' | 'cancelled' = 'active';
      if (marketData.closed) {
        status = 'resolved';
      } else if (!marketData.active) {
        status = 'cancelled';
      }
      
      console.log('🔍 TransformMarketData: Status determined as:', status);
      
      // Parse outcomes and prices
      const outcomes = marketData.outcomes || [];
      const outcomePrices = marketData.outcomePrices || [];
      
      // Calculate yes/no prices for binary markets
      let yesPrice = 0;
      let noPrice = 0;
      
      if (outcomes.length >= 2 && outcomePrices.length >= 2) {
        yesPrice = outcomePrices[0] || 0;
        noPrice = outcomePrices[1] || 0;
      }
      
      const transformedMarket: PredictionMarket = {
        id: marketData.id,
        title: marketData.question,
        description: marketData.description || '',
        platform: 'other',
        status,
        category: marketData.category || 'General',
        yesPrice,
        noPrice,
        totalVolume: marketData.volume,
        liquidity: marketData.liquidity,
        endDate: marketData.endDate ? new Date(marketData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
        createdAt: marketData.createdAt ? new Date(marketData.createdAt) : new Date(),
        updatedAt: marketData.updatedAt ? new Date(marketData.updatedAt) : new Date(),
      };
      
      console.log('🔍 TransformMarketData: Successfully transformed Polkamarkets market:', transformedMarket.id, transformedMarket.title);
      return transformedMarket;
    } catch (error) {
      console.error('Error transforming Polkamarkets data:', error, marketData);
      return null;
    }
  }

  // Mock data for testing - replace with actual API calls when available
  private getMockMarkets(): PolkamarketsMarket[] {
    return [
      {
        id: 'polkamarkets-1',
        question: 'Will Bitcoin reach $100,000 by end of 2024?',
        description: 'This market will resolve to Yes if Bitcoin reaches $100,000 USD by December 31, 2024, according to CoinGecko.',
        outcomes: ['Yes', 'No'],
        outcomePrices: [0.35, 0.65],
        volume: 125000,
        liquidity: 45000,
        active: true,
        closed: false,
        endDate: '2024-12-31T23:59:59Z',
        category: 'Crypto',
        image: 'https://polkamarkets.com/images/btc-market.png',
        icon: 'https://polkamarkets.com/images/btc-icon.png',
        creator: 'polkamarkets-team',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        marketType: 'binary',
        resolutionSource: 'coingecko.com',
        tags: ['bitcoin', 'crypto', 'price-prediction'],
        featured: true,
        verified: true,
      },
      {
        id: 'polkamarkets-2',
        question: 'Will Ethereum 2.0 be fully implemented by Q2 2024?',
        description: 'This market resolves based on whether Ethereum 2.0 is fully implemented and operational by June 30, 2024.',
        outcomes: ['Yes', 'No'],
        outcomePrices: [0.75, 0.25],
        volume: 89000,
        liquidity: 32000,
        active: true,
        closed: false,
        endDate: '2024-06-30T23:59:59Z',
        category: 'Crypto',
        image: 'https://polkamarkets.com/images/eth-market.png',
        icon: 'https://polkamarkets.com/images/eth-icon.png',
        creator: 'polkamarkets-team',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z',
        marketType: 'binary',
        resolutionSource: 'ethereum.org',
        tags: ['ethereum', 'crypto', 'technology'],
        featured: false,
        verified: true,
      },
      {
        id: 'polkamarkets-3',
        question: 'Will the US Federal Reserve cut interest rates in 2024?',
        description: 'This market resolves based on whether the Federal Reserve cuts the federal funds rate at least once during 2024.',
        outcomes: ['Yes', 'No'],
        outcomePrices: [0.60, 0.40],
        volume: 156000,
        liquidity: 58000,
        active: true,
        closed: false,
        endDate: '2024-12-31T23:59:59Z',
        category: 'Economics',
        image: 'https://polkamarkets.com/images/fed-market.png',
        icon: 'https://polkamarkets.com/images/fed-icon.png',
        creator: 'polkamarkets-team',
        createdAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-05T09:15:00Z',
        marketType: 'binary',
        resolutionSource: 'federalreserve.gov',
        tags: ['federal-reserve', 'interest-rates', 'economics'],
        featured: true,
        verified: true,
      },
      {
        id: 'polkamarkets-4',
        question: 'Will Tesla stock reach $300 by end of Q1 2024?',
        description: 'This market resolves based on whether Tesla stock (TSLA) reaches $300 per share by March 31, 2024.',
        outcomes: ['Yes', 'No'],
        outcomePrices: [0.45, 0.55],
        volume: 98000,
        liquidity: 36000,
        active: true,
        closed: false,
        endDate: '2024-03-31T23:59:59Z',
        category: 'Stocks',
        image: 'https://polkamarkets.com/images/tesla-market.png',
        icon: 'https://polkamarkets.com/images/tesla-icon.png',
        creator: 'polkamarkets-team',
        createdAt: '2024-01-12T11:20:00Z',
        updatedAt: '2024-01-12T11:20:00Z',
        marketType: 'binary',
        resolutionSource: 'yahoo.com',
        tags: ['tesla', 'stocks', 'elon-musk'],
        featured: false,
        verified: true,
      },
      {
        id: 'polkamarkets-5',
        question: 'Will there be a major AI breakthrough in 2024?',
        description: 'This market resolves based on whether there is a significant AI breakthrough announced in 2024 that receives widespread recognition.',
        outcomes: ['Yes', 'No'],
        outcomePrices: [0.70, 0.30],
        volume: 112000,
        liquidity: 41000,
        active: true,
        closed: false,
        endDate: '2024-12-31T23:59:59Z',
        category: 'Technology',
        image: 'https://polkamarkets.com/images/ai-market.png',
        icon: 'https://polkamarkets.com/images/ai-icon.png',
        creator: 'polkamarkets-team',
        createdAt: '2024-01-08T16:45:00Z',
        updatedAt: '2024-01-08T16:45:00Z',
        marketType: 'binary',
        resolutionSource: 'multiple-sources',
        tags: ['artificial-intelligence', 'technology', 'breakthrough'],
        featured: true,
        verified: true,
      },
    ];
  }
}

export const polkamarketsApi = new PolkamarketsApiService();

