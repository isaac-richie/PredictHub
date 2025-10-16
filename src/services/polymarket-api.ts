import { createApiClient } from '@/lib/api-client';
import { PolymarketMarket, PolymarketCategory } from '@/types/polymarket-detailed';
import { PredictionMarket, MarketStats } from '@/types/prediction-market';

export class PolymarketApiService {
  private apiClient;

  constructor(apiKey?: string) {
    // Always use Next.js API proxy route for consistency
    this.apiClient = createApiClient(
      '/api/polymarket',
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
      console.log('🔍 PolymarketAPI: Fetching active markets, limit:', limit, 'offset:', offset);
      
      const response = await this.apiClient.get<PolymarketMarket[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          offset,
          active: true,
          archived: false,
        },
      });

      console.log('🔍 PolymarketAPI: Raw response received, markets count:', response.length);
      
      const transformedMarkets = response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
      
      console.log('🔍 PolymarketAPI: Transformed markets count:', transformedMarkets.length);
      return transformedMarkets;
    } catch (error) {
      console.error('Error fetching Polymarket active markets:', error);
      throw error;
    }
  }

  // Fetch market by ID
  async getMarketById(marketId: string): Promise<PredictionMarket | null> {
    try {
      const response = await this.apiClient.get<PolymarketMarket>('', {
        params: {
          endpoint: `markets/${marketId}`,
        },
      });
      return this.transformMarketData(response);
    } catch (error) {
      console.error(`Error fetching Polymarket market ${marketId}:`, error);
      return null;
    }
  }

  // Fetch market statistics
  async getMarketStats(): Promise<MarketStats> {
    try {
      const marketsResponse = await this.apiClient.get<PolymarketMarket[]>('', {
        params: { 
          endpoint: 'markets',
          limit: 1000 // Get a large sample for stats
        }
      });

      const activeMarkets = marketsResponse.filter(m => m.active && !m.archived);
      const resolvedMarkets = marketsResponse.filter(m => m.closed && !m.archived);

      // Calculate category statistics
      const categoryStats = activeMarkets.reduce((acc, market) => {
        const category = market.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, volume: 0 };
        }
        acc[category].count++;
        acc[category].volume += market.volumeNum || 0;
        return acc;
      }, {} as Record<string, { count: number; volume: number }>);

      const topCategories = Object.entries(categoryStats)
        .map(([category, stats]) => ({ 
          category, 
          count: stats.count, 
          volume: stats.volume 
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);

      // Calculate total volumes
      const totalVolume24h = activeMarkets.reduce((sum, m) => sum + (m.volume24hr || 0), 0);
      const totalVolume7d = activeMarkets.reduce((sum, m) => sum + (m.volume1wk || 0), 0);
      const averageLiquidity = activeMarkets.reduce((sum, m) => sum + (m.liquidityNum || 0), 0) / activeMarkets.length;

      return {
        totalMarkets: marketsResponse.length,
        totalVolume24h,
        totalVolume7d,
        activeMarkets: activeMarkets.length,
        resolvedMarkets: resolvedMarkets.length,
        averageLiquidity: averageLiquidity || 0,
        topCategories,
      };
    } catch (error) {
      console.error('Error fetching Polymarket stats:', error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<PolymarketCategory[]> {
    try {
      const response = await this.apiClient.get<PolymarketCategory[]>('', {
        params: {
          endpoint: 'categories',
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching Polymarket categories:', error);
      throw error;
    }
  }

  // Search markets
  async searchMarkets(query: string, limit: number = 20): Promise<PredictionMarket[]> {
    try {
      const response = await this.apiClient.get<any[]>('', {
        params: {
          endpoint: 'markets/search',
          q: query,
          limit,
          active: true,
        },
      });

      return response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
    } catch (error) {
      console.error('Error searching Polymarket markets:', error);
      throw error;
    }
  }

  // Get markets by category
  async getMarketsByCategory(category: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      const response = await this.apiClient.get<any[]>('', {
        params: {
          endpoint: 'markets',
          category,
          limit,
          active: true,
        },
      });

      return response
        .map(market => this.transformMarketData(market))
        .filter(Boolean) as PredictionMarket[];
    } catch (error) {
      console.error(`Error fetching Polymarket markets for category ${category}:`, error);
      throw error;
    }
  }

  // Extract category from market data
  private extractCategory(marketData: PolymarketMarket): string {
    // If there's an explicit category, use it
    if (marketData.category) {
      return marketData.category;
    }

    // Extract from question/title using keywords
    const question = (marketData.question || '').toLowerCase();
    
    // Politics & Current Affairs
    if (question.match(/trump|biden|election|president|congress|senate|white house|political|politics|vote|democrat|republican|governor|mayor|immigration|deport/i)) {
      return 'Politics';
    }
    
    // Crypto & Finance
    if (question.match(/bitcoin|btc|ethereum|eth|crypto|blockchain|defi|nft|solana|ada|cardano|polygon|matic|usdt|tether|usdc|binance/i)) {
      return 'Crypto';
    }
    
    // Economics & Markets
    if (question.match(/recession|gdp|inflation|federal reserve|fed|interest rate|stock|market cap|economy|nasdaq|s&p|dow jones|treasury|bond|gold|commodities/i)) {
      return 'Economics';
    }
    
    // Technology
    if (question.match(/ai |artificial intelligence|chatgpt|openai|google|meta|microsoft|apple|nvidia|amd|tesla|spacex|tech|software|hardware|chip|semiconductor|gemini|deepseek/i)) {
      return 'Technology';
    }
    
    // Sports
    if (question.match(/nba|nfl|soccer|football|baseball|basketball|hockey|olympics|championship|match|game|sport|player|team|super bowl/i)) {
      return 'Sports';
    }
    
    // Entertainment & Pop Culture
    if (question.match(/movie|film|oscar|grammy|emmy|music|album|song|celebrity|actor|actress|director|box office|streaming|netflix|disney|avatar|wicked|marvel|dc/i)) {
      return 'Entertainment';
    }
    
    // Science & Health
    if (question.match(/pandemic|covid|virus|vaccine|disease|health|medical|science|research|climate|weather|hurricane|earthquake/i)) {
      return 'Science';
    }
    
    // Business & Companies
    if (question.match(/ceo|company|corporation|business|startup|ipo|merger|acquisition|earnings|revenue|profit|amazon|walmart|microstrategy/i)) {
      return 'Business';
    }

    // Space & Astronomy
    if (question.match(/spacex|rocket|launch|satellite|mars|moon|nasa|space|starship/i)) {
      return 'Space';
    }

    // Default category
    return 'Other';
  }

  // Transform Polymarket data to our unified format
  private transformMarketData(marketData: PolymarketMarket): PredictionMarket | null {
    try {
      console.log('🔍 TransformMarketData: Processing market:', marketData.id, marketData.question);
      
      const endDate = new Date(marketData.endDate);
      const now = new Date();
      
      // Determine status
      let status: 'active' | 'resolved' | 'cancelled' | 'pending' = 'pending';
      if (marketData.closed) {
        status = 'resolved';
      } else if (marketData.archived) {
        status = 'cancelled';
      } else if (marketData.active && endDate > now) {
        status = 'active';
      }
      
      console.log('🔍 TransformMarketData: Status determined as:', status);

      // Parse outcome prices from JSON strings
      let outcomePrices: number[] = [];
      
      try {
        outcomePrices = JSON.parse(marketData.outcomePrices || '[0, 0]').map((p: string) => parseFloat(p));
      } catch (e) {
        console.warn('Failed to parse prices:', e);
        outcomePrices = [0, 0];
      }

      // Extract prices (assuming binary market with Yes/No outcomes)
      const yesPrice = outcomePrices[0] || 0;
      const noPrice = outcomePrices[1] || (1 - yesPrice);

      // Extract category
      const category = this.extractCategory(marketData);

      const transformedMarket = {
        id: `polymarket_${marketData.id}`,
        conditionId: marketData.conditionId || marketData.id, // Store conditionId for price history API
        platform: 'polymarket' as const,
        title: marketData.question,
        description: marketData.description,
        category,
        endDate,
        createdAt: new Date(marketData.createdAt),
        updatedAt: new Date(marketData.updatedAt),
        totalVolume: marketData.volumeNum || 0,
        liquidity: marketData.liquidityNum || 0,
        participantCount: undefined, // Not available in current API
        yesPrice,
        noPrice,
        status,
        resolution: (marketData.closed ? 'yes' : 'pending') as 'yes' | 'no' | 'pending',
        tags: [category], // Use extracted category as tag
        imageUrl: marketData.image,
        externalUrl: `https://polymarket.com/market/${marketData.slug}`,
        slug: marketData.slug, // Store slug for direct URL construction
        question: marketData.question, // Store question for display
        volumeNum: marketData.volumeNum || 0, // Numeric volume for calculations
        liquidityNum: marketData.liquidityNum || 0, // Numeric liquidity for calculations
        
        // Additional Polymarket-specific fields
        volume24hr: marketData.volume24hr || 0,
        volume1wk: marketData.volume1wk || 0,
        volume1mo: marketData.volume1mo || 0,
        volume1yr: marketData.volume1yr || 0,
        liquidityAmm: typeof marketData.liquidity === 'number' ? marketData.liquidity : 0,
        liquidityClob: typeof marketData.liquidity === 'number' ? marketData.liquidity : 0,
        bestBid: marketData.bestBid || 0,
        bestAsk: marketData.bestAsk || 0,
        spread: marketData.spread || 0,
        lastTradePrice: marketData.lastTradePrice || 0,
        oneHourPriceChange: marketData.oneHourPriceChange || 0,
        oneDayPriceChange: marketData.oneDayPriceChange || 0,
        oneWeekPriceChange: marketData.oneWeekPriceChange || 0,
        oneMonthPriceChange: marketData.oneMonthPriceChange || 0,
        oneYearPriceChange: marketData.oneYearPriceChange || 0,
        competitive: marketData.competitive || 0,
        cyom: marketData.cyom || false,
        feesEnabled: marketData.feesEnabled || false,
        rfqEnabled: marketData.rfqEnabled || false,
        holdingRewardsEnabled: marketData.holdingRewardsEnabled || false,
        marketType: marketData.marketType || 'binary',
        active: marketData.active || false,
        closed: marketData.closed || false,
        archived: marketData.archived || false,
        restricted: marketData.restricted || false,
        featured: false,
        pendingDeployment: marketData.pendingDeployment || false,
        deploying: marketData.deploying || false,
        fpmmLive: marketData.fpmmLive || false,
        approved: marketData.approved || false,
        ready: marketData.ready || false,
        funded: marketData.funded || false,
      };
      
      console.log('🔍 TransformMarketData: Successfully transformed market:', transformedMarket.id, transformedMarket.title);
      return transformedMarket;
    } catch (error) {
      console.error('Error transforming Polymarket data:', error, marketData);
      return null;
    }
  }

  // Get price history for a market (if available)
  async getPriceHistory(marketId: string, days: number = 30): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>('', {
        params: {
          endpoint: `markets/${marketId}/price-history`,
          days,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error fetching price history for market ${marketId}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const polymarketApi = new PolymarketApiService();
