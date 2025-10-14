'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown, Clock, DollarSign, Users, Activity, Info, BarChart3, Droplets, Calendar, Target } from 'lucide-react';
import { ProfessionalChart } from './professional-chart';

interface ProductionMarketModalProps {
  market: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductionMarketModal({ market, isOpen, onClose }: ProductionMarketModalProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState<'chart' | 'stats' | 'info'>('chart');

  // Safe value formatters
  const formatCurrency = (value: any): string => {
    const num = parseFloat(String(value || 0));
    if (isNaN(num)) return '$0';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (value: any): string => {
    const num = parseFloat(String(value || 0));
    if (isNaN(num)) return '0%';
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: any): string => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Generate platform-specific URL
  const getTradingUrl = useCallback((market: any) => {
    if (!market) return '#';
    
    if (market.externalUrl) return market.externalUrl;
    
    switch (market.platform) {
      case 'polymarket':
        if (market.slug) return `https://polymarket.com/market/${market.slug}`;
        const rawId = market.id.replace(/^polymarket_/, '');
        return `https://polymarket.com/market/${rawId}`;
      case 'other':
      case 'polkamarkets':
        const actualId = market.id.replace(/^polkamarkets-/, '');
        return `https://polkamarkets.com/market/${actualId}`;
      case 'limitlesslabs':
        const limitlessId = market.id.replace(/^limitlesslabs_/, '');
        return limitlessId ? `https://limitless.exchange/advanced/markets/${limitlessId}` : '#';
      default:
        return '#';
    }
  }, []);

  // Fetch price history
  const fetchPriceHistory = useCallback(async () => {
    if (!market) return;
    
    // LimitlessLabs doesn't support price history yet
    if (market.platform === 'limitlesslabs') {
      setLoading(false);
      setChartData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiEndpoint = market.platform === 'other' || market.platform === 'polkamarkets'
        ? '/api/polkamarkets'
        : '/api/polymarket';
      
      const response = await fetch(
        `${apiEndpoint}?endpoint=price-history&marketId=${market.id}&timeRange=${selectedTimeRange}&limit=500`
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching price history:', err);
      setError('Failed to load price history');
    } finally {
      setLoading(false);
    }
  }, [market, selectedTimeRange]);

  useEffect(() => {
    if (market && isOpen) {
      fetchPriceHistory();
    }
  }, [market, isOpen, fetchPriceHistory]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !market) return null;

  const tradingUrl = getTradingUrl(market);
  const yesPrice = market.yesPrice || 0;
  const noPrice = market.noPrice || (1 - yesPrice);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-6 py-4 flex items-start justify-between border-b border-blue-700">
          <div className="flex-1 pr-4">
            <h2 
              id="modal-title"
              className="text-2xl font-bold text-white mb-2 line-clamp-2"
            >
              {market.question || market.title || 'Market Details'}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                market.active
                  ? 'bg-green-400/20 text-green-100 ring-1 ring-green-400/30'
                  : 'bg-red-400/20 text-red-100 ring-1 ring-red-400/30'
              }`}>
                {market.active ? '● LIVE' : '○ CLOSED'}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                {market.platform?.toUpperCase() || 'UNKNOWN'}
              </span>
              {market.category && (
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                  {market.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pb-16">
          {/* Price Cards */}
          <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* YES Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                      YES
                    </span>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                    {formatPercentage(yesPrice)}
                  </div>
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ${(yesPrice * 100).toFixed(2)} per share
                  </div>
                </div>
              </div>

              {/* NO Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">
                      NO
                    </span>
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-4xl font-bold text-red-700 dark:text-red-300">
                    {formatPercentage(noPrice)}
                  </div>
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    ${(noPrice * 100).toFixed(2)} per share
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Volume</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(market.volumeNum || market.totalVolume || market.volume || 0)}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Liquidity</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(market.liquidityNum || market.liquidity || 0)}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">24h Volume</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(market.volume24hr || 0)}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ends</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {market.endDate ? formatDate(market.endDate) : 'TBD'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex gap-2">
              {[
                { id: 'chart', label: 'Chart', icon: BarChart3 },
                { id: 'stats', label: 'Statistics', icon: Activity },
                { id: 'info', label: 'Information', icon: Info }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === id
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6">
            {activeTab === 'chart' && (
              <div className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ProfessionalChart
                    data={chartData}
                    market={market}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeChange={setSelectedTimeRange}
                  />
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trading Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Best Bid', value: formatPercentage(market.bestBid), icon: TrendingUp },
                      { label: 'Best Ask', value: formatPercentage(market.bestAsk), icon: TrendingDown },
                      { label: 'Spread', value: formatPercentage(market.spread), icon: Target },
                      { label: 'Last Trade Price', value: formatPercentage(market.lastTradePrice), icon: DollarSign },
                      { label: '1 Hour Change', value: `${((market.oneHourPriceChange || 0) * 100).toFixed(2)}%`, icon: Activity },
                      { label: '1 Day Change', value: `${((market.oneDayPriceChange || 0) * 100).toFixed(2)}%`, icon: Activity },
                      { label: '1 Week Change', value: `${((market.oneWeekPriceChange || 0) * 100).toFixed(2)}%`, icon: Activity },
                      { label: '1 Month Change', value: `${((market.oneMonthPriceChange || 0) * 100).toFixed(2)}%`, icon: Activity }
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Volume Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: '1 Week Volume', value: formatCurrency(market.volume1wk) },
                      { label: '1 Month Volume', value: formatCurrency(market.volume1mo) },
                      { label: '1 Year Volume', value: formatCurrency(market.volume1yr) },
                      { label: 'Total Volume', value: formatCurrency(market.volumeNum || market.totalVolume) }
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                {market.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {market.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Market Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Market ID', value: market.id },
                      { label: 'Platform', value: market.platform },
                      { label: 'Category', value: market.category || 'Uncategorized' },
                      { label: 'Created', value: formatDate(market.createdAt) },
                      { label: 'Updated', value: formatDate(market.updatedAt) },
                      { label: 'Market Type', value: market.marketType || 'Binary' },
                      { label: 'Status', value: market.active ? 'Active' : 'Closed' }
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
                        <span className="text-sm text-gray-900 dark:text-white text-right max-w-md break-words">
                          {value || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {market.tags && market.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {market.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer (compact) */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
              <span className="font-medium">Market ID:</span> {market.id.toString().slice(-12)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {tradingUrl && tradingUrl !== '#' && (
                <a
                  href={tradingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Trade Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

