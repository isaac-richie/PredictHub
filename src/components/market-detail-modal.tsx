'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { SimpleMarketCard } from './simple-market-card';
import { MarketChart } from './market-chart';
import { ComprehensiveMarketDetails } from './comprehensive-market-details';

interface MarketDetailModalProps {
  market: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MarketDetailModal({ market, isOpen, onClose }: MarketDetailModalProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'details'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Generate platform-specific URL for trading
  const getTradingUrl = (market: any) => {
    if (!market) return '#';
    
    // First, try to use externalUrl if it exists (most reliable)
    if (market.externalUrl) {
      return market.externalUrl;
    }
    
    switch (market.platform) {
      case 'polymarket':
        // Use slug if available
        if (market.slug) {
          return `https://polymarket.com/market/${market.slug}`;
        }
        
        // Fallback: use the raw market ID (without polymarket_ prefix)
        const rawId = market.id.replace(/^polymarket_/, '');
        return `https://polymarket.com/market/${rawId}`;
        
      case 'other': // Polkamarkets uses 'other' platform
      case 'polkamarkets':
        const actualId = market.id.replace(/^polkamarkets-/, '');
        return `https://polkamarkets.com/market/${actualId}`;
        
      case 'limitlesslabs':
        if (market.slug) return `https://limitless.exchange/market/${market.slug}`;
        return '#';
        
      default:
        return '#';
    }
  };

  const tradingUrl = getTradingUrl(market);

  // Fetch price history when market or time range changes
  useEffect(() => {
    if (market && isOpen) {
      fetchPriceHistory();
    }
  }, [market, isOpen, selectedTimeRange]);

  const fetchPriceHistory = async () => {
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
      console.log('🔍 Fetching price history for market:', market.id, 'platform:', market.platform);
      
      // Determine the correct API endpoint based on platform
      let apiEndpoint = '/api/polymarket';
      if (market.platform === 'other' || market.platform === 'polkamarkets') {
        apiEndpoint = '/api/polkamarkets';
      }
      
      // Fetch price history from the appropriate API with time range
      const response = await fetch(`${apiEndpoint}?endpoint=price-history&marketId=${market.id}&timeRange=${selectedTimeRange}&limit=500`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 Price history data received:', data.length, 'data points');
      
      setChartData(data);
    } catch (err) {
      console.error('Error fetching price history:', err);
      setError('Failed to load price history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !market) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {market.platform === 'polymarket' ? 'P' : 'P'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Market Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time data and price history
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Trade Button */}
              <a
                href={tradingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Trade on {market.platform === 'polymarket' ? 'Polymarket' : market.platform === 'limitlesslabs' ? 'LimitlessLabs' : 'Polkamarkets'}
              </a>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* View Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeView === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveView('details')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeView === 'details'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔍 Detailed Analysis
              </button>
            </div>

            {activeView === 'overview' ? (
              <>
                {/* Market Card */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <SimpleMarketCard market={market} />
                </div>

                {/* Chart Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Price History Chart
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={fetchPriceHistory}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    {loading && chartData.length === 0 ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading price history...</p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Failed to Load Chart
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                          <button
                            onClick={fetchPriceHistory}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MarketChart 
                        data={chartData} 
                        market={market}
                        loading={loading}
                        onTimeRangeChange={setSelectedTimeRange}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Comprehensive Market Details */}
                <ComprehensiveMarketDetails marketId={market.id} market={market} />
              </>
            )}

          </div>

          {/* Footer with Trade Button */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ready to trade? Click to open this market on {market.platform === 'polymarket' ? 'Polymarket' : 'Polkamarkets'}
              </div>
              <a
                href={tradingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open on {market.platform === 'polymarket' ? 'Polymarket' : 'Polkamarkets'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
