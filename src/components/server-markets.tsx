'use client';

import { useState, useEffect } from 'react';
import { SimpleMarketCard } from './simple-market-card';
import { LoadMoreMarkets } from './load-more-markets';
import { CategorySection } from './category-section';

interface ServerMarketsProps {
  markets: any[];
}

export function ServerMarkets({ markets }: ServerMarketsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  const [showCategorySection, setShowCategorySection] = useState(false);
  const [selectedPlatformForCategories, setSelectedPlatformForCategories] = useState<'polymarket' | 'myriad'>('polymarket');

  // Helper function to format currency values
  const formatCurrency = (num: number) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter markets based on selected platform
  const getFilteredMarkets = () => {
    if (selectedPlatform === 'all') {
      return markets;
    }
    
    return markets.filter(market => {
      // Determine platform from market data
      const marketPlatform = market.platform || 'polymarket';
      
      switch (selectedPlatform) {
        case 'polymarket':
          return marketPlatform === 'polymarket';
        case 'myriad':
          return marketPlatform === 'myriad';
        case 'omen':
          return marketPlatform === 'omen';
        case 'zeitgeist':
          return marketPlatform === 'zeitgeist';
        default:
          return true;
      }
    });
  };

  const filteredMarkets = getFilteredMarkets();

  // Handle platform card clicks
  const handlePlatformClick = (platform: string) => {
    if (platform === 'polymarket' || platform === 'myriad') {
      setSelectedPlatformForCategories(platform as 'polymarket' | 'myriad');
      setShowCategorySection(true);
    } else {
      setSelectedPlatform(platform);
      setShowCategorySection(false);
    }
  };

  // Handle back from category section
  const handleBackFromCategories = () => {
    setShowCategorySection(false);
    setSelectedPlatform('all');
  };

  // Handle market click
  const handleMarketClick = (market: any) => {
    // Market click handler - can be extended for future functionality
    console.log('Market clicked:', market);
  };

  if (!markets || markets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          No markets available.
        </div>
      </div>
    );
  }

  // Show category section if a platform card was clicked
  if (showCategorySection) {
    return (
      <CategorySection 
        platform={selectedPlatformForCategories} 
        onBack={handleBackFromCategories}
      />
    );
  }

  // Render static version during SSR, interactive version after hydration
  if (!isClient) {
    return (
      <div className="space-y-8">
        {/* Static Platform Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {/* All Markets Tab - Static */}
          <div className="rounded-xl p-6 shadow-sm border bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                   <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                A
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Markets</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{markets.length} markets</p>
              </div>
            </div>
            <div className="space-y-3">
              {markets.slice(0, 3).map((market) => (
                <div key={market.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {market.question || market.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Volume: ${(market.volumeNum || market.volume || 0).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full ${market.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {market.active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Other tabs would go here... */}
        </div>
        
        {/* Static Markets Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Markets</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                   {markets.slice(0, 6).map((market) => (
                     <SimpleMarketCard key={market.id} market={market} onClick={handleMarketClick} />
                   ))}
                 </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Enhanced Platform Selection - Premium Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* All Markets Tab */}
        <div className={`group relative rounded-xl p-6 shadow-md border transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl hover:shadow-2xl hover:border-gray-400 dark:hover:border-gray-500 hover:-translate-y-2 hover:scale-[1.03] active:scale-[0.98] ${
          selectedPlatform === 'all' 
            ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 dark:from-gray-900/30 dark:via-slate-900/20 dark:to-gray-900/30 border-gray-400 dark:border-gray-500 shadow-xl scale-[1.02]' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
        onClick={() => handlePlatformClick('all')}>
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-3 mb-4">
            <span className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
              A
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">All Markets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{markets.length} markets</p>
            </div>
          </div>
          <div className="relative space-y-3">
            {markets.slice(0, 3).map((market) => (
              <div key={market.id} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 leading-relaxed">
                  {market.question || market.title || 'Market Question'}
                </h4>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Volume: ${formatCurrency(market.volumeNum || market.totalVolume || 0)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${market.active ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900 dark:to-rose-900 dark:text-red-200'}`}>
                    {market.active ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {markets.length > 3 && (
            <button 
              className="relative w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-95 overflow-hidden group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlatform('all');
              }}
            >
              <span className="relative z-10">View All ({markets.length - 3} more)</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
          )}
        </div>

        {/* Polymarket Tab */}
        <div className={`group relative rounded-xl p-6 shadow-md border transition-all duration-300 cursor-pointer overflow-hidden ${
          selectedPlatform === 'polymarket' 
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-900/30 border-blue-400 dark:border-blue-500 shadow-xl ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-[1.02]' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
        }`}
        onClick={() => handlePlatformClick('polymarket')}>
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-3 mb-4">
            <span className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
              P
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Polymarket</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {markets.filter(m => m.platform === 'polymarket').length} markets
              </p>
            </div>
          </div>
          <div className="relative space-y-3">
            {markets.filter(m => m.platform === 'polymarket').slice(0, 3).map((market) => (
              <div key={market.id} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 leading-relaxed">
                  {market.question || market.title || 'Market Question'}
                </h4>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Volume: ${formatCurrency(market.volumeNum || market.totalVolume || 0)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${market.active ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900 dark:to-rose-900 dark:text-red-200'}`}>
                    {market.active ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {markets.filter(m => m.platform === 'polymarket').length > 3 && (
            <button 
              className="relative w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-95 overflow-hidden group"
              onClick={(e) => {
                e.stopPropagation();
                handlePlatformClick('polymarket');
              }}
            >
              <span className="relative z-10">View All ({markets.filter(m => m.platform === 'polymarket').length - 3} more)</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
          )}
        </div>

        {/* Myriad Markets Tab */}
        <div className={`group relative rounded-xl p-6 shadow-md border transition-all duration-300 cursor-pointer overflow-hidden ${
          selectedPlatform === 'myriad' 
            ? 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-50 dark:from-purple-900/30 dark:via-fuchsia-900/20 dark:to-purple-900/30 border-purple-400 dark:border-purple-500 shadow-xl ring-2 ring-purple-400 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 scale-[1.02]' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
        }`}
        onClick={() => handlePlatformClick('myriad')}>
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-3 mb-4">
            <span className="w-12 h-12 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-700 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
              K
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Myriad Markets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {markets.filter(m => m.platform === 'myriad').length} markets
              </p>
            </div>
          </div>
          <div className="relative space-y-3">
            {markets.filter(m => m.platform === 'myriad').slice(0, 3).map((market) => (
              <div key={market.id} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 leading-relaxed">
                  {market.question || market.title || 'Market Question'}
                </h4>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Volume: ${formatCurrency(market.volumeNum || market.totalVolume || 0)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${market.active ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900 dark:to-rose-900 dark:text-red-200'}`}>
                    {market.active ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {markets.filter(m => m.platform === 'myriad').length > 3 && (
            <button 
              className="relative w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-95 overflow-hidden group"
              onClick={(e) => {
                e.stopPropagation();
                handlePlatformClick('myriad');
              }}
            >
              <span className="relative z-10">View All ({markets.filter(m => m.platform === 'myriad').length - 3} more)</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
          )}
          {markets.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real Myriad Markets blockchain integration in progress
              </p>
            </div>
          )}
        </div>

        {/* Omen Tab */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              O
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Omen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coming Soon</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-3">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Omen prediction markets integration coming soon
            </p>
          </div>
        </div>

        {/* Zeitgeist Tab */}
        <div className={`rounded-xl p-6 shadow-sm border transition-all duration-200 cursor-pointer ${
          selectedPlatform === 'zeitgeist' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 shadow-lg' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
        }`}
        onClick={() => setSelectedPlatform('zeitgeist')}>
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              Z
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Zeitgeist</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coming Soon</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-3">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zeitgeist prediction markets integration coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Full Market Grid Below */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedPlatform === 'all' ? 'Featured Markets' : 
             selectedPlatform === 'polymarket' ? 'Polymarket Markets' :
             selectedPlatform === 'myriad' ? 'Myriad Markets' :
             selectedPlatform === 'omen' ? 'Omen Markets' :
             selectedPlatform === 'zeitgeist' ? 'Zeitgeist Markets' : 'Featured Markets'}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''} available
            {selectedPlatform !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                {selectedPlatform === 'polymarket' ? 'Polymarket' :
                 selectedPlatform === 'myriad' ? 'Myriad Markets' :
                 selectedPlatform === 'omen' ? 'Omen' :
                 selectedPlatform === 'zeitgeist' ? 'Zeitgeist' : selectedPlatform}
              </span>
            )}
          </div>
        </div>

               {filteredMarkets.length > 0 ? (
                 <LoadMoreMarkets 
                   initialMarkets={filteredMarkets.slice(0, 6)} 
                   initialOffset={6}
                   limit={50}
                   platform={selectedPlatform}
                   onMarketClick={handleMarketClick}
                 />
               ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No markets available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedPlatform === 'omen' ? 'Omen markets are coming soon!' :
               selectedPlatform === 'zeitgeist' ? 'Zeitgeist markets are coming soon!' :
               'No markets found for this platform.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
