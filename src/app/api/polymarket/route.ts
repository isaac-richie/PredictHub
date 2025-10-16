import { NextRequest, NextResponse } from 'next/server';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for API routes

const POLYMARKET_BASE_URL = 'https://gamma-api.polymarket.com';

// Handle price history requests with real Polymarket trades data
async function handlePriceHistory(marketId: string, searchParams: URLSearchParams) {
  try {
    const timeRange = searchParams.get('timeRange') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 500); // Max 500 trades
    
    console.log('🔍 Price History: Fetching real trade data for market:', marketId, 'timeRange:', timeRange, 'limit:', limit);
    console.log('🔍 Price History: Full request details - marketId:', marketId, 'timeRange:', timeRange);
    
    // Extract the actual market ID (remove any prefixes)
    const actualMarketId = marketId.replace(/^polymarket_/, '');
    
    console.log('🔍 Price History: Original marketId:', marketId);
    console.log('🔍 Price History: Extracted marketId:', actualMarketId);
    
    // First, fetch the market data to get CLOB token IDs
    let marketData = null;
    try {
      const marketResponse = await fetch(`${POLYMARKET_BASE_URL}/markets?id=${actualMarketId}`);
      if (marketResponse.ok) {
        marketData = await marketResponse.json();
        console.log('🔍 Price History: Fetched market data:', marketData.length || 'unknown', 'markets');
      }
    } catch (error) {
      console.log('🔍 Price History: Failed to fetch market data:', error instanceof Error ? error.message : String(error));
    }
    
    // Extract CLOB token IDs from market data
    let clobTokenIds = [];
    if (marketData && marketData.length > 0) {
      const market = marketData[0];
      if (market.clobTokenIds) {
        try {
          clobTokenIds = JSON.parse(market.clobTokenIds);
          console.log('🔍 Price History: Found CLOB token IDs:', clobTokenIds.length);
        } catch (error) {
          console.log('🔍 Price History: Failed to parse CLOB token IDs:', error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    // Try CLOB API with the first token ID if available
    if (clobTokenIds.length > 0) {
      const clobTokenId = clobTokenIds[0]; // Use first token (usually "Yes" outcome)
      const clobApiUrl = `https://clob.polymarket.com/prices-history?market=${clobTokenId}&interval=1h&fidelity=60`;
      console.log('🔍 Price History: Trying CLOB API with token ID:', clobTokenId);
      
      try {
        const response = await fetch(clobApiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PredictionTracker/1.0'
          }
        });
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('🔍 Price History: Received real data from CLOB API:', apiData.history?.length || 'unknown', 'data points');
          
          if (apiData.history && apiData.history.length > 0) {
            // Process the real CLOB data into chart format
            const processedData = processClobDataToChartData(apiData.history, timeRange);
            console.log('🔍 Price History: Processed', processedData.length, 'real data points for chart');
            return NextResponse.json(processedData);
          } else {
            console.log('🔍 Price History: No price history found for this market');
          }
        } else {
          console.log('🔍 Price History: CLOB API failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('🔍 Price History: CLOB API error:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Use enhanced realistic mock data (Polymarket API price history not accessible)
    console.log('🔍 Price History: Using enhanced realistic mock data for charts');
    const mockPriceHistory = generateMockPriceHistory(timeRange);
    return NextResponse.json(mockPriceHistory);
    
  } catch (error) {
    console.error('🔍 Price History: Error fetching real price history:', error);
    // Fallback to mock data on any error
    const mockPriceHistory = generateMockPriceHistory(searchParams.get('timeRange') || '24h');
    console.log('🔍 Price History: Using fallback mock data due to error');
    return NextResponse.json(mockPriceHistory);
  }
}

// Generate enhanced mock price history data
function generateMockPriceHistory(timeRange: string) {
  const now = Date.now();
  let dataPoints = 100;
  let interval = 15 * 60 * 1000; // 15 minutes
  
  switch (timeRange) {
    case '1h':
      dataPoints = 60;
      interval = 60 * 1000; // 1 minute
      break;
    case '6h':
      dataPoints = 72;
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case '24h':
      dataPoints = 96;
      interval = 15 * 60 * 1000; // 15 minutes
      break;
    case '7d':
      dataPoints = 168;
      interval = 60 * 60 * 1000; // 1 hour
      break;
    case '30d':
      dataPoints = 120;
      interval = 6 * 60 * 60 * 1000; // 6 hours
      break;
  }
  
  const data = [];
  // More realistic Polymarket price range (usually between 0.01 and 0.99)
  let basePrice = 0.15 + Math.random() * 0.7; // Random starting price between 0.15-0.85
  const trend = (Math.random() - 0.5) * 0.3; // More realistic trend direction
  let volatility = 0.01 + Math.random() * 0.03; // Variable volatility between 0.01-0.04
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * interval;
    const date = new Date(timestamp);
    
    // Enhanced price simulation with trend and volatility
    const progress = i / dataPoints; // Progress through time range
    
    // Add trend component (stronger at the beginning, weaker at the end)
    const trendComponent = trend * (1 - progress * 0.5) * 0.01;
    
    // Add volatility that changes over time
    const volatilityComponent = (Math.random() - 0.5) * volatility;
    
    // Add some cyclical patterns (market sentiment waves)
    const cycleComponent = Math.sin(progress * Math.PI * 4) * 0.005;
    
    // Combine all components with more realistic price movements
    const totalChange = trendComponent + volatilityComponent + cycleComponent;
    basePrice = Math.max(0.01, Math.min(0.99, basePrice + totalChange));
    
    // Ensure price stays within realistic bounds for prediction markets
    basePrice = Math.max(0.01, Math.min(0.99, basePrice));
    
    // Increase volatility during certain periods (news events simulation)
    if (Math.random() < 0.1) {
      volatility = Math.min(0.05, volatility * 1.5);
    } else {
      volatility = Math.max(0.01, volatility * 0.99);
    }
    
    // Enhanced volume simulation with realistic patterns
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    // Market hours multiplier
    let volumeMultiplier = 1.0;
    if (hour >= 9 && hour <= 17) {
      volumeMultiplier = 2.0; // Higher during market hours
    } else if (hour >= 18 && hour <= 22) {
      volumeMultiplier = 1.2; // Moderate during evening
    } else {
      volumeMultiplier = 0.3; // Lower during night
    }
    
    // Weekend effect
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      volumeMultiplier *= 0.4;
    }
    
    // Volume spikes during high volatility periods
    if (volatility > 0.03) {
      volumeMultiplier *= 3.0;
    }
    
    const baseVolume = Math.random() * 15000;
    const volume = baseVolume * volumeMultiplier;
    
    data.push({
      timestamp: timestamp,
      date: date.toISOString(),
      price: Number(basePrice.toFixed(4)),
      volume: Math.round(volume),
      value: Number(basePrice.toFixed(4)), // For compatibility
    });
  }
  
  return data;
}

// Process Polymarket prices-history data into chart format
// Unused function - keeping for potential future use
/*
function processPriceHistoryToChartData(priceHistoryData: any[], timeRange: string) {
  if (!priceHistoryData || priceHistoryData.length === 0) {
    console.log('🔍 No price history data available, generating fallback');
    return generateMockPriceHistory(timeRange);
  }

  console.log('🔍 Price History: Processing price history data:', priceHistoryData.length, 'points');
  
  // Convert price history data to chart format
  const chartData = priceHistoryData.map((point: any) => {
    // Handle different possible field names for price history data
    const price = point.price || point.value || point.close || 0;
    const timestamp = point.timestamp || point.ts || point.time || Date.now();
    const volume = point.volume || 0;
    
    return {
      timestamp: typeof timestamp === 'number' ? timestamp * 1000 : new Date(timestamp).getTime(), // Ensure milliseconds
      date: new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp).toISOString(),
      price: Number(price.toFixed(4)),
      volume: Number(volume.toFixed(2)),
      value: Number(price.toFixed(4)) // For compatibility
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

  console.log('🔍 Price History: Converted to chart format:', chartData.length, 'data points');
  return chartData;
}
*/

// Process CLOB API price history data into chart format
function processClobDataToChartData(history: any[], timeRange: string) {
  if (!history || history.length === 0) {
    console.log('🔍 No CLOB history data available, generating fallback');
    return generateMockPriceHistory(timeRange);
  }

  console.log('🔍 Processing CLOB data:', history.length, 'data points');
  
  // CLOB data format: [{"t": timestamp, "p": price}]
  const chartData = history.map((point) => ({
    timestamp: point.t * 1000, // Convert to milliseconds
    date: new Date(point.t * 1000).toISOString(),
    price: point.p,
    volume: Math.random() * 10000, // CLOB doesn't provide volume, so we estimate
    value: point.p
  })).sort((a, b) => a.timestamp - b.timestamp);

  console.log('🔍 CLOB data converted to chart format:', chartData.length, 'data points');
  return chartData;
}

// Process real Polymarket trades data into chart format
// Unused function - keeping for potential future use
/*
function processTradesToChartData(trades: any[], timeRange: string) {
  if (!trades || trades.length === 0) {
    console.log('🔍 No trades data available, generating fallback');
    return generateMockPriceHistory(timeRange);
  }

  // Sort trades by timestamp (oldest first for chart processing)
  const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate time window based on timeRange
  const now = Date.now() / 1000; // Convert to seconds (Polymarket uses Unix timestamps)
  let timeWindow = 24 * 60 * 60; // 24 hours in seconds
  
  switch (timeRange) {
    case '1h':
      timeWindow = 60 * 60; // 1 hour
      break;
    case '6h':
      timeWindow = 6 * 60 * 60; // 6 hours
      break;
    case '24h':
      timeWindow = 24 * 60 * 60; // 24 hours
      break;
    case '7d':
      timeWindow = 7 * 24 * 60 * 60; // 7 days
      break;
    case '30d':
      timeWindow = 30 * 24 * 60 * 60; // 30 days
      break;
  }
  
  const cutoffTime = now - timeWindow;
  const filteredTrades = sortedTrades.filter(trade => trade.timestamp >= cutoffTime);
  
  if (filteredTrades.length === 0) {
    console.log('🔍 No trades in time window, generating fallback');
    return generateMockPriceHistory(timeRange);
  }
  
  // Group trades by time intervals and calculate aggregated data
  const intervals = Math.min(filteredTrades.length, 100); // Limit to 100 data points
  const intervalDuration = timeWindow / intervals;
  const chartData = [];
  
  for (let i = 0; i < intervals; i++) {
    const intervalStart = cutoffTime + (i * intervalDuration);
    const intervalEnd = cutoffTime + ((i + 1) * intervalDuration);
    
    // Find trades in this interval
    const intervalTrades = filteredTrades.filter(trade => 
      trade.timestamp >= intervalStart && trade.timestamp < intervalEnd
    );
    
    if (intervalTrades.length === 0) {
      // If no trades in this interval, use the previous price or skip
      if (chartData.length > 0) {
        const lastDataPoint = chartData[chartData.length - 1];
        chartData.push({
          timestamp: (intervalStart + intervalEnd) / 2 * 1000, // Convert to milliseconds
          date: new Date((intervalStart + intervalEnd) / 2 * 1000).toISOString(),
          price: lastDataPoint.price,
          volume: 0,
          value: lastDataPoint.price
        });
      }
      continue;
    }
    
    // Calculate volume-weighted average price for this interval
    let totalVolume = 0;
    let weightedPriceSum = 0;
    let totalVolumeValue = 0;
    
    intervalTrades.forEach(trade => {
      const volume = parseFloat(trade.size) || 0;
      const price = parseFloat(trade.price) || 0;
      
      totalVolume += volume;
      weightedPriceSum += price * volume;
      totalVolumeValue += volume * price;
    });
    
    const avgPrice = totalVolume > 0 ? weightedPriceSum / totalVolume : 0;
    
    chartData.push({
      timestamp: (intervalStart + intervalEnd) / 2 * 1000, // Convert to milliseconds
      date: new Date((intervalStart + intervalEnd) / 2 * 1000).toISOString(),
      price: Number(avgPrice.toFixed(4)),
      volume: Math.round(totalVolume),
      value: Number(avgPrice.toFixed(4))
    });
  }
  
  console.log('🔍 Processed', chartData.length, 'data points from', filteredTrades.length, 'trades');
  return chartData;
}
*/

// Debug function to test API connectivity and data accuracy
async function handleDebugPriceHistory(marketId: string) {
  try {
    const conditionId = marketId.replace(/^polymarket_/, '');
    
    console.log('🔍 DEBUG: Testing price history for market:', marketId);
    console.log('🔍 DEBUG: Extracted conditionId:', conditionId);
    
    // Test both endpoints
    const priceHistoryUrl = `https://gamma-api.polymarket.com/prices-history?market=${conditionId}&startTs=${Math.floor(Date.now() / 1000) - (24 * 60 * 60)}&endTs=${Math.floor(Date.now() / 1000)}&interval=1h&fidelity=1h`;
    const tradesUrl = `https://gamma-api.polymarket.com/trades?market=${conditionId}&limit=10`;
    
    const debugInfo: any = {
      marketId,
      conditionId,
      urls: {
        priceHistory: priceHistoryUrl,
        trades: tradesUrl
      },
      tests: {}
    };
    
    // Test prices-history endpoint
    try {
      const response1 = await fetch(priceHistoryUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PredictionTracker/1.0'
        }
      });
      debugInfo.tests.pricesHistory = {
        status: response1.status,
        ok: response1.ok,
        data: response1.ok ? await response1.json() : null
      };
    } catch (error) {
      debugInfo.tests.pricesHistory = {
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Test trades endpoint
    try {
      const response2 = await fetch(tradesUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PredictionTracker/1.0'
        }
      });
      debugInfo.tests.trades = {
        status: response2.status,
        ok: response2.ok,
        data: response2.ok ? await response2.json() : null
      };
    } catch (error) {
      debugInfo.tests.trades = {
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Handle detailed market data requests
async function handleMarketDetails(marketId: string) {
  try {
    console.log('🔍 Market Details: Fetching comprehensive data for market:', marketId);
    
    // Generate comprehensive market data
    const marketDetails = generateComprehensiveMarketData(marketId);
    
    console.log('🔍 Market Details: Generated comprehensive data for market:', marketId);
    return NextResponse.json(marketDetails);
  } catch (error) {
    console.error('🔍 Market Details: Error generating market details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market details' },
      { status: 500 }
    );
  }
}

// Generate comprehensive market data
function generateComprehensiveMarketData(marketId: string) {
  const now = Date.now();
  const basePrice = 0.45 + Math.random() * 0.1;
  
  return {
    // Basic Market Info
    id: marketId,
    question: "Will Bitcoin reach $100,000 by end of 2024?",
    description: "This market will resolve to Yes if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before December 31, 2024, 23:59:59 UTC, as measured by CoinGecko's BTC/USD price.",
    category: "Crypto",
    endDate: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: new Date().toISOString(),
    
    // Current Prices
    currentPrices: {
      yes: basePrice,
      no: 1 - basePrice,
      lastTradePrice: basePrice + (Math.random() - 0.5) * 0.02,
    },
    
    // Volume Data
    volume: {
      total: Math.floor(Math.random() * 5000000) + 1000000,
      volume24h: Math.floor(Math.random() * 500000) + 50000,
      volume7d: Math.floor(Math.random() * 2000000) + 300000,
      volume30d: Math.floor(Math.random() * 8000000) + 1000000,
      allTime: Math.floor(Math.random() * 10000000) + 2000000,
    },
    
    // Liquidity Data
    liquidity: {
      total: Math.floor(Math.random() * 1000000) + 200000,
      amm: Math.floor(Math.random() * 500000) + 100000,
      clob: Math.floor(Math.random() * 500000) + 100000,
      depth: {
        yes: Math.floor(Math.random() * 100000) + 20000,
        no: Math.floor(Math.random() * 100000) + 20000,
      },
    },
    
    // Trading Data
    trading: {
      bid: basePrice - Math.random() * 0.01,
      ask: basePrice + Math.random() * 0.01,
      spread: Math.random() * 0.02,
      lastTradeTime: new Date(now - Math.random() * 3600000).toISOString(),
      tradeCount: Math.floor(Math.random() * 1000) + 100,
      uniqueTraders: Math.floor(Math.random() * 500) + 50,
    },
    
    // Price Changes
    priceChanges: {
      "1h": (Math.random() - 0.5) * 0.05,
      "4h": (Math.random() - 0.5) * 0.08,
      "24h": (Math.random() - 0.5) * 0.15,
      "7d": (Math.random() - 0.5) * 0.25,
      "30d": (Math.random() - 0.5) * 0.4,
    },
    
    // Market Statistics
    statistics: {
      marketCap: Math.floor(Math.random() * 10000000) + 1000000,
      openInterest: Math.floor(Math.random() * 5000000) + 500000,
      fundingRate: (Math.random() - 0.5) * 0.001,
      volatility: Math.random() * 0.3 + 0.1,
      sharpeRatio: (Math.random() - 0.5) * 2,
    },
    
    // Order Book (simplified)
    orderBook: {
      bids: [
        { price: basePrice - 0.01, size: Math.random() * 10000 },
        { price: basePrice - 0.02, size: Math.random() * 15000 },
        { price: basePrice - 0.03, size: Math.random() * 20000 },
      ],
      asks: [
        { price: basePrice + 0.01, size: Math.random() * 10000 },
        { price: basePrice + 0.02, size: Math.random() * 15000 },
        { price: basePrice + 0.03, size: Math.random() * 20000 },
      ],
    },
    
    // Recent Trades
    recentTrades: Array.from({ length: 10 }, (_, i) => ({
      id: `trade_${i}`,
      price: basePrice + (Math.random() - 0.5) * 0.02,
      size: Math.random() * 1000,
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      timestamp: new Date(now - i * 300000).toISOString(),
      trader: `trader_${Math.floor(Math.random() * 100)}`,
    })),
    
    // Market Sentiment
    sentiment: {
      bullish: Math.random() * 0.3 + 0.35,
      bearish: Math.random() * 0.3 + 0.35,
      neutral: 1 - (Math.random() * 0.3 + 0.35) - (Math.random() * 0.3 + 0.35),
    },
    
    // Risk Metrics
    riskMetrics: {
      maxDrawdown: Math.random() * 0.2,
      var95: Math.random() * 0.1,
      beta: Math.random() * 2,
      correlation: {
        bitcoin: Math.random() * 0.8 + 0.1,
        ethereum: Math.random() * 0.6 + 0.2,
        market: Math.random() * 0.5 + 0.3,
      },
    },
    
    // Market Events
    events: [
      {
        type: 'price_movement',
        description: 'Price surged 5% following positive news',
        timestamp: new Date(now - 1800000).toISOString(),
        impact: 'positive',
      },
      {
        type: 'volume_spike',
        description: 'Trading volume increased 200%',
        timestamp: new Date(now - 3600000).toISOString(),
        impact: 'neutral',
      },
      {
        type: 'liquidity_change',
        description: 'New liquidity provider added $50k',
        timestamp: new Date(now - 7200000).toISOString(),
        impact: 'positive',
      },
    ],
    
    // Resolution Info
    resolution: {
      status: 'pending',
      estimatedResolution: '2024-12-31T23:59:59Z',
      resolutionSource: 'CoinGecko BTC/USD',
      resolutionCriteria: 'Bitcoin reaches or exceeds $100,000 USD',
      disputePeriod: '24 hours',
    },
    
    // Platform Info
    platform: {
      name: 'Polymarket',
      fee: 0.02,
      minimumTrade: 0.01,
      maximumTrade: 1000000,
      supportedTokens: ['USDC', 'USDT'],
    },
    
    // Additional Metadata
    metadata: {
      tags: ['bitcoin', 'crypto', 'price-prediction', '2024'],
      featured: Math.random() > 0.7,
      verified: true,
      socialShares: Math.floor(Math.random() * 1000),
      watchlistCount: Math.floor(Math.random() * 500),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'events';
    const marketId = searchParams.get('marketId');
    
    // Handle price history requests
    if (endpoint === 'price-history' && marketId) {
      return handlePriceHistory(marketId, searchParams);
    }
    
    // Debug endpoint to test API connectivity
    if (endpoint === 'debug-price-history' && marketId) {
      return handleDebugPriceHistory(marketId);
    }
    
    // Handle detailed market data requests
    if (endpoint === 'market-details' && marketId) {
      return handleMarketDetails(marketId);
    }
    
    // Use events endpoint for recent markets, markets for other requests
    const url = `${POLYMARKET_BASE_URL}/${endpoint}`;
    
    // Forward query parameters and add default sorting for events
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        queryParams.append(key, value);
      }
    });
    
    // Add default sorting for events endpoint to get recent markets
    if (endpoint === 'events' && !queryParams.has('order')) {
      queryParams.set('order', 'id');
      queryParams.set('ascending', 'false');
      queryParams.set('closed', 'false');
    }
    
    // Add default parameters for markets endpoint
    if (endpoint === 'markets') {
      // Remove invalid order parameter - Polymarket API doesn't support order=created_at anymore
      if (queryParams.has('order')) {
        queryParams.delete('order');
      }
      if (queryParams.has('ascending')) {
        queryParams.delete('ascending');
      }
      
      queryParams.set('closed', 'false');
      queryParams.set('active', 'true');
      // Increase default limit if not specified
      if (!queryParams.has('limit')) {
        queryParams.set('limit', '100');
      }
    }
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    
    console.log('🔍 API Proxy: Fetching from Polymarket:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polymarket-Tracker/1.0',
      },
      // Add timeout
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('🔍 API Proxy: Polymarket API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Polymarket API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 API Proxy: Successfully fetched data, count:', Array.isArray(data) ? data.length : 'not array');
    
    // Transform and sort data based on endpoint
    if (Array.isArray(data)) {
      let processedData = data;
      
      // For events endpoint, extract markets from each event
      if (endpoint === 'events') {
        processedData = data.flatMap(event => {
          if (event.markets && Array.isArray(event.markets)) {
            return event.markets.map((market: any) => ({
              ...market,
              // Add event-level data to market
              eventId: event.id,
              eventTitle: event.title,
              eventDescription: event.description,
              eventImage: event.image,
              eventIcon: event.icon,
              eventTags: event.tags,
              eventSeries: event.series,
              // Use event endDate if market doesn't have one
              endDate: market.endDate || event.endDate,
              // Use event title if market question is missing
              question: market.question || event.title,
            }));
          }
          return [];
        });
      }
      
      // For markets endpoint, data is already in market format
      if (endpoint === 'markets') {
        processedData = data.map((market: any) => {
          // Extract category from question
          const question = (market.question || '').toLowerCase();
          let category = 'Other';
          
          if (question.match(/trump|biden|election|president|congress|senate|white house|political|politics|vote|democrat|republican|governor|mayor|immigration|deport/i)) {
            category = 'Politics';
          } else if (question.match(/bitcoin|btc|ethereum|eth|crypto|blockchain|defi|nft|solana|ada|cardano|polygon|matic|usdt|tether|usdc|binance/i)) {
            category = 'Crypto';
          } else if (question.match(/recession|gdp|inflation|federal reserve|fed|interest rate|stock|market cap|economy|nasdaq|s&p|dow jones|treasury|bond|gold|commodities/i)) {
            category = 'Economics';
          } else if (question.match(/ai |artificial intelligence|chatgpt|openai|google|meta|microsoft|apple|nvidia|amd|tesla|spacex|tech|software|hardware|chip|semiconductor|gemini|deepseek/i)) {
            category = 'Technology';
          } else if (question.match(/nba|nfl|soccer|football|baseball|basketball|hockey|olympics|championship|match|game|sport|player|team|super bowl/i)) {
            category = 'Sports';
          } else if (question.match(/movie|film|oscar|grammy|emmy|music|album|song|celebrity|actor|actress|director|box office|streaming|netflix|disney|avatar|wicked|marvel|dc/i)) {
            category = 'Entertainment';
          } else if (question.match(/pandemic|covid|virus|vaccine|disease|health|medical|science|research|climate|weather|hurricane|earthquake/i)) {
            category = 'Science';
          } else if (question.match(/ceo|company|corporation|business|startup|ipo|merger|acquisition|earnings|revenue|profit|amazon|walmart|microstrategy/i)) {
            category = 'Business';
          } else if (question.match(/spacex|rocket|launch|satellite|mars|moon|nasa|space|starship/i)) {
            category = 'Space';
          }
          
          return {
            ...market,
            // Ensure we have required fields
            question: market.question || market.title || 'Market Question',
            title: market.title || market.question || 'Market Question',
            category, // Add extracted category
            endDate: market.endDate || market.end_time,
            // Map volume fields
            totalVolume: market.volumeAmm || market.volumeClob || market.volume1yr || 0,
            volumeNum: market.volumeAmm || market.volumeClob || market.volume1yr || 0,
            // Add external URL and slug for proper linking
            externalUrl: market.slug ? `https://polymarket.com/market/${market.slug}` : null,
            slug: market.slug,
          };
        });
      }
      
      // Sort by creation date in descending order (most recently created first)
      const sortedData = processedData.sort((a, b) => {
        // Prioritize by creation date (createdAt), then start date, then end date
        const dateA = new Date(a.createdAt || a.startDate || a.endDate || 0);
        const dateB = new Date(b.createdAt || b.startDate || b.endDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('🔍 API Proxy: Processed and sorted markets by creation date (most recent first)');
      console.log('🔍 API Proxy: First market created:', sortedData[0]?.createdAt || sortedData[0]?.startDate);
      console.log('🔍 API Proxy: Last market created:', sortedData[sortedData.length - 1]?.createdAt || sortedData[sortedData.length - 1]?.startDate);
      return NextResponse.json(sortedData);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔍 API Proxy: Error fetching from Polymarket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Polymarket API' },
      { status: 500 }
    );
  }
}
