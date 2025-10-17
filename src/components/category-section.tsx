'use client';

import { useState, useEffect } from 'react';
import { SimpleMarketCard } from './simple-market-card';
import { PolymarketStyleModal } from './polymarket-style-modal';

interface CategorySectionProps {
  platform: 'polymarket' | 'polkamarkets' | 'limitlesslabs';
  onBack: () => void;
}

export function CategorySection({ platform, onBack }: CategorySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Platform-specific category definitions
  const polymarketCategories = [
    { 
      id: 'all', 
      name: 'All Markets', 
      description: 'Explore all prediction markets',
      color: 'from-blue-500 via-cyan-500 to-teal-500', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      icon: '🌐',
      count: '∞'
    },
    { 
      id: 'Politics', 
      name: 'Politics', 
      description: 'Elections, government, and political predictions',
      color: 'from-blue-400 via-indigo-500 to-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      icon: '🏛️',
      count: '15+'
    },
    { 
      id: 'Crypto', 
      name: 'Crypto', 
      description: 'Cryptocurrency and blockchain predictions',
      color: 'from-yellow-400 via-orange-500 to-red-500', 
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      icon: '₿',
      count: '30+'
    },
    { 
      id: 'Economics', 
      name: 'Economics', 
      description: 'Markets, economy, and financial predictions',
      color: 'from-green-400 via-emerald-500 to-teal-500', 
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      icon: '💰',
      count: '25+'
    },
    { 
      id: 'Technology', 
      name: 'Technology', 
      description: 'AI, tech companies, and innovation',
      color: 'from-purple-400 via-violet-500 to-purple-600', 
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      icon: '🤖',
      count: '40+'
    },
    { 
      id: 'Sports', 
      name: 'Sports', 
      description: 'Sports events and competitions',
      color: 'from-orange-400 via-red-500 to-pink-500', 
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      icon: '⚽',
      count: '20+'
    },
    { 
      id: 'Entertainment', 
      name: 'Entertainment', 
      description: 'Movies, music, and pop culture',
      color: 'from-pink-400 via-rose-500 to-red-500', 
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      icon: '🎬',
      count: '15+'
    },
    { 
      id: 'Science', 
      name: 'Science', 
      description: 'Health, climate, and scientific predictions',
      color: 'from-red-400 via-orange-500 to-yellow-500', 
      bgColor: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
      icon: '🔬',
      count: '10+'
    },
    { 
      id: 'Business', 
      name: 'Business', 
      description: 'Companies, CEOs, and corporate events',
      color: 'from-indigo-400 via-blue-500 to-cyan-500', 
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
      icon: '💼',
      count: '15+'
    },
    { 
      id: 'Space', 
      name: 'Space', 
      description: 'SpaceX, rockets, and space exploration',
      color: 'from-cyan-400 via-blue-500 to-indigo-500', 
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
      icon: '🚀',
      count: '5+'
    },
    { 
      id: 'Other', 
      name: 'Other', 
      description: 'Miscellaneous predictions',
      color: 'from-gray-400 via-slate-500 to-gray-600', 
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      icon: '📊',
      count: '10+'
    },
  ];

  // Polkamarkets official categories (6 categories)
  const polkamarketsCategories = [
    { 
      id: 'all', 
      name: 'All Markets', 
      description: 'Explore all prediction markets',
      color: 'from-blue-500 via-cyan-500 to-teal-500', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      icon: '🌐',
      count: '∞'
    },
    { 
      id: 'Crypto', 
      name: 'Crypto', 
      description: 'Cryptocurrency and blockchain predictions',
      color: 'from-yellow-400 via-orange-500 to-red-500', 
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      icon: '₿',
      count: '25+'
    },
    { 
      id: 'Sport', 
      name: 'Sport', 
      description: 'Sports events and competitions',
      color: 'from-orange-400 via-red-500 to-pink-500', 
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      icon: '⚽',
      count: '25+'
    },
    { 
      id: 'Gaming', 
      name: 'Gaming', 
      description: 'Video games, esports, and gaming industry',
      color: 'from-purple-400 via-violet-500 to-fuchsia-500', 
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      icon: '🎮',
      count: '25+'
    },
    { 
      id: 'Politics', 
      name: 'Politics', 
      description: 'Elections, government, and political predictions',
      color: 'from-blue-400 via-indigo-500 to-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      icon: '🏛️',
      count: '25+'
    },
    { 
      id: 'Economy', 
      name: 'Economy', 
      description: 'Markets, stocks, and economic predictions',
      color: 'from-green-400 via-emerald-500 to-teal-500', 
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      icon: '💰',
      count: '25+'
    },
    { 
      id: 'Culture', 
      name: 'Culture', 
      description: 'Entertainment, arts, science, and pop culture',
      color: 'from-pink-400 via-rose-500 to-red-500', 
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      icon: '🎬',
      count: '25+'
    },
  ];

  // LimitlessLabs categories (time-based trading + asset types)
  const limitlesslabsCategories = [
    { 
      id: 'all', 
      name: 'All Markets', 
      description: 'Explore all prediction markets',
      color: 'from-blue-500 via-cyan-500 to-teal-500', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      icon: '🌐',
      count: '∞'
    },
    { 
      id: 'crypto', 
      name: 'Crypto', 
      description: 'BTC, ETH, SOL, DOGE, XRP and more',
      color: 'from-orange-400 via-amber-500 to-yellow-500', 
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      icon: '₿',
      count: '25+'
    },
    { 
      id: 'Hourly', 
      name: 'Hourly', 
      description: 'Fast-paced hourly price predictions',
      color: 'from-red-400 via-orange-500 to-yellow-500', 
      bgColor: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
      icon: '⚡',
      count: '10+'
    },
    { 
      id: 'Daily Strikes', 
      name: 'Daily Strikes', 
      description: 'Daily price strike predictions',
      color: 'from-blue-400 via-indigo-500 to-purple-500', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      icon: '📊',
      count: '20+'
    },
    { 
      id: '30 min', 
      name: '30 Minute', 
      description: 'Ultra-fast 30-minute predictions',
      color: 'from-yellow-400 via-amber-500 to-orange-500', 
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      icon: '⏱️',
      count: '5+'
    },
  ];

  // Select categories based on platform
  const categories = platform === 'polymarket' ? polymarketCategories : 
                     platform === 'polkamarkets' ? polkamarketsCategories : 
                     limitlesslabsCategories;

  const getPlatformName = () => {
    return platform === 'polymarket' ? 'Polymarket' : 
           platform === 'polkamarkets' ? 'Myriad' : 
           'Limitless';
  };

  const getPlatformColor = () => {
    return platform === 'polymarket' 
      ? 'from-blue-500 to-cyan-500' 
      : platform === 'polkamarkets'
      ? 'from-purple-500 to-purple-600'
      : 'from-cyan-500 to-teal-500';
  };

  // Handle market card click
  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  // Fetch markets for the selected category
  const fetchMarkets = async (category: string) => {
    setLoading(true);
    try {
      let response;
      
      // For LimitlessLabs, fetch directly to avoid timeout issues
      if (platform === 'limitlesslabs') {
        response = await fetch(`/api/limitlesslabs?endpoint=markets&limit=25&offset=0`);
      } else {
        response = await fetch(`/api/load-more?limit=20&offset=0&platform=${platform}&category=${category}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isClient) {
      fetchMarkets(selectedCategory);
    }
  }, [selectedCategory, platform, isClient]);

  const filteredMarkets = markets.filter(market => {
    if (selectedCategory === 'all') return true;
    
    // Check if market.category matches exactly (case-insensitive)
    if (market.category && market.category.toLowerCase() === selectedCategory.toLowerCase()) {
      return true;
    }
    
    // Special case for LimitlessLabs: filter by keywords in title
    if (platform === 'limitlesslabs') {
      const titleLower = (market.title || market.question || '').toLowerCase();
      
      // Crypto category - filter by crypto symbols
      if (selectedCategory === 'crypto') {
        const cryptoKeywords = ['btc', 'eth', 'sol', 'doge', 'xrp', 'link', 'avax', 'matic', 'ada', 'dot', 'atom', 'near', 'apt', 'sui', 'arb', 'op', 'bitcoin', 'ethereum', 'solana', 'dogecoin', 'ripple', 'chainlink', 'avalanche', 'polygon', 'cardano', 'polkadot', 'cosmos', 'aptos', 'arbitrum', 'optimism', '$btc', '$eth', '$sol', '$doge', '$xrp', '$link'];
        return cryptoKeywords.some(keyword => titleLower.includes(keyword));
      }
      
      // Stocks category - filter by stock symbols and indices
      if (selectedCategory === 'stocks') {
        const stockKeywords = ['spy', 's&p', 'nasdaq', 'dow', 'tsla', 'aapl', 'msft', 'googl', 'amzn', 'nvda', 'meta', 'tesla', 'apple', 'microsoft', 'google', 'amazon', 'nvidia', '$spy', 'stock', 'index'];
        return stockKeywords.some(keyword => titleLower.includes(keyword));
      }
    }
    
    // Special case for Politics: include related governmental/economic markets
    if (selectedCategory.toLowerCase() === 'politics') {
      const politicalKeywords = [
        'fed', 'federal', 'government', 'policy', 'regulation', 'law', 'court', 
        'supreme', 'congress', 'senate', 'house', 'election', 'president', 
        'trump', 'biden', 'democrat', 'republican', 'vote', 'campaign',
        'putin', 'khamenei', 'supreme leader', 'iran', 'russia'
      ];
      
      const questionLower = market.question?.toLowerCase() || '';
      const categoryLower = market.category?.toLowerCase() || '';
      
      // Include markets from Economics or Other categories that have political keywords
      if ((categoryLower === 'economics' || categoryLower === 'other') && 
          politicalKeywords.some(keyword => questionLower.includes(keyword))) {
        return true;
      }
      
      // Also include markets that are explicitly categorized as Politics
      if (categoryLower === 'politics') {
        return true;
      }
    }
    
    // Also check tags array if it exists
    if (market.tags && Array.isArray(market.tags)) {
      return market.tags.some((tag: string) => 
        tag.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    return false;
  });

  if (!isClient) {
    return (
      <div className="space-y-8">
        {/* Static Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            {getPlatformName()} Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover prediction markets organized by category. Click any category to explore specific markets.
          </p>
        </div>

        {/* Static Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {categories.slice(0, 8).map((category) => (
            <div key={category.id} className="group relative overflow-hidden rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{category.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{category.description}</div>
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500">{category.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={onBack}
            className="group mr-6 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getPlatformColor()} rounded-2xl flex items-center justify-center shadow-lg overflow-hidden`}>
              {platform === 'polymarket' ? (
                <img src="/logos/id98Ai2eTk_logos.jpeg" alt="Polymarket logo" className="w-10 h-10 object-contain" />
              ) : platform === 'polkamarkets' ? (
                <img src="/logos/myriad.jpeg" alt="Myriad logo" className="w-10 h-10 object-contain" />
              ) : (
                <img src="/logos/limitlesslabs.svg" alt="Limitless logo" className="w-10 h-10 object-contain" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {getPlatformName()} Categories
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover markets by category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              selectedCategory === category.id
                ? `ring-2 ring-blue-500 shadow-lg ${category.bgColor}`
                : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} ${
              selectedCategory === category.id ? 'opacity-10' : 'opacity-5 group-hover:opacity-10'
            } transition-opacity duration-300`} />
            
            <div className="relative text-center">
              <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 ${
                selectedCategory === category.id ? 'animate-pulse' : ''
              }`}>
                {category.icon}
              </div>
              <div className={`text-sm font-semibold mb-1 ${
                selectedCategory === category.id 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200'
              }`}>
                {category.name}
              </div>
              <div className={`text-xs mb-1 ${
                selectedCategory === category.id 
                  ? 'text-gray-600 dark:text-gray-300' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`}>
                {category.description}
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
              }`}>
                {category.count}
              </div>
            </div>

            {/* Selection indicator */}
            {selectedCategory === category.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Markets Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${categories.find(c => c.id === selectedCategory)?.color || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center`}>
              <span className="text-xl">
                {categories.find(c => c.id === selectedCategory)?.icon || '📊'}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? 'All Markets' : `${categories.find(c => c.id === selectedCategory)?.name} Markets`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory === 'all' 
                  ? 'Explore all available prediction markets' 
                  : categories.find(c => c.id === selectedCategory)?.description
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformColor()} text-white`}>
              {platform === 'polymarket' ? 'Polymarket' : 'Myriad'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : `${filteredMarkets.length} markets`}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {filteredMarkets.map((market) => (
              <SimpleMarketCard key={market.id} market={market} onClick={handleMarketClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No markets found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              No markets available for {categories.find(c => c.id === selectedCategory)?.name} category
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
            >
              View All Markets
            </button>
          </div>
        )}
      </div>

      {/* Polymarket-Style Market Detail Modal */}
      <PolymarketStyleModal
        market={selectedMarket}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}