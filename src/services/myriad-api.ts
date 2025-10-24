import { createApiClient } from '@/lib/api-client';
import { PredictionMarket, MarketStats } from '@/types/prediction-market';
import { MyriadMarket, MyriadMarketDetailed, MyriadPriceHistory, MyriadMarketStats } from '@/types/myriad-detailed';

const MYRIAD_API_BASE_URL = process.env.NEXT_PUBLIC_MYRIAD_API || 'https://api.myriad.social';

export class MyriadApiService {
  private apiClient;

  constructor(apiKey?: string) {
    // Always use the internal proxy route since the external API doesn't exist
    const baseUrl = '/api/myriad';
    
    this.apiClient = createApiClient(
      baseUrl,
      {
        apiKey,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        timeout: 15000,
      }
    );
  }

  // Fetch all active markets
  async getActiveMarkets(limit: number = 250, offset: number = 0, timeframe: string = 'all'): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 MyriadAPI: Fetching active markets, limit:', limit, 'offset:', offset, 'timeframe:', timeframe);
      
      // Check if we're on the server side - if so, generate mock data directly
      if (typeof window === 'undefined') {
        console.log('🔍 MyriadAPI: Server-side call, generating mock data directly');
        return this.generateMockMarkets(limit, offset, timeframe);
      }
      
