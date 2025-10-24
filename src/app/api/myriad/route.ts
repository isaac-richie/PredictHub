import { NextRequest, NextResponse } from 'next/server';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for API routes

const MYRIAD_BASE_URL = 'https://api.myriad.social';

// Generate end date based on timeframe
function generateEndDateBasedOnTimeframe(timeframe: string): string {
  const now = Date.now();
  
  switch (timeframe) {
    case '24h':
      // Markets closing within 24 hours or recently started
      return new Date(now + Math.random() * 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      // Markets closing within 7 days
      return new Date(now + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      // Markets closing within 30 days
      return new Date(now + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'future':
      // Future predictions (1-6 months out)
      return new Date(now + (30 + Math.random() * 150) * 24 * 60 * 60 * 1000).toISOString();
    case 'trending':
      // Mix of short-term and medium-term trending markets
      const days = Math.random() < 0.3 ? Math.random() * 7 : Math.random() * 90;
      return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
    default:
      // General mix of all timeframes
      return new Date(now + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// Handle price history requests
async function handlePriceHistory(marketId: string, searchParams: URLSearchParams) {
  try {
    const timeRange = searchParams.get('timeRange') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 500);

    console.log('🔍 Myriad Price History: Fetching data for market:', marketId, 'timeRange:', timeRange, 'limit:', limit);

    // For now, generate mock price history data since we don't have the exact API structure
    const mockPriceHistory = generateMockPriceHistory(timeRange);
    console.log('🔍 Myriad Price History: Generated mock data with', mockPriceHistory.length, 'data points');
    
    return NextResponse.json(mockPriceHistory);
  } catch (error) {
    console.error('🔍 Myriad Price History: Error generating price history:', error);
    const mockPriceHistory = generateMockPriceHistory(searchParams.get('timeRange') || '24h');
    return NextResponse.json(mockPriceHistory);
  }
}

// Handle detailed market data requests
async function handleMarketDetails(marketId: string) {
  try {
    console.log('🔍 Myriad Market Details: Fetching comprehensive data for market:', marketId);

    // Generate comprehensive market data
    const marketDetails = generateComprehensiveMarketData(marketId);

    console.log('🔍 Myriad Market Details: Generated comprehensive data for market:', marketId);
    return NextResponse.json(marketDetails);
  } catch (error) {
    console.error('🔍 Myriad Market Details: Error generating market details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market details' },
      { status: 500 }
    );
  }
}

// Generate mock price history data
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
  let basePrice = 0.45 + Math.random() * 0.1; // Random starting price
  const trend = (Math.random() - 0.5) * 0.3;
  let volatility = 0.01 + Math.random() * 0.03;

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * interval;
    const date = new Date(timestamp);

    // Enhanced price simulation
    const progress = i / dataPoints;
    const trendComponent = trend * (1 - progress * 0.5) * 0.01;
    const volatilityComponent = (Math.random() - 0.5) * volatility;
    const cycleComponent = Math.sin(progress * Math.PI * 4) * 0.005;

    const totalChange = trendComponent + volatilityComponent + cycleComponent;
    basePrice = Math.max(0.01, Math.min(0.99, basePrice + totalChange));

    // Increase volatility during certain periods
    if (Math.random() < 0.1) {
      volatility = Math.min(0.05, volatility * 1.5);
    } else {
      volatility = Math.max(0.01, volatility * 0.99);
    }

    // Enhanced volume simulation
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    let volumeMultiplier = 1.0;
    if (hour >= 9 && hour <= 17) {
      volumeMultiplier = 2.0;
    } else if (hour >= 18 && hour <= 22) {
      volumeMultiplier = 1.2;
    } else {
      volumeMultiplier = 0.3;
    }

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      volumeMultiplier *= 0.4;
    }

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
      value: Number(basePrice.toFixed(4)),
    });
  }

  return data;
}

