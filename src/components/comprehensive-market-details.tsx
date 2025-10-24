'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface ComprehensiveMarketDetailsProps {
  marketId: string;
  market: any;
}

interface MarketDetailsData {
  currentPrices: { yes: number; no: number; lastTradePrice: number };
  volume: { total: number; volume24h: number; volume7d: number; volume30d: number; allTime: number };
  liquidity: { total: number; amm: number; clob: number; depth: { yes: number; no: number } };
  trading: { bid: number; ask: number; spread: number; lastTradeTime: string; tradeCount: number; uniqueTraders: number };
  priceChanges: { [key: string]: number };
  statistics: { marketCap: number; openInterest: number; fundingRate: number; volatility: number; sharpeRatio: number };
  orderBook: { bids: Array<{ price: number; size: number }>; asks: Array<{ price: number; size: number }> };
  recentTrades: Array<{ id: string; price: number; size: number; side: string; timestamp: string; trader: string }>;
  sentiment: { bullish: number; bearish: number; neutral: number };
  riskMetrics: { maxDrawdown: number; var95: number; beta: number; correlation: { bitcoin: number; ethereum: number; market: number } };
  events: Array<{ type: string; description: string; timestamp: string; impact: string }>;
  resolution: { status: string; estimatedResolution: string; resolutionSource: string; resolutionCriteria: string; disputePeriod: string };
  platform: { name: string; fee: number; minimumTrade: number; maximumTrade: number; supportedTokens: string[] };
  metadata: { tags: string[]; featured: boolean; verified: boolean; socialShares: number; watchlistCount: number };
}

export function ComprehensiveMarketDetails({ marketId, market }: ComprehensiveMarketDetailsProps) {
  const [details, setDetails] = useState<MarketDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Generate platform-specific URL for trading
  const getTradingUrl = (marketId: string, platform: string) => {
    // First, try to use externalUrl if it exists (most reliable)
    if (market?.externalUrl) {
      return market.externalUrl;
    }
    
    switch (platform) {
      case 'polymarket':
        // Use slug if available
        if (market?.slug) {
          return `https://polymarket.com/market/${market.slug}`;
        }
        
        // Fallback: use the raw market ID (without polymarket_ prefix)
        const rawId = marketId.replace(/^polymarket_/, '');
        return `https://polymarket.com/market/${rawId}`;
        
      case 'other': // Polkamarkets uses 'other' platform
      case 'polkamarkets':
        const actualId = marketId.replace(/^polkamarkets-/, '');
        return `https://polkamarkets.com/market/${actualId}`;
        
      case 'limitlesslabs':
        const limitlessId = marketId.replace(/^limitlesslabs_/, '');
        return limitlessId ? `https://limitless.exchange/advanced/markets/${limitlessId}` : '#';
        
      default:
        return '#';
    }
  };

  const tradingUrl = getTradingUrl(marketId, market.platform);

  useEffect(() => {
    fetchMarketDetails();
  }, [marketId]);

  const fetchMarketDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine the correct API endpoint based on platform
      let apiEndpoint = '/api/polymarket';
      if (market.platform === 'other') {
        apiEndpoint = '/api/polkamarkets';
      }
      
      const response = await fetch(`${apiEndpoint}?endpoint=market-details&marketId=${marketId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      console.error('Error fetching market details:', err);
      setError('Failed to load market details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${(num * 100).toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'trading', label: 'Trading', icon: '📈' },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
    { id: 'risk', label: 'Risk', icon: '⚠️' },
    { id: 'events', label: 'Events', icon: '📰' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading comprehensive market data...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchMarketDetails}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trade Button Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Ready to Trade?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Open this market on {market.platform === 'polymarket' ? 'Polymarket' : 'Myriad'} to buy or sell positions
            </p>
          </div>
          <a
            href={tradingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Trade on {market.platform === 'polymarket' ? 'Polymarket' : 'Myriad'}
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Volume 24h</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ${formatCurrency(details.volume.volume24h)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {formatPercentage(details.priceChanges['24h'])}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Liquidity</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${formatCurrency(details.liquidity.total)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                AMM: ${formatCurrency(details.liquidity.amm)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Traders</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {details.trading.uniqueTraders}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                {details.trading.tradeCount} trades
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Volatility</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {(details.statistics.volatility * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Sharpe: {details.statistics.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Current Prices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Prices</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yes</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${details.currentPrices.yes.toFixed(4)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">No</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${details.currentPrices.no.toFixed(4)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Trade</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${details.currentPrices.lastTradePrice.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Volume Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Volume Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(details.volume).map(([period, amount]) => (
                <div key={period} className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {period.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formatCurrency(amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trading' && (
        <div className="space-y-6">
          {/* Order Book */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Book</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bids</div>
                {details.orderBook.bids.map((bid, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-red-600 dark:text-red-400 font-mono">
                      ${bid.price.toFixed(4)}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {bid.size.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Asks</div>
              <div className="space-y-2">
                {details.orderBook.asks.map((ask, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-green-600 dark:text-green-400 font-mono">
                      ${ask.price.toFixed(4)}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {ask.size.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trades</h3>
            <div className="space-y-2">
              {details.recentTrades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-mono text-gray-900 dark:text-white">
                      ${trade.price.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {trade.size.toFixed(2)} • {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bid/Ask Spread</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${details.trading.spread.toFixed(4)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Trades</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {details.trading.tradeCount}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unique Traders</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {details.trading.uniqueTraders}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Trade</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(details.trading.lastTradeTime).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Price Changes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Changes</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(details.priceChanges).map(([period, change]) => (
                <div key={period} className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{period}</div>
                  <div className={`text-lg font-semibold ${getChangeColor(change)}`}>
                    {formatPercentage(change)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Sentiment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bullish</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${details.sentiment.bullish * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(details.sentiment.bullish * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${details.sentiment.neutral * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(details.sentiment.neutral * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bearish</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${details.sentiment.bearish * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(details.sentiment.bearish * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${formatCurrency(details.statistics.marketCap)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Interest</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${formatCurrency(details.statistics.openInterest)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Funding Rate</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(details.statistics.fundingRate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {(details.riskMetrics.maxDrawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">VaR 95%</div>
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {(details.riskMetrics.var95 * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beta</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {details.riskMetrics.beta.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correlation Analysis</h3>
            <div className="space-y-3">
              {Object.entries(details.riskMetrics.correlation).map(([asset, correlation]) => (
                <div key={asset} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{asset}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${correlation > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(correlation) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {correlation.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Market Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Events</h3>
            <div className="space-y-4">
              {details.events.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.impact === 'positive' ? 'bg-green-500' :
                    event.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resolution Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {details.resolution.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(details.resolution.estimatedResolution).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Data Source</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {details.resolution.resolutionSource}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Criteria</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {details.resolution.resolutionCriteria}
                </span>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trading Fee</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(details.platform.fee * 100).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Trade</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${details.platform.minimumTrade}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Trade</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${formatCurrency(details.platform.maximumTrade)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tokens</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {details.platform.supportedTokens.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
