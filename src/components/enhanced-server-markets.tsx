'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CategorySection } from './category-section';
import { SimpleMarketCard } from './simple-market-card';
import { PredictionMarket } from '@/types/prediction-market';
import { PolymarketStyleModal } from './polymarket-style-modal';

// SSR-safe date formatting function - handles both Date objects and ISO strings
const formatDate = (dateInput: string | Date | undefined): string => {
  try {
    if (!dateInput) return 'N/A';
    
    // Convert to Date if it's a string
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Use a consistent format that works on both server and client
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${month}/${day}/${year}`;
  } catch {
    return 'Invalid Date';
  }
};

interface ServerMarketsProps {
  markets: PredictionMarket[];
  onMarketClick?: (market: PredictionMarket) => void;
}

export default function EnhancedServerMarkets({ markets, onMarketClick }: ServerMarketsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategorySection, setShowCategorySection] = useState(false);
  const [selectedPlatformForCategories, setSelectedPlatformForCategories] = useState<'polymarket' | 'polkamarkets' | 'limitlesslabs'>('polymarket');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PredictionMarket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handlePlatformClick = (platform: string) => {
    if (platform === 'polymarket' || platform === 'polkamarkets' || platform === 'limitlesslabs') {
      setSelectedPlatformForCategories(platform as 'polymarket' | 'polkamarkets' | 'limitlesslabs');
      setShowCategorySection(true);
      return;
    }
    setSelectedPlatform(platform);
    setShowCategorySection(false);
  };

  const handleMarketClick = (market: PredictionMarket) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
    onMarketClick?.(market);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  // Search handler with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // If query is empty, clear results
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set new timer for debounced search
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    setSearchDebounceTimer(timer);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Reset visible count when platform changes
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedPlatform]);

  // Load more handler
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

  const getPlatformMarkets = (platform: string) => {
    if (platform === 'all') return markets;
    return markets.filter(m => m.platform === platform);
  };

  const getPlatformStats = (platform: string) => {
    const platformMarkets = getPlatformMarkets(platform);
    const activeCount = platformMarkets.filter(m => m.active).length;
    const totalVolume = platformMarkets.reduce((sum, m) => sum + (m.totalVolume || 0), 0);
    return { activeCount, totalVolume, totalMarkets: platformMarkets.length };
  };

  const platforms = [
    {
      id: 'all',
      name: 'All Markets',
      icon: 'A',
      logo: undefined,
      gradient: 'from-blue-600 via-cyan-600 to-indigo-600',
      hoverGradient: 'from-blue-500 via-cyan-500 to-indigo-500',
      bgGradient: 'from-blue-50 via-cyan-50 to-indigo-50',
      darkBgGradient: 'from-blue-900/30 via-cyan-900/20 to-indigo-900/30',
      borderColor: 'border-blue-400 dark:border-blue-500',
      hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-600',
      shadowColor: 'shadow-blue-500/20'
    },
    {
      id: 'polymarket',
      name: 'Polymarket',
      icon: undefined,
      logo: '/logos/id98Ai2eTk_logos.jpeg',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      hoverGradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      darkBgGradient: 'from-blue-900/30 via-indigo-900/20 to-purple-900/30',
      borderColor: 'border-blue-400 dark:border-blue-500',
      hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-600',
      shadowColor: 'shadow-blue-500/20'
    },
    {
      id: 'polkamarkets',
      name: 'Polkamarkets',
      icon: undefined,
      logo: '/logos/PM4n0IL9_400x400-removebg-preview.png',
      gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
      hoverGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      bgGradient: 'from-purple-50 via-fuchsia-50 to-pink-50',
      darkBgGradient: 'from-purple-900/30 via-fuchsia-900/20 to-pink-900/30',
      borderColor: 'border-purple-400 dark:border-purple-500',
      hoverBorderColor: 'hover:border-purple-300 dark:hover:border-purple-600',
      shadowColor: 'shadow-purple-500/20'
    },
    {
      id: 'limitlesslabs',
      name: 'Limitless',
      icon: 'L',
      logo: undefined,
      gradient: 'from-cyan-600 via-sky-600 to-blue-600',
      hoverGradient: 'from-cyan-500 via-sky-500 to-blue-500',
      bgGradient: 'from-cyan-50 via-sky-50 to-blue-50',
      darkBgGradient: 'from-cyan-900/30 via-sky-900/20 to-blue-900/30',
      borderColor: 'border-cyan-400 dark:border-cyan-500',
      hoverBorderColor: 'hover:border-cyan-300 dark:hover:border-cyan-600',
      shadowColor: 'shadow-cyan-500/20'
    }
  ];

  const getPlatformLogo = (platformId: string) => {
    const id = (platformId || '').toLowerCase();
    if (id === 'polymarket') return '/logos/id98Ai2eTk_logos.jpeg';
    if (id === 'polkamarkets') return '/logos/PM4n0IL9_400x400-removebg-preview.png';
    if (id === 'limitlesslabs') return '';
    return '';
  };

  if (showCategorySection) {
    return (
      <CategorySection
        platform={selectedPlatformForCategories}
        onBack={() => setShowCategorySection(false)}
      />
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Search (UI only) */}
      <div className="container mx-auto">
        <div className="relative max-w-3xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            aria-label="Search markets"
            placeholder="Search markets, categories, or platforms"
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full rounded-xl border border-gray-200 bg-white/90 pl-9 pr-10 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Results Section */}
      {searchQuery && searchQuery.trim().length >= 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isSearching ? 'Searching...' : `Found ${searchResults.length} markets matching "${searchQuery}"`}
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Search
            </button>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
              {searchResults.map((market) => (
                <SimpleMarketCard key={market.id} market={market} onClick={handleMarketClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No markets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or browse all markets below
              </p>
            </div>
          )}
        </div>
      )}

      {/* Platform Selection Grid (compact) - Hidden when searching */}
      {(!searchQuery || searchQuery.trim().length < 2) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const stats = getPlatformStats(platform.id);
          const platformMarkets = getPlatformMarkets(platform.id);
          const isSelected = selectedPlatform === platform.id;
          
          return (
            <div
              key={platform.id}
              className={`group relative rounded-xl p-5 shadow-sm border transition-colors cursor-pointer overflow-hidden ${
                isSelected
                  ? `bg-gradient-to-br ${platform.bgGradient} dark:${platform.darkBgGradient} ${platform.borderColor}`
                  : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:${platform.hoverBorderColor}`
              }`}
              onClick={() => handlePlatformClick(platform.id)}
            >
              {/* Subtle background tint */}
              <div className="absolute inset-0 opacity-[0.04] dark:opacity-10 bg-gradient-to-br from-black to-transparent" />

              {/* Content */}
              <div className="relative z-10">
                {/* Header Section (compact) */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
                    platform.id === 'polymarket'
                      ? 'bg-transparent shadow-none'
                      : `text-xl font-bold shadow-sm ${
                          isSelected
                            ? `bg-gradient-to-br ${platform.gradient} text-white`
                            : `bg-gradient-to-br from-gray-600 to-gray-700 text-white group-hover:bg-gradient-to-br group-hover:${platform.gradient}`
                        }`
                  }`}>
                    {platform.logo ? (
                      <img
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        width={40}
                        height={40}
                        className={`w-10 h-10 object-contain ${platform.id === 'polymarket' ? 'rounded-lg ring-1 ring-black/5 dark:ring-white/10' : 'drop-shadow-sm rounded'}`}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = platform.id === 'polymarket' ? '/logos/polymarket.svg' : '/logos/polkamarkets.svg';
                        }}
                      />
                    ) : (
                      platform.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-0.5 truncate">
                      {platform.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {stats.totalMarkets} markets
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {stats.activeCount} live
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Previews (2 compact rows) */}
                <div className="space-y-2 mb-4">
                  {platformMarkets.slice(0, 2).map((market) => (
                    <div 
                      key={market.id} 
                      onClick={() => handleMarketClick(market)}
                      className="group/item relative p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                            {market.title || 'Market Question'}
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Vol:</span>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                  ${market.totalVolume ? (market.totalVolume / 1000).toFixed(0) + 'K' : '0'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Liq:</span>
                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                  ${market.liquidity ? (market.liquidity / 1000).toFixed(0) + 'K' : '0'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              market.active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {market.active ? '● Live' : '○ End'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button (compact) */}
                {platformMarkets.length > 2 && (
                  <button
                    className={`relative w-full px-4 py-2.5 bg-gradient-to-r ${platform.gradient} hover:${platform.hoverGradient} text-white font-semibold rounded-lg transition-colors text-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlatformClick(platform.id);
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>Explore {platform.name}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                        {platformMarkets.length - 2} more
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Market Grid Section - Hidden when searching */}
      {(!searchQuery || searchQuery.trim().length < 2) && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedPlatform === 'all' ? 'All Markets' : 
             selectedPlatform === 'polymarket' ? 'Polymarket' :
             selectedPlatform === 'polkamarkets' ? 'Polkamarkets' : 'Omen'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getPlatformMarkets(selectedPlatform).length} markets
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {getPlatformStats(selectedPlatform).activeCount} active
              </span>
            </div>
          </div>
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {getPlatformMarkets(selectedPlatform).slice(0, visibleCount).map((market) => (
            <div
              key={market.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => handleMarketClick(market)}
            >
              {/* Market Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  market.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                  {market.active ? '● Live' : '○ End'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  #{market.id.toString().slice(-6)}
                </span>
              </div>

              {/* Market Question */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {market.title || 'Market Question'}
              </h3>

              {/* Market Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    ${market.totalVolume ? (market.totalVolume / 1000).toFixed(0) + 'K' : '0'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Liquidity</div>
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    ${market.liquidity ? (market.liquidity / 1000).toFixed(0) + 'K' : '0'}
                  </div>
                </div>
              </div>

              {/* Platform badge now shows logo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const logo = getPlatformLogo(market.platform);
                    return logo ? (
                      <img
                        src={logo}
                        alt={`${market.platform} logo`}
                        width={16}
                        height={16}
                        loading="lazy"
                        decoding="async"
                        className="w-4 h-4 object-contain rounded"
                        data-platform={market.platform}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = market.platform === 'polymarket' ? '/logos/polymarket.svg' : '/logos/polkamarkets.svg';
                        }}
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        market.platform === 'polymarket' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                        market.platform.toLowerCase().includes('polka') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                      }`}>
                        {market.platform?.toUpperCase().substring(0, 3) || 'N/A'}
                      </span>
                    );
                  })()}
                </div>
                {market.endDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ends: {formatDate(market.endDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {getPlatformMarkets(selectedPlatform).length > visibleCount && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Load More Markets</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    +12
                  </span>
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Showing count indicator */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {Math.min(visibleCount, getPlatformMarkets(selectedPlatform).length)} of {getPlatformMarkets(selectedPlatform).length} markets
        </div>
      </div>

      )}

      {/* Polymarket-Style Market Detail Modal */}
      {selectedMarket && (
        <PolymarketStyleModal
          market={selectedMarket}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