// Generate comprehensive market data
function generateComprehensiveMarketData(marketId: string) {
  const now = Date.now();
  const basePrice = 0.45 + Math.random() * 0.1;

  // Generate realistic Myriad-style market data
  const categories = ['Crypto', 'Sports', 'Politics', 'Economy', 'Gaming', 'Culture', 'Sentiment'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  const marketQuestions = {
    Crypto: [
      "Will Bitcoin reach $100,000 by end of 2025?",
      "Will Ethereum reach $5,000 by Q2 2025?",
      "Will Solana reach $200 by end of 2025?",
      "Will Cardano reach $2 by Q3 2025?",
    ],
    Sports: [
      "Will Liverpool defeat Man United?",
      "Will the Lakers or the Celtics win their matchup?",
      "Will the Rams or the Jaguars win their game?",
      "Will Arsenal win the Premier League?",
    ],
    Politics: [
      "Will Donald Trump meet with the Pope in 2025?",
      "Will Jerome Powell leave the Fed Chair in 2025?",
      "Will this be the longest government shutdown in US history?",
      "Will Macron vs Owens win the defamation lawsuit?",
    ],
    Economy: [
      "Will the S&P 500 pump to 6900 or dump to 6200?",
      "Exactly two FED rate changes in 2025?",
      "Will the 10-year Treasury yield pump to 4.6% or dump to 4.0%?",
      "Will Bitcoin outperform Gold in 2025?",
    ],
    Gaming: [
      "Chovy vs Knight: Who achieves a higher KDA?",
      "LEC vs LTA: Who goes further?",
      "Will Gen.G go 3:0 in the Swiss Stage?",
      "LCK vs LPL: Who goes further?",
    ],
    Culture: [
      "TIME Person of the Year 2025: Will it be a human?",
      "Oscars 2026: Can 'One Battle After Another' score 9+ nominations?",
      "Will Timothée Chalamet win Best Actor?",
      "Who will play the next Voldemort?",
    ],
    Sentiment: [
      "Fear or Greed?",
      "Up or Down?",
      "Will Trump's approval ratings improve?",
      "Market sentiment: Bullish or Bearish?",
    ],
  };

  const questions = marketQuestions[randomCategory as keyof typeof marketQuestions];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    // Basic Market Info
    id: marketId,
    question: randomQuestion,
    description: `This market will resolve based on the specified criteria. Resolution source: myriad.markets`,
    category: randomCategory,
    endDate: new Date(now + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      volatility: Math.random() * 0.3 + 0.1,
      sharpeRatio: (Math.random() - 0.5) * 2,
    },

    // Order Book
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
      estimatedResolution: new Date(now + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      resolutionSource: 'myriad.markets',
      resolutionCriteria: randomQuestion,
      disputePeriod: '24 hours',
    },

    // Platform Info
    platform: {
      name: 'Myriad Markets',
      fee: 0.02,
      minimumTrade: 0.01,
      maximumTrade: 1000000,
      supportedTokens: ['USDC', 'USDT'],
    },

    // Additional Metadata
    metadata: {
      tags: [randomCategory.toLowerCase(), 'prediction', '2025'],
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
    const endpoint = searchParams.get('endpoint') || 'markets';
    const marketId = searchParams.get('marketId');

    // Handle price history requests
    if (endpoint === 'price-history' && marketId) {
      return handlePriceHistory(marketId, searchParams);
    }

    // Handle detailed market data requests
    if (endpoint === 'market-details' && marketId) {
      return handleMarketDetails(marketId);
    }

    // Generate mock markets data for the main markets endpoint
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 500);
    console.log('🔍 Myriad API: Generating mock markets data for timeframe:', timeframe, 'limit:', limit);

    const categories = ['Crypto', 'Sports', 'Politics', 'Economy', 'Gaming', 'Culture', 'Sentiment'];
    const markets = [];
    
    // Enhanced market count based on timeframe and limit
    const requestedLimit = Math.max(limit, 50);
    let marketCount = Math.min(requestedLimit * 2, 500); // Generate 2x the requested limit, max 500
    
    switch (timeframe) {
      case '24h':
        marketCount = Math.min(requestedLimit * 2.5, 400); // More recent/trending markets
        break;
      case '7d':
        marketCount = Math.min(requestedLimit * 2.2, 450);
        break;
      case '30d':
        marketCount = Math.min(requestedLimit * 2.8, 500);
        break;
      case 'future':
        marketCount = Math.min(requestedLimit * 2.3, 450); // Future predictions
        break;
      case 'trending':
        marketCount = Math.min(requestedLimit * 2.0, 350); // High-volume trending
        break;
      default:
        marketCount = Math.min(requestedLimit * 2.5, 500);
    }

    for (let i = 1; i <= marketCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const basePrice = 0.3 + Math.random() * 0.4;
      
      const marketQuestions = {
        Crypto: [
          "Will Bitcoin reach $100,000 by end of 2025?",
          "Will Ethereum reach $5,000 by Q2 2025?",
          "Will Solana reach $200 by end of 2025?",
          "Will Cardano reach $2 by Q3 2025?",
          "Will Polygon reach $3 by end of 2025?",
          "Will Chainlink reach $50 by Q2 2025?",
          "Will Avalanche reach $100 by end of 2025?",
          "Will Polkadot reach $30 by Q3 2025?",
          "Will Cosmos reach $50 by end of 2025?",
          "Will Near Protocol reach $20 by Q2 2025?",
        ],
        Sports: [
          "Will Liverpool defeat Man United?",
          "Will the Lakers or the Celtics win their matchup?",
          "Will the Rams or the Jaguars win their game?",
          "Will Arsenal win the Premier League?",
          "Will the Dodgers win the 2025 MLB World Series?",
          "Will the Warriors or the Suns win their matchup?",
          "Will the Packers or the Vikings win their game?",
          "Will Real Madrid win La Liga 2025/26?",
          "Will Manchester City win the Premier League?",
          "Will the Patriots or the Bills win their matchup?",
        ],
        Politics: [
          "Will Donald Trump meet with the Pope in 2025?",
          "Will Jerome Powell leave the Fed Chair in 2025?",
          "Will this be the longest government shutdown in US history?",
          "Will Macron vs Owens win the defamation lawsuit?",
          "Will there be a federal charge filed against Hunter Biden?",
          "Will Trump win the 2024 U.S. presidential election?",
          "Will Biden be inaugurated for his second term?",
          "Will the Senate convict Donald Trump on impeachment?",
          "Will the House flip to Democratic control?",
          "Will the Supreme Court rule on the abortion case?",
        ],
        Economy: [
          "Will the S&P 500 pump to 6900 or dump to 6200?",
          "Exactly two FED rate changes in 2025?",
          "Will the 10-year Treasury yield pump to 4.6% or dump to 4.0%?",
          "Will Bitcoin outperform Gold in 2025?",
          "Will there be a US recession in 2025?",
          "Will the unemployment rate drop below 3.5%?",
          "Will inflation exceed 4% in 2025?",
          "Will the dollar index reach 110?",
          "Will oil prices exceed $100 per barrel?",
          "Will the housing market crash in 2025?",
        ],
        Gaming: [
          "Chovy vs Knight: Who achieves a higher KDA?",
          "LEC vs LTA: Who goes further?",
          "Will Gen.G go 3:0 in the Swiss Stage?",
          "LCK vs LPL: Who goes further?",
          "Will T1 win the World Championship?",
          "Will Faker retire in 2025?",
          "Will G2 Esports win the LEC?",
          "Will Cloud9 win the LCS?",
          "Will DRX make it to Worlds?",
          "Will Riot Games announce a new game?",
        ],
        Culture: [
          "TIME Person of the Year 2025: Will it be a human?",
          "Oscars 2026: Can 'One Battle After Another' score 9+ nominations?",
          "Will Timothée Chalamet win Best Actor?",
          "Who will play the next Voldemort?",
          "Will Taylor Swift win Album of the Year?",
          "Will the next James Bond be announced?",
          "Will Netflix release a hit show?",
          "Will Disney announce a new Star Wars movie?",
          "Will Marvel announce a new phase?",
          "Will the next iPhone have a foldable screen?",
        ],
        Sentiment: [
          "Fear or Greed?",
          "Up or Down?",
          "Will Trump's approval ratings improve?",
          "Market sentiment: Bullish or Bearish?",
          "Will the next viral trend be AI-related?",
          "Will social media sentiment turn positive?",
          "Will public opinion on crypto improve?",
          "Will the next big tech trend be quantum computing?",
          "Will the metaverse make a comeback?",
          "Will Web3 adoption increase in 2025?",
        ],
      };

      const questions = marketQuestions[category as keyof typeof marketQuestions];
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      markets.push({
        id: `myriad-${i}`,
        question: randomQuestion,
        description: `This market will resolve based on the specified criteria. Resolution source: myriad.markets`,
        outcomes: ["Yes", "No"],
        outcomePrices: [basePrice, 1 - basePrice],
        volume: Math.floor(Math.random() * 500000) + 10000,
        liquidity: Math.floor(Math.random() * 100000) + 5000,
        active: true,
        closed: false,
        endDate: generateEndDateBasedOnTimeframe(timeframe),
        category: category,
        platform: "myriad",
        image: `https://myriad.markets/images/${category.toLowerCase()}-market-${i}.png`,
        icon: `https://myriad.markets/images/${category.toLowerCase()}-icon-${i}.png`,
        creator: "myriad-team",
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        marketType: "binary",
        resolutionSource: "myriad.markets",
        tags: [category.toLowerCase(), "prediction", "2025"],
        featured: Math.random() > 0.8,
        verified: Math.random() > 0.3,
        points: Math.floor(Math.random() * 1000) + 100,
        participants: Math.floor(Math.random() * 500) + 50,
        priceChange24h: (Math.random() - 0.5) * 0.1,
        priceChange7d: (Math.random() - 0.5) * 0.2,
        lastTradeTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        spread: Math.random() * 0.05,
        bid: basePrice - Math.random() * 0.02,
        ask: basePrice + Math.random() * 0.02,
      });
    }

    console.log('🔍 Myriad API: Generated', markets.length, 'mock markets');
    return NextResponse.json(markets);
  } catch (error) {
    console.error('🔍 Myriad API: Error generating markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets from Myriad API' },
      { status: 500 }
    );
  }
}