      // Client-side: use the proxy route
      const response = await this.apiClient.get<MyriadMarket[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          offset,
          timeframe,
          active: true,
          closed: false,
        },
      });

      console.log('🔍 MyriadAPI: Raw response received, markets count:', response.length);
      
      const transformedMarkets = response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 MyriadAPI: Transformed markets count:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error('Error fetching Myriad active markets:', error);
      throw error;
    }
  }

  // Generate mock markets data directly for server-side calls
  private generateMockMarkets(limit: number, offset: number, timeframe: string): PredictionMarket[] {
    console.log('🔍 MyriadAPI: Generating mock markets, limit:', limit, 'offset:', offset, 'timeframe:', timeframe);
    
    const categories = ['Crypto', 'Sports', 'Politics', 'Economy', 'Gaming', 'Culture', 'Sentiment'];
    const markets: PredictionMarket[] = [];
    
    // Enhanced market count based on timeframe and limit
    const requestedLimit = Math.max(limit, 50);
    let marketCount = Math.min(requestedLimit * 2, 500); // Generate 2x the requested limit, max 500
    
    switch (timeframe) {
      case '24h':
        marketCount = Math.min(requestedLimit * 2.5, 400); // More recent/trending markets
        break;
      case '7d':
        marketCount = Math.min(requestedLimit * 2.2, 450);
        break;
      case '30d':
        marketCount = Math.min(requestedLimit * 2.8, 500);
        break;
      case 'future':
        marketCount = Math.min(requestedLimit * 2.3, 450); // Future predictions
        break;
      case 'trending':
        marketCount = Math.min(requestedLimit * 2.0, 350); // High-volume trending
        break;
      default:
        marketCount = Math.min(requestedLimit * 2.5, 500);
    }

    // Apply offset
    const startIndex = offset + 1;
    const endIndex = startIndex + marketCount;

    for (let i = startIndex; i <= endIndex; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const basePrice = 0.3 + Math.random() * 0.4;
      
      const marketQuestions = {
        Crypto: [
          "Will Bitcoin reach $100,000 by end of 2025?",
          "Will Ethereum reach $5,000 by Q2 2025?",
          "Will Solana reach $200 by end of 2025?",
          "Will Cardano reach $2 by Q3 2025?",
          "Will Polygon reach $3 by end of 2025?",
          "Will Chainlink reach $50 by Q2 2025?",
          "Will Avalanche reach $100 by end of 2025?",
          "Will Polkadot reach $30 by Q3 2025?",
        ],
        Sports: [
          "Will Manchester City win the Premier League 2025?",
          "Will Real Madrid win the Champions League 2025?",
          "Will the Lakers win the NBA Championship 2025?",
          "Will Tom Brady come out of retirement in 2025?",
          "Will Novak Djokovic win Wimbledon 2025?",
          "Will the Patriots make the playoffs in 2025?",
          "Will LeBron James retire in 2025?",
          "Will the World Cup be held in 2025?",
        ],
        Politics: [
          "Will Trump be re-elected in 2024?",
          "Will there be a new Prime Minister in the UK in 2025?",
          "Will there be a recession in the US in 2025?",
          "Will China invade Taiwan in 2025?",
          "Will there be a major war in 2025?",
          "Will the EU expand in 2025?",
          "Will there be a new world order in 2025?",
          "Will climate change be declared a national emergency?",
        ],
        Economy: [
          "Will the Fed cut rates in 2025?",
          "Will there be a housing market crash in 2025?",
          "Will inflation drop below 2% in 2025?",
          "Will the stock market reach new highs in 2025?",
          "Will unemployment rise above 5% in 2025?",
          "Will there be a global recession in 2025?",
          "Will the dollar weaken significantly in 2025?",
          "Will there be a major bank failure in 2025?",
        ],
        Gaming: [
          "Will GTA 6 be released in 2025?",
          "Will Nintendo release a new console in 2025?",
          "Will VR gaming become mainstream in 2025?",
          "Will esports viewership exceed traditional sports?",
          "Will AI replace human game developers?",
          "Will mobile gaming revenue exceed console gaming?",
          "Will there be a major gaming acquisition in 2025?",
          "Will blockchain gaming become popular in 2025?",
        ],
        Culture: [
          "Will Taylor Swift win another Grammy in 2025?",
          "Will there be a major movie franchise reboot in 2025?",
          "Will social media usage decline in 2025?",
          "Will there be a new streaming service launched in 2025?",
          "Will virtual concerts become the norm in 2025?",
          "Will there be a major celebrity scandal in 2025?",
          "Will AI-generated content become mainstream?",
          "Will there be a new viral dance trend in 2025?",
        ],
        Sentiment: [
          "Will people be more optimistic about the future in 2025?",
          "Will social media make people happier in 2025?",
          "Will remote work become permanent?",
          "Will people travel more in 2025?",
          "Will mental health awareness increase in 2025?",
          "Will people read more books in 2025?",
          "Will there be more community engagement in 2025?",
          "Will people be more environmentally conscious?",
        ]
      };

      const questions = marketQuestions[category as keyof typeof marketQuestions];
      const question = questions[Math.floor(Math.random() * questions.length)];
      
      // Generate realistic market data
      const volume = Math.random() * 1000000 + 10000;
      const liquidity = Math.random() * 100000 + 1000;
      const yesPrice = basePrice + (Math.random() - 0.5) * 0.1;
      const noPrice = 1 - yesPrice;
      
      const market: PredictionMarket = {
        id: `myriad_${i}`,
        platform: 'myriad',
        title: question,
        question: question,
        description: `This market will resolve based on the outcome of the question: ${question}`,
        category: category,
        active: true,
        startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        endDate: this.generateEndDateBasedOnTimeframe(timeframe),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        outcomes: ['Yes', 'No'],
        outcomePrices: [String(yesPrice), String(noPrice)],
        yesPrice,
        noPrice,
        volume: volume,
        liquidity: liquidity,
        totalVolume: volume,
        externalUrl: `https://myriad.social/market/${i}`,
        slug: `myriad-market-${i}`,
        volumeNum: volume,
        liquidityNum: liquidity,
      };

      markets.push(market);
    }

    console.log('🔍 MyriadAPI: Generated', markets.length, 'mock markets');
    return markets;
  }

  // Generate end date based on timeframe
  private generateEndDateBasedOnTimeframe(timeframe: string): Date {
    const now = Date.now();
    
    switch (timeframe) {
      case '24h':
        // Markets closing within 24 hours or recently started
        return new Date(now + Math.random() * 24 * 60 * 60 * 1000);
      case '7d':
        // Markets closing within 7 days
        return new Date(now + Math.random() * 7 * 24 * 60 * 60 * 1000);
      case '30d':
        // Markets closing within 30 days
        return new Date(now + Math.random() * 30 * 24 * 60 * 60 * 1000);
      case 'future':
        // Future predictions (1-6 months out)
        return new Date(now + (30 + Math.random() * 150) * 24 * 60 * 60 * 1000);
      case 'trending':
        // Mix of short-term and medium-term trending markets
        const days = Math.random() < 0.3 ? Math.random() * 7 : Math.random() * 90;
        return new Date(now + days * 24 * 60 * 60 * 1000);
      default:
        // General mix of all timeframes
        return new Date(now + Math.random() * 365 * 24 * 60 * 60 * 1000);
    }
  }

  // Fetch market by ID
  async getMarketById(marketId: string): Promise<PredictionMarket | null> {
    try {
      const actualMarketId = marketId.replace(/^myriad_/, '');
      const marketResponse = await this.apiClient.get<MyriadMarket[]>('', {
        params: {
          endpoint: `markets/${actualMarketId}`,
        },
      });

      if (marketResponse && marketResponse.length > 0) {
        console.log(`🔍 MyriadAPI: Fetched market by ID: ${marketId}`);
        return this.transformMarketData(marketResponse[0]);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching Myriad market by ID ${marketId}:`, error);
      throw error;
    }
  }

  // Search markets
  async searchMarkets(query: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 MyriadAPI: Searching markets with query:', query, 'limit:', limit);
      
      // Always use the proxy route since we're using mock data
      const response = await this.apiClient.get<MyriadMarket[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          search: query,
          active: true,
          closed: false,
        },
      });

      const transformedMarkets = response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 MyriadAPI: Search results:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error(`Error searching Myriad markets with query ${query}:`, error);
      return [];
    }
  }

  // Fetch markets by category
  async getMarketsByCategory(category: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 MyriadAPI: Fetching markets by category:', category, 'limit:', limit);
      
      // Always use the proxy route since we're using mock data
      const response = await this.apiClient.get<MyriadMarket[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          category,
          active: true,
          closed: false,
        },
      });

      const transformedMarkets = response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 MyriadAPI: Transformed markets by category:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error(`Error fetching Myriad markets by category ${category}:`, error);
      return [];
    }
  }

  // Fetch market statistics
  async getMarketStats(): Promise<MarketStats> {
    try {
      const statsResponse = await this.apiClient.get<MyriadMarketStats>('stats');

      return {
        totalMarkets: statsResponse.totalMarkets,
        totalVolume24h: statsResponse.totalVolume,
        totalVolume7d: statsResponse.totalVolume * 0.7, // Estimate
        activeMarkets: statsResponse.activeMarkets,
        resolvedMarkets: statsResponse.totalMarkets - statsResponse.activeMarkets,
        averageLiquidity: statsResponse.averageLiquidity,
        topCategories: statsResponse.topCategories.map(cat => ({
          category: cat.category,
          count: cat.count,
          volume: cat.volume,
        })),
      };
    } catch (error) {
      console.error('Error fetching Myriad stats:', error);
      throw error;
    }
  }

  // Fetch detailed market data
  async getDetailedMarketData(marketId: string): Promise<MyriadMarketDetailed | null> {
    try {
      const actualMarketId = marketId.replace(/^myriad_/, '');
      const market = await this.getMarketById(marketId);
      if (!market) return null;

      // Fetch additional detailed data
      const [priceHistory, orderBook, recentTrades] = await Promise.all([
        this.getPriceHistory(marketId),
        this.getOrderBook(marketId),
        this.getRecentTrades(marketId),
      ]);

      return {
        ...market,
        priceHistory: priceHistory.map(ph => ({
          timestamp: ph.timestamp,
          price: ph.price,
          volume: ph.volume,
        })),
        orderBook,
        recentTrades,
        marketStats: {
          totalTrades: Math.floor(Math.random() * 1000) + 100,
          uniqueTraders: Math.floor(Math.random() * 500) + 50,
          avgTradeSize: market.totalVolume / 100,
          volatility: Math.random() * 0.3 + 0.1,
        },
        resolution: {
          status: 'pending',
          resolutionSource: market.description,
          resolutionCriteria: market.question,
        },
        volume: market.totalVolume, // Add missing volume field
        outcomePrices: market.outcomePrices || [0.5, 0.5], // Ensure outcomePrices is number[]
      } as unknown as MyriadMarketDetailed;
    } catch (error) {
      console.error(`Error fetching detailed Myriad market data for ${marketId}:`, error);
      throw error;
    }
  }

  // Fetch price history for a market
  async getPriceHistory(marketId: string, timeRange: string = '24h', limit: number = 500): Promise<MyriadPriceHistory[]> {
    try {
      const actualMarketId = marketId.replace(/^myriad_/, '');
      const isExternalAPI = typeof window === 'undefined';
      const endpoint = isExternalAPI ? `markets/${actualMarketId}/price-history` : '';

      const response = await this.apiClient.get<MyriadPriceHistory[]>(endpoint, {
        params: isExternalAPI ? {
          timeRange,
          limit,
        } : {
          endpoint: 'price-history',
          marketId: actualMarketId,
          timeRange,
          limit,
        },
      });

      return response;
    } catch (error) {
      console.error(`Error fetching Myriad price history for ${marketId}:`, error);
      return [];
    }
  }

  // Get order book for a market
  private async getOrderBook(marketId: string): Promise<any> {
    try {
      const actualMarketId = marketId.replace(/^myriad_/, '');
      const isExternalAPI = typeof window === 'undefined';
      const endpoint = isExternalAPI ? `markets/${actualMarketId}/orderbook` : '';

      const response = await this.apiClient.get<any>(endpoint, {
        params: isExternalAPI ? {} : {
          endpoint: 'orderbook',
          marketId: actualMarketId,
        },
      });

      return response;
    } catch (error) {
      console.error(`Error fetching Myriad order book for ${marketId}:`, error);
      return {
        bids: [],
        asks: [],
      };
    }
  }

  // Get recent trades for a market
  private async getRecentTrades(marketId: string): Promise<any[]> {
    try {
      const actualMarketId = marketId.replace(/^myriad_/, '');
      const isExternalAPI = typeof window === 'undefined';
      const endpoint = isExternalAPI ? `markets/${actualMarketId}/trades` : '';

      const response = await this.apiClient.get<any[]>(endpoint, {
        params: isExternalAPI ? { limit: 10 } : {
          endpoint: 'trades',
          marketId: actualMarketId,
          limit: 10,
        },
      });

      return response;
    } catch (error) {
      console.error(`Error fetching Myriad recent trades for ${marketId}:`, error);
      return [];
    }
  }

  // Helper to transform raw Myriad market data into our common PredictionMarket type
  private transformMarketData(marketData: MyriadMarket): PredictionMarket {
    // Determine market status
    let status: 'active' | 'resolved' | 'cancelled' | 'pending' = 'pending';
    const now = new Date();
    const endDate = marketData.endDate ? new Date(marketData.endDate) : null;

    if (marketData.closed) {
      status = 'resolved'; // Map 'closed' to 'resolved'
    } else if (endDate && endDate < now) {
      status = 'resolved';
    } else if (marketData.active) {
      status = 'active';
    }

    console.log('🔍 TransformMyriadData: Status determined as:', status);

    // Extract prices (assuming binary market with Yes/No outcomes)
    const yesPrice = marketData.outcomePrices[0] || 0.5;
    const noPrice = marketData.outcomePrices[1] || (1 - yesPrice);

    return {
      id: `myriad_${marketData.id}`,
      platform: 'myriad' as const,
      title: marketData.question,
      description: marketData.description || '',
      category: marketData.category,
      endDate: endDate || new Date(),
      createdAt: new Date(marketData.createdAt),
      updatedAt: new Date(marketData.updatedAt),
      totalVolume: marketData.volume || 0,
      liquidity: marketData.liquidity || 0,
      participantCount: marketData.participants,
      yesPrice,
      noPrice,
      status,
      resolution: (marketData.closed ? 'yes' : 'pending') as 'yes' | 'no' | 'pending',
      tags: marketData.tags || [marketData.category],
      imageUrl: marketData.image,
      externalUrl: `https://myriad.markets/markets/${marketData.id}`,
      slug: marketData.id,
      question: marketData.question,
      volumeNum: marketData.volume || 0,
      liquidityNum: marketData.liquidity || 0,

      // Additional Myriad-specific fields (only include fields that exist in PredictionMarket type)
      featured: marketData.featured,
    };
  }
}

export const myriadApi = new MyriadApiService();
