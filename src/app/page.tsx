import { aggregationService } from '@/services/aggregation-service';
import HomeClient from '@/components/home-client'; 
import { PredictionMarket } from '@/types/prediction-market';

async function getServerSideMarkets(limit: number = 500) {
  try {
    console.log('🔍 PredictHub: Fetching comprehensive markets from all platforms...', 'limit:', limit);
    
    // Increased limits to ensure LimitlessLabs markets are included
    const baseLimit = Math.max(limit, 150); // Increased from 120 to 150 to get more diversity
    const allMarketsLimit = Math.ceil(baseLimit * 0.6); // Increased from 40% to 60% for all markets (90)
    const trendingLimit = Math.ceil(baseLimit * 0.25); // 25% for trending (30)
    const futureLimit = Math.ceil(baseLimit * 0.2); // 20% for future (24)
    const recentLimit = Math.ceil(baseLimit * 0.15); // 15% for recent/24h (18)
    
    // Simplified approach: Just fetch from one source to avoid timeout issues
    const allMarkets = await aggregationService.getAllMarkets(allMarketsLimit, 'all');
    console.log('🔍 PredictHub: allMarkets received:', allMarkets.length, 'markets');
    console.log('🔍 PredictHub: Platform distribution:', allMarkets.reduce((acc, market) => {
      acc[market.platform] = (acc[market.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    const trendingMarkets: any[] = [];
    const futureMarkets: any[] = [];
    const recentMarkets: any[] = [];
    
    // Combine and deduplicate markets
    const allMarketsMap = new Map();
    
    // Add all markets first
    allMarkets.forEach(market => {
      allMarketsMap.set(market.id, market);
    });
    
    // Add trending markets (may override existing ones)
    trendingMarkets.forEach(market => {
      allMarketsMap.set(market.id, market);
    });
    
    // Add future markets (may override existing ones)
    futureMarkets.forEach(market => {
      allMarketsMap.set(market.id, market);
    });
    
    // Add recent markets (may override existing ones)
    recentMarkets.forEach(market => {
      allMarketsMap.set(market.id, market);
    });
    
    const featuredMarkets = Array.from(allMarketsMap.values());
    
    console.log('🔍 PredictHub: Featured markets ready for display');
    
    // Serialize dates to strings to prevent hydration mismatch
    const serializedMarkets = featuredMarkets.map(market => {
      const safeDate = (date: Date | undefined) => {
        if (!date) return undefined;
        try {
          return date.toISOString();
        } catch {
          return new Date().toISOString(); // Fallback to current date
        }
      };
      
      return {
        ...market,
        endDate: safeDate(market.endDate) || new Date().toISOString(),
        createdAt: safeDate(market.createdAt) || new Date().toISOString(),
        updatedAt: safeDate(market.updatedAt) || new Date().toISOString(),
        startDate: market.startDate ? safeDate(market.startDate) : undefined,
      };
    });
    
    return serializedMarkets as any;
  } catch (error) {
    console.error('Error fetching featured markets:', error);
    return [];
  }
}


export default async function Home() {
  const serverMarkets = await getServerSideMarkets();

  return <HomeClient serverMarkets={serverMarkets} />;
}
