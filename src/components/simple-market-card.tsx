'use client';

import { useState, useEffect } from 'react';

interface SimpleMarketCardProps {
  market: any;
  onClick?: (market: any) => void;
}

export function SimpleMarketCard({ market, onClick }: SimpleMarketCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
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

  const formatPercentage = (num: number) => {
    if (typeof num !== 'number' || isNaN(num)) return '0.0%';
    return (num * 100).toFixed(1) + '%';
  };



  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Politics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Crypto': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Economics': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Science': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Business': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Space': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'polymarket': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'polkamarkets': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'limitlesslabs': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPlatformName = (market: any) => {
    return market.platform || 'polymarket';
  };

  const getPlatformLogo = (platform: string) => {
    const key = (platform || '').toLowerCase();
    if (key === 'polymarket') return '/logos/id98Ai2eTk_logos.jpeg';
    if (key === 'polkamarkets') return '/logos/PM4n0IL9_400x400-removebg-preview.png';
    if (key === 'limitlesslabs') return '';
    return '';
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      // Handle null, undefined, or empty values
      if (!dateString) {
        return 'No Date';
      }
      
      // Handle different date formats
      let date: Date;
      
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Handle empty strings
        if (dateString.trim() === '') {
          return 'No Date';
        }
        date = new Date(dateString);
      } else {
        return 'Invalid Date';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // SSR-safe date formatting - use consistent format that works on both server and client
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString);
      return 'Invalid Date';
    }
  };

  // Parse outcomes and prices safely
  const parseOutcomes = (outcomes: any) => {
    if (!outcomes) return ['Yes', 'No'];
    if (typeof outcomes === 'string') {
      // Handle comma-separated string like "Yes,No"
      if (outcomes.includes(',')) {
        return outcomes.split(',').map(o => o.trim());
      }
      // Try to parse as JSON
      try {
        return JSON.parse(outcomes);
      } catch {
        return [outcomes];
      }
    }
    return Array.isArray(outcomes) ? outcomes : ['Yes', 'No'];
  };

  const parsePrices = (prices: any) => {
    if (!prices) return ['0', '0'];
    if (typeof prices === 'string') {
      // Handle comma-separated string like "0.5,0.5"
      if (prices.includes(',')) {
        return prices.split(',').map(p => p.trim());
      }
      // Try to parse as JSON
      try {
        return JSON.parse(prices);
      } catch {
        return [prices];
      }
    }
    return Array.isArray(prices) ? prices : ['0', '0'];
  };

  const parseSafePrice = (priceStr: string) => {
    const parsed = parseFloat(priceStr || '0');
    return isNaN(parsed) ? 0 : parsed;
  };

  const outcomes = parseOutcomes(market.outcomes);
  const prices = parsePrices(market.outcomePrices);
  const yesPrice = parseSafePrice(prices[0] || '0');
  const noPrice = parseSafePrice(prices[1] || '0');

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-300/30 dark:hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
      onClick={() => onClick?.(market)}
    >
      {/* Ultra-Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          {(() => {
            const logo = getPlatformLogo(getPlatformName(market));
            return logo ? (
              <img
                src={logo}
                alt={`${getPlatformName(market)} logo`}
                width={16}
                height={16}
                loading="lazy"
                decoding="async"
                className="w-4 h-4 object-contain rounded"
                data-platform={getPlatformName(market)}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.src = getPlatformName(market).toLowerCase() === 'polymarket' ? '/logos/polymarket.svg' : '/logos/polkamarkets.svg';
                }}
              />
            ) : (
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded-md ${getPlatformColor(getPlatformName(market))}`}>
                {getPlatformName(market).toUpperCase().substring(0, 3)}
              </span>
            );
          })()}
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-md ${getStatusColor(market.active)}`}>
            {market.active ? 'LIVE' : 'END'}
          </span>
        </div>
        {market.category && (
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-md ${getCategoryColor(market.category)}`}>
            {market.category.substring(0, 4)}
          </span>
        )}
      </div>

      {/* Ultra-Compact Title */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
        {market.question}
      </h3>

      {/* Ultra-Compact Price Display */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-2 mb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">
              {(outcomes[0] || 'YES').toUpperCase().substring(0, 3)}
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatPercentage(yesPrice)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">
              {(outcomes[1] || 'NO').toUpperCase().substring(0, 2)}
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatPercentage(noPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Compact Stats */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-md py-1.5">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">Vol</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            ${formatCurrency(parseSafePrice(market.volumeNum || market.volume || '0'))}
          </div>
        </div>
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-md py-1.5">
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">Liq</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            ${formatCurrency(parseSafePrice(market.liquidityNum || market.liquidity || '0'))}
          </div>
        </div>
      </div>

      {/* Ultra-Compact Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">
          #{market.id.toString().slice(-6)}
        </span>
        {market.endDate && isClient && formatDate(market.endDate) !== 'No Date' && (
          <span className="text-xs text-blue-600 dark:text-blue-400">
            ⏰ {formatDate(market.endDate)}
          </span>
        )}
      </div>
    </div>
  );
}
