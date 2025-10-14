import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { aggregationService } from '@/services/aggregation-service';

// Query keys for consistent caching
export const queryKeys = {
  allMarkets: ['prediction-markets'] as const,
  marketsList: (limit: number, offset: number) => [...queryKeys.allMarkets, 'list', { limit, offset }] as const,
  marketById: (id: string) => [...queryKeys.allMarkets, 'detail', id] as const,
  marketsByCategory: (category: string, limit: number) => [...queryKeys.allMarkets, 'category', category, limit] as const,
  searchMarkets: (query: string, limit: number) => [...queryKeys.allMarkets, 'search', query, limit] as const,
  trendingMarkets: (limit: number) => [...queryKeys.allMarkets, 'trending', limit] as const,
  highLiquidityMarkets: (limit: number) => [...queryKeys.allMarkets, 'high-liquidity', limit] as const,
  endingSoonMarkets: (hours: number, limit: number) => [...queryKeys.allMarkets, 'ending-soon', hours, limit] as const,
  marketStats: ['prediction-markets', 'stats'] as const,
  platformHealth: ['prediction-markets', 'platform-health'] as const,
};

// Hook for fetching all markets
export const useAllMarkets = (limit: number = 50) => {
  return useQuery({
    queryKey: queryKeys.marketsList(limit, 0),
    queryFn: () => aggregationService.getAllMarkets(limit),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // Refetch every minute
  });
};

// Hook for infinite scrolling of markets
export const useInfiniteMarkets = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.allMarkets, 'infinite'],
    queryFn: ({ pageParam = 0 }) => 
      aggregationService.getAllMarkets(limit).then(markets => ({
        markets: markets.slice(pageParam * limit, (pageParam + 1) * limit),
        nextCursor: markets.length > (pageParam + 1) * limit ? pageParam + 1 : undefined,
      })),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Hook for fetching a specific market
export const useMarketById = (marketId: string) => {
  return useQuery({
    queryKey: queryKeys.marketById(marketId),
    queryFn: () => aggregationService.getMarketById(marketId),
    enabled: !!marketId,
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000,
  });
};

// Hook for fetching markets by category
export const useMarketsByCategory = (category: string, limit: number = 50) => {
  return useQuery({
    queryKey: queryKeys.marketsByCategory(category, limit),
    queryFn: () => aggregationService.getMarketsByCategory(category, limit),
    enabled: !!category,
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000,
  });
};

// Hook for searching markets
export const useSearchMarkets = (query: string, limit: number = 30) => {
  return useQuery({
    queryKey: queryKeys.searchMarkets(query, limit),
    queryFn: () => aggregationService.searchMarkets(query, limit),
    enabled: query.length > 2, // Only search if query is at least 3 characters
    staleTime: 30000,
    gcTime: 300000,
  });
};

// Hook for trending markets
export const useTrendingMarkets = (limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.trendingMarkets(limit),
    queryFn: () => aggregationService.getTrendingMarkets(limit),
    staleTime: 60000, // 1 minute for trending
    gcTime: 300000,
    refetchInterval: 120000, // Refetch every 2 minutes
  });
};

// Hook for high liquidity markets
export const useHighLiquidityMarkets = (limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.highLiquidityMarkets(limit),
    queryFn: () => aggregationService.getHighLiquidityMarkets(limit),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000,
  });
};

// Hook for markets ending soon
export const useMarketsEndingSoon = (hours: number = 24, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.endingSoonMarkets(hours, limit),
    queryFn: () => aggregationService.getMarketsEndingSoon(hours, limit),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 60000,
  });
};

// Hook for aggregated market statistics
export const useMarketStats = () => {
  return useQuery({
    queryKey: queryKeys.marketStats,
    queryFn: () => aggregationService.getAggregatedStats(),
    staleTime: 60000, // 1 minute for stats
    gcTime: 600000, // 10 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

// Hook for platform health status
export const usePlatformHealth = () => {
  return useQuery({
    queryKey: queryKeys.platformHealth,
    queryFn: () => aggregationService.getPlatformHealth(),
    staleTime: 120000, // 2 minutes
    gcTime: 600000,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

// Custom hook for prefetching market data
export const usePrefetchMarket = () => {
  const queryClient = useQueryClient();

  const prefetchMarket = (marketId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.marketById(marketId),
      queryFn: () => aggregationService.getMarketById(marketId),
      staleTime: 30000,
    });
  };

  const prefetchMarketsByCategory = (category: string, limit: number = 50) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.marketsByCategory(category, limit),
      queryFn: () => aggregationService.getMarketsByCategory(category, limit),
      staleTime: 30000,
    });
  };

  return {
    prefetchMarket,
    prefetchMarketsByCategory,
  };
};

// Hook for invalidating and refetching data
export const useRefreshMarkets = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.allMarkets });
  };

  const refreshMarket = (marketId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.marketById(marketId) });
  };

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.marketStats });
  };

  return {
    refreshAll,
    refreshMarket,
    refreshStats,
  };
};
