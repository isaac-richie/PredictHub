import { PredictionMarket, MarketStats } from '@/types/prediction-market';
import { polymarketApi } from './polymarket-api';
import { myriadApi } from './myriad-api';
import { limitlessApi } from './limitlesslabs-api';

export class AggregationService {
  private platforms = [
    { name: 'polymarket', api: polymarketApi },
    { name: 'myriad', api: myriadApi },
    { name: 'limitlesslabs', api: limitlessApi },
  ];


  // Get all markets from all platforms
  async getAllMarkets(limit: number = 500, timeframe: string = 'all'): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 AggregationService: Getting all markets, limit:', limit, 'timeframe:', timeframe);
      console.log('🔍 Available platforms:', this.platforms.map(p => p.name));
      
      const platformPromises = this.platforms.map(platform => 
        platform.api.getActiveMarkets(Math.ceil(limit / this.platforms.length), 0, timeframe)
          .catch(error => {
            console.error(`Error fetching markets from ${platform.name}:`, error);
            // Return empty array on any error to prevent total failure
            return [];
          })
      );

      console.log('🔍 Making API calls to platforms...');
      const results = await Promise.all(platformPromises);
      console.log('🔍 API calls completed, results:', results.map(r => r.length));
      
      const allMarkets = results.flat();
      console.log('🔍 Total markets after flattening:', allMarkets.length);

      // Ensure balanced platform representation by taking top markets from each platform
      const marketsPerPlatform = Math.ceil(limit / this.platforms.length);
      const balancedMarkets: PredictionMarket[] = [];
      
      // Group markets by platform
      const marketsByPlatform = allMarkets.reduce((acc, market) => {
        if (!acc[market.platform]) acc[market.platform] = [];
        acc[market.platform].push(market);
        return acc;
      }, {} as Record<string, PredictionMarket[]>);
      
      // Take top markets from each platform (sorted by volume)
      Object.entries(marketsByPlatform).forEach(([platform, markets]) => {
        const sorted = markets
          .sort((a, b) => (b.volumeNum || b.totalVolume || 0) - (a.volumeNum || a.totalVolume || 0))
          .slice(0, marketsPerPlatform);
        balancedMarkets.push(...sorted);
        console.log(`🔍 ${platform}: ${sorted.length} markets`);
      });
      
      // Sort all balanced markets by volume and limit to requested amount
      const finalMarkets = balancedMarkets
        .sort((a, b) => (b.volumeNum || b.totalVolume || 0) - (a.volumeNum || a.totalVolume || 0))
        .slice(0, limit);
      
