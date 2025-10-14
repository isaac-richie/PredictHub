'use client';

import { useState, useCallback, useEffect } from 'react';
import { SimpleMarketCard } from './simple-market-card';

interface LoadMoreMarketsProps {
  initialMarkets: any[];
  initialOffset: number;
  limit: number;
  platform?: string;
  onMarketClick?: (market: any) => void;
}

export function LoadMoreMarkets({ initialMarkets, initialOffset, limit, platform = 'all', onMarketClick }: LoadMoreMarketsProps) {
  const [markets, setMarkets] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle hydration by only setting state on client
  useEffect(() => {
    setIsClient(true);
    setMarkets(initialMarkets);
    setOffset(initialOffset);
  }, [initialMarkets, initialOffset]);

  const loadMoreMarkets = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newOffset = offset + limit;
      console.log('🔍 LoadMore: Fetching more markets, offset:', newOffset, 'limit:', limit);

             // Use the dedicated load more API with platform filtering
             const response = await fetch(`/api/load-more?limit=${limit}&offset=${newOffset}&platform=${platform}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newMarkets = await response.json();
      
      console.log('🔍 LoadMore: New markets received:', newMarkets.length);

      if (newMarkets.length === 0) {
        setHasMore(false);
      } else {
        setMarkets(prev => [...prev, ...newMarkets]);
        setOffset(newOffset);
      }
    } catch (err) {
      console.error('Error loading more markets:', err);
      setError('Failed to load more markets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, limit, platform]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
               {initialMarkets.map((market) => (
                 <SimpleMarketCard key={market.id} market={market} onClick={onMarketClick || undefined} />
               ))}
             </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Markets Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
               {markets.map((market) => (
                 <SimpleMarketCard key={market.id} market={market} onClick={onMarketClick || undefined} />
               ))}
        
        {/* Loading skeleton cards when loading more */}
        {loading && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`loading-${index}`} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More Section */}
      <div className="text-center py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {hasMore ? (
          <button
            onClick={loadMoreMarkets}
            disabled={loading}
                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white rounded-lg transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading More Markets...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Load More Markets</span>
              </div>
            )}
          </button>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-lg font-medium mb-2">All markets loaded</div>
            <div className="text-sm">You&apos;ve reached the end of available markets</div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {markets.length} market{markets.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