      console.log('🔍 Final markets to return:', finalMarkets.length);
      console.log('🔍 Platform distribution:', finalMarkets.reduce((acc, m) => {
        acc[m.platform] = (acc[m.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      return finalMarkets;
    } catch (error) {
      console.error('Error aggregating all markets:', error);
      throw error;
    }
  }

  // Get markets by timeframe (24h, 7d, 30d, future, trending)
  async getMarketsByTimeframe(timeframe: string, limit: number = 200): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 AggregationService: Getting markets by timeframe:', timeframe, 'limit:', limit);
      
      const platformPromises = this.platforms.map(platform => 
        platform.api.getActiveMarkets(Math.ceil(limit / this.platforms.length), 0, timeframe)
          .catch(error => {
            console.error(`Error fetching ${timeframe} markets from ${platform.name}:`, error);
            return [];
          })
      );

      const results = await Promise.all(platformPromises);
      const allMarkets = results.flat();
      
      // Sort based on timeframe
      let sortedMarkets;
      switch (timeframe) {
        case '24h':
          // Sort by recent volume and closing soon
          sortedMarkets = allMarkets
            .sort((a, b) => {
              const aVolume = a.volumeNum || a.totalVolume || 0;
              const bVolume = b.volumeNum || b.totalVolume || 0;
              return bVolume - aVolume;
            });
          break;
        case 'future':
          // Sort by end date (furthest first)
          sortedMarkets = allMarkets
            .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
          break;
        case 'trending':
          // Sort by volume and liquidity
          sortedMarkets = allMarkets
            .sort((a, b) => {
              const aScore = (a.volumeNum || a.totalVolume || 0) + (a.liquidityNum || a.liquidity || 0);
              const bScore = (b.volumeNum || b.totalVolume || 0) + (b.liquidityNum || b.liquidity || 0);
              return bScore - aScore;
            });
          break;
        default:
          // Default sort by volume
          sortedMarkets = allMarkets
            .sort((a, b) => (b.volumeNum || b.totalVolume || 0) - (a.volumeNum || a.totalVolume || 0));
      }
      
      return sortedMarkets.slice(0, limit);
    } catch (error) {
      console.error('Error aggregating markets by timeframe:', error);
      throw error;
    }
  }

  // Get markets by category across all platforms
  async getMarketsByCategory(category: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      const platformPromises = this.platforms.map(platform => 
        platform.api.getMarketsByCategory(category, Math.ceil(limit / this.platforms.length))
          .catch(error => {
            console.error(`Error fetching ${category} markets from ${platform.name}:`, error);
            return [];
          })
      );

      const results = await Promise.all(platformPromises);
      const allMarkets = results.flat();

      return allMarkets
        .sort((a, b) => b.totalVolume - a.totalVolume)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error aggregating markets for category ${category}:`, error);
      throw error;
    }
  }

  // Search markets across all platforms
  async searchMarkets(query: string, limit: number = 30): Promise<PredictionMarket[]> {
    try {
      const platformPromises = this.platforms.map(platform => 
        platform.api.searchMarkets(query, Math.ceil(limit / this.platforms.length))
          .catch(error => {
            console.error(`Error searching ${query} on ${platform.name}:`, error);
            return [];
          })
      );

      const results = await Promise.all(platformPromises);
      const allMarkets = results.flat();

      // Sort by relevance (volume + liquidity) and return top results
      return allMarkets
        .sort((a, b) => (b.totalVolume + b.liquidity) - (a.totalVolume + a.liquidity))
        .slice(0, limit);
    } catch (error) {
      console.error(`Error searching markets for query ${query}:`, error);
      throw error;
    }
  }

  // Get aggregated market statistics
  async getAggregatedStats(): Promise<MarketStats> {
    try {
      const platformPromises = this.platforms.map(platform => 
        platform.api.getMarketStats()
          .catch(error => {
            console.error(`Error fetching stats from ${platform.name}:`, error);
            return {
              totalMarkets: 0,
              totalVolume24h: 0,
              totalVolume7d: 0,
              activeMarkets: 0,
              resolvedMarkets: 0,
              averageLiquidity: 0,
              topCategories: [],
            };
          })
      );

      const results = await Promise.all(platformPromises);

      // Aggregate statistics - handle different stats formats from different APIs
      const aggregatedStats: MarketStats = {
        totalMarkets: results.reduce((sum: number, stats: any) => sum + (stats.totalMarkets || 0), 0),
        totalVolume24h: results.reduce((sum: number, stats: any) => sum + (stats.totalVolume24h || stats.totalVolume || 0), 0),
        totalVolume7d: results.reduce((sum: number, stats: any) => sum + (stats.totalVolume7d || stats.totalVolume || 0), 0),
        activeMarkets: results.reduce((sum: number, stats: any) => sum + (stats.activeMarkets || 0), 0),
        resolvedMarkets: results.reduce((sum: number, stats: any) => sum + (stats.resolvedMarkets || 0), 0),
        averageLiquidity: results.reduce((sum: number, stats: any) => sum + (stats.averageLiquidity || stats.totalLiquidity || 0), 0) / results.length,
        topCategories: this.aggregateTopCategories(results as any[]),
      };

      return aggregatedStats;
    } catch (error) {
      console.error('Error aggregating market statistics:', error);
      throw error;
    }
  }

  // Get trending markets (highest volume in last 24h)
  async getTrendingMarkets(limit: number = 20): Promise<PredictionMarket[]> {
    try {
      const allMarkets = await this.getAllMarkets(200);
      
      // Filter markets with significant volume and sort by volume
      return allMarkets
        .filter(market => market.totalVolume > 1000) // Minimum volume threshold
        .sort((a, b) => b.totalVolume - a.totalVolume)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending markets:', error);
      throw error;
    }
  }

  // Get high liquidity markets
  async getHighLiquidityMarkets(limit: number = 20): Promise<PredictionMarket[]> {
    try {
      const allMarkets = await this.getAllMarkets(200);
      
      return allMarkets
        .filter(market => market.liquidity > 5000) // Minimum liquidity threshold
        .sort((a, b) => b.liquidity - a.liquidity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting high liquidity markets:', error);
      throw error;
    }
  }

  // Get markets ending soon
  async getMarketsEndingSoon(hours: number = 24, limit: number = 20): Promise<PredictionMarket[]> {
    try {
      const allMarkets = await this.getAllMarkets(200);
      const cutoffTime = new Date(Date.now() + hours * 60 * 60 * 1000);
      
      return allMarkets
        .filter(market => market.endDate <= cutoffTime && market.status === 'active')
        .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting markets ending soon:', error);
      throw error;
    }
  }

  // Get market by ID from any platform
  async getMarketById(marketId: string): Promise<PredictionMarket | null> {
    try {
      // Try to determine platform from market ID
      const platform = this.platforms.find(p => marketId.startsWith(`${p.name}_`));
      
      if (platform) {
        const cleanId = marketId.replace(`${platform.name}_`, '');
        return await platform.api.getMarketById(cleanId);
      }

      // If platform not determined, try all platforms
      for (const platform of this.platforms) {
        try {
          const market = await platform.api.getMarketById(marketId);
          if (market) return market;
        } catch {
          // Continue to next platform
        }
      }

      return null;
    } catch (error) {
      console.error(`Error getting market ${marketId}:`, error);
      return null;
    }
  }

  // Helper method to aggregate top categories from all platforms
  private aggregateTopCategories(statsArray: any[]): Array<{category: string, count: number, volume: number}> {
    const categoryMap = new Map<string, {count: number, volume: number}>();

    statsArray.forEach(stats => {
      if (stats.topCategories && Array.isArray(stats.topCategories)) {
        stats.topCategories.forEach((category: any) => {
          const existing = categoryMap.get(category.category) || {count: 0, volume: 0};
          categoryMap.set(category.category, {
            count: existing.count + category.count,
            volume: existing.volume + category.volume,
          });
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category, 
        count: data.count, 
        volume: data.volume
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
  }

  // Get featured markets (shuffled mix from all platforms)
  async getFeaturedMarkets(limit: number = 500): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 AggregationService: Getting featured markets from all platforms, limit:', limit);
      
      // Get markets from all platforms
      const allMarkets = await this.getAllMarkets(limit * 2); // Get more to ensure good mix
      
      // Count markets by platform for verification
      const platformCounts = allMarkets.reduce((acc, market) => {
        acc[market.platform] = (acc[market.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('🔍 Featured Markets: Platform breakdown:', platformCounts);
      
      // Shuffle markets randomly to ensure mix from all platforms
      const shuffledMarkets = allMarkets.sort(() => Math.random() - 0.5);
      
      // Return the requested number of featured markets
      const featuredMarkets = shuffledMarkets.slice(0, limit);
      
      console.log('🔍 Featured Markets: Final count:', featuredMarkets.length);
      console.log('🔍 Featured Markets: Platforms represented:', [...new Set(featuredMarkets.map(m => m.platform))]);
      
      return featuredMarkets;
    } catch (error) {
      console.error('Error getting featured markets:', error);
      throw error;
    }
  }

  // Get platform health status
  async getPlatformHealth(): Promise<Array<{platform: string, status: 'healthy' | 'degraded' | 'down', lastUpdate: Date}>> {
    const healthChecks = this.platforms.map(async (platform) => {
      try {
        await platform.api.getActiveMarkets(1);
        return {
          platform: platform.name,
          status: 'healthy' as const,
          lastUpdate: new Date(),
        };
      } catch {
        return {
          platform: platform.name,
          status: 'down' as const,
          lastUpdate: new Date(),
        };
      }
    });

    return Promise.all(healthChecks);
  }
}

// Export singleton instance
export const aggregationService = new AggregationService();
