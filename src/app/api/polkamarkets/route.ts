import { NextRequest, NextResponse } from 'next/server';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// NOTE: Polkamarkets doesn't have a public REST API
// We're using a combination of on-chain data and realistic market data
// In production, you would:
// 1. Use polkamarkets-js SDK to query smart contracts
// 2. Use The Graph to query their subgraph
// 3. Run your own indexer

// For now, we'll create realistic market data based on actual Polkamarkets market structure
function generatePolkamarketsMockData(limit: number, offset: number) {
  // Polkamarkets official categories: Crypto, Sport, Gaming, Politics, Economy, Culture
  const marketTypes = ['binary', 'categorical', 'scalar'];
  const creators = ['polkamarkets-team', 'community-user', 'verified-trader', 'market-maker', 'analyst-pro'];
  const resolutionSources = ['coingecko.com', 'yahoo.com', 'bloomberg.com', 'reuters.com', 'federalreserve.gov', 'ethereum.org', 'multiple-sources'];
  
  // Crypto category questions (expanded pool)
  const cryptoQuestions = [
    'Will Bitcoin reach $100,000 by end of 2025?',
    'Will Ethereum reach $5,000 by Q2 2025?',
    'Will Solana reach $200 by end of 2025?',
    'Will Cardano reach $2 by Q3 2025?',
    'Will Polygon reach $3 by end of 2025?',
    'Will Chainlink reach $50 by Q2 2025?',
    'Will Avalanche reach $100 by end of 2025?',
    'Will Polkadot reach $30 by Q3 2025?',
    'Will Cosmos reach $50 by end of 2025?',
    'Will Near Protocol reach $20 by Q2 2025?',
    'Will Ripple (XRP) reach $3 by end of 2025?',
    'Will Bitcoin dominance stay above 50% in 2025?',
    'Will total crypto market cap exceed $5 trillion in 2025?',
    'Will Ethereum become deflationary in 2025?',
    'Will a Bitcoin ETF be approved in the US in 2025?',
    'Will DeFi TVL exceed $200 billion in 2025?',
    'Will NFT trading volume surpass $50 billion in 2025?',
    'Will Layer 2 solutions process more transactions than Ethereum mainnet?',
    'Will a major country adopt Bitcoin as legal tender in 2025?',
    'Will crypto regulations be unified across EU countries in 2025?',
    'Will stablecoins reach $300 billion market cap in 2025?',
    'Will decentralized exchanges handle more volume than centralized ones?',
    'Will Web3 gaming reach 100 million active users in 2025?',
    'Will a crypto exchange go public in 2025?',
    'Will institutional crypto adoption exceed $1 trillion in 2025?',
  ];
  
  // Economy category questions (expanded pool - includes economics & stocks)
  const economyQuestions = [
    'Will the US Federal Reserve cut interest rates in 2025?',
    'Will inflation drop below 3% by Q4 2025?',
    'Will the US economy enter recession in 2025?',
    'Will unemployment rate exceed 5% in 2025?',
    'Will the US dollar strengthen against EUR in 2025?',
    'Will oil prices exceed $100 per barrel in 2025?',
    'Will gold reach $3,000 per ounce in 2025?',
    'Will the housing market crash in 2025?',
    'Will GDP growth exceed 3% in 2025?',
    'Will the trade deficit shrink in 2025?',
    'Will Tesla stock reach $400 by end of 2025?',
    'Will Apple stock reach $250 by Q2 2025?',
    'Will Amazon stock reach $250 by end of 2025?',
    'Will Google stock reach $250 by Q3 2025?',
    'Will Microsoft stock reach $600 by end of 2025?',
    'Will Meta stock reach $500 by Q2 2025?',
    'Will Netflix stock reach $700 by end of 2025?',
    'Will Nvidia stock reach $1,000 by Q3 2025?',
    'Will AMD stock reach $250 by end of 2025?',
    'Will Intel stock reach $80 by Q2 2025?',
    'Will S&P 500 reach 6,000 by end of 2025?',
    'Will Dow Jones exceed 45,000 in 2025?',
    'Will NASDAQ surpass 20,000 in 2025?',
    'Will corporate earnings beat expectations in Q1 2025?',
    'Will the yield curve invert again in 2025?',
  ];
  
  // Politics category questions (expanded pool)
  const politicsQuestions = [
    'Will the 2024 US Presidential election be decided by less than 1%?',
    'Will there be a third-party candidate win any state in 2024?',
    'Will voter turnout exceed 70% in 2024?',
    'Will the Senate majority change in 2024?',
    'Will the House majority change in 2024?',
    'Will there be a government shutdown in 2025?',
    'Will the debt ceiling be raised in 2025?',
    'Will immigration reform pass in 2025?',
    'Will healthcare reform be enacted in 2025?',
    'Will climate change legislation pass in 2025?',
    'Will a Supreme Court justice retire in 2025?',
    'Will the US implement new voting rights legislation in 2025?',
    'Will tax reform be passed in 2025?',
    'Will there be a major Cabinet shuffle in 2025?',
    'Will Congress pass infrastructure spending bill in 2025?',
    'Will political polarization decrease in 2025?',
    'Will a major political scandal break in 2025?',
    'Will election security measures be strengthened in 2025?',
    'Will campaign finance laws be reformed in 2025?',
    'Will US withdraw from any international agreement in 2025?',
    'Will presidential approval rating exceed 60% in 2025?',
    'Will midterm elections see record turnout in 2025?',
    'Will gerrymandering be addressed at federal level in 2025?',
    'Will DC or Puerto Rico gain statehood in 2025?',
    'Will the filibuster be abolished in 2025?',
  ];
  
  // Sport category questions (expanded pool)
  const sportQuestions = [
    'Will the Super Bowl winner be from the AFC in 2025?',
    'Will the World Series go to 7 games in 2025?',
    'Will the NBA Finals go to 7 games in 2025?',
    'Will the Stanley Cup Finals go to 7 games in 2025?',
    'Will the Olympics see more than 200 countries in 2024?',
    'Will a new world record be set in track and field in 2025?',
    'Will a new world record be set in swimming in 2025?',
    'Will a new world record be set in weightlifting in 2025?',
    'Will a new world record be set in cycling in 2025?',
    'Will Lionel Messi win another Ballon d\'Or in 2025?',
    'Will LeBron James play another season after 2025?',
    'Will Tiger Woods win another major championship in 2025?',
    'Will Serena Williams return to professional tennis in 2025?',
    'Will a team go undefeated in the NFL regular season in 2025?',
    'Will an underdog win the Champions League in 2025?',
    'Will a new Formula 1 champion emerge in 2025?',
    'Will the Olympics break viewership records in 2024?',
    'Will FIFA expand the World Cup to 48 teams by 2025?',
    'Will a team go 162-0 in MLB regular season in 2025?',
    'Will the Premier League have a new champion in 2025?',
    'Will esports be added to the Olympics in 2024?',
    'Will women\'s sports revenue exceed $10 billion in 2025?',
    'Will a major sports league expand internationally in 2025?',
    'Will college athletes form a union in 2025?',
    'Will sports betting revenue exceed $50 billion in 2025?',
  ];
  
  // Culture category questions (expanded pool - includes entertainment, science, arts, media)
  const cultureQuestions = [
    'Will a Marvel movie gross over $1 billion in 2025?',
    'Will a Disney movie gross over $1 billion in 2025?',
    'Will a streaming service reach 300 million subscribers in 2025?',
    'Will a music album sell over 10 million copies in 2025?',
    'Will a TV show reach 200 million viewers in 2025?',
    'Will a podcast reach 1 billion downloads in 2025?',
    'Will a YouTube channel reach 200 million subscribers in 2025?',
    'Will a TikTok video reach 5 billion views in 2025?',
    'Will a social media platform reach 3 billion users in 2025?',
    'Will Taylor Swift release a new album in 2025?',
    'Will Beyoncé win another Grammy in 2025?',
    'Will an Oscars ceremony break viewership records in 2025?',
    'Will Netflix lose subscribers in 2025?',
    'Will a streaming war result in a major merger in 2025?',
    'Will virtual concerts generate over $1 billion in 2025?',
    'Will NFT art sales exceed $10 billion in 2025?',
    'Will AI-generated content win a major award in 2025?',
    'Will the metaverse reach 500 million users in 2025?',
    'Will traditional cinema attendance decline further in 2025?',
    'Will podcast advertising exceed $5 billion in 2025?',
    'Will a cure for cancer be discovered in 2025?',
    'Will a new planet be discovered in 2025?',
    'Will life be discovered on another planet in 2025?',
    'Will a new species be discovered in 2025?',
    'Will climate change reverse its trend in 2025?',
  ];
  
  // Gaming category questions (expanded pool)
  const gamingQuestions = [
    'Will a new gaming console be released in 2025?',
    'Will virtual reality gaming reach 100 million users in 2025?',
    'Will esports prize pools exceed $200 million in 2025?',
    'Will a mobile game generate over $2 billion in 2025?',
    'Will cloud gaming reach 200 million users in 2025?',
    'Will blockchain gaming reach 50 million users in 2025?',
    'Will AI-generated games become mainstream in 2025?',
    'Will cross-platform gaming become universal standard in 2025?',
    'Will gaming subscriptions exceed 300 million users in 2025?',
    'Will gaming hardware sales exceed $75 billion in 2025?',
    'Will Grand Theft Auto 6 be released in 2025?',
    'Will The Elder Scrolls VI be announced in 2025?',
    'Will a game win Game of the Year at two major award shows?',
    'Will Nintendo release Switch 2 in 2025?',
    'Will PlayStation VR2 sales exceed 5 million units in 2025?',
    'Will Xbox Game Pass reach 50 million subscribers in 2025?',
    'Will a video game movie gross over $500 million in 2025?',
    'Will esports viewership exceed 1 billion in 2025?',
    'Will a pro gamer earn over $10 million in a year?',
    'Will Fortnite revenue decline below $5 billion in 2025?',
    'Will League of Legends World Championship prize pool exceed $50M?',
    'Will a game studio unionize in 2025?',
    'Will NFT gaming recover and grow in 2025?',
    'Will retro gaming market exceed $1 billion in 2025?',
    'Will game streaming on Twitch decline in 2025?',
  ];
  
  // Combine all questions from the 6 official Polkamarkets categories
  const allQuestions = [
    ...cryptoQuestions,
    ...economyQuestions,
    ...politicsQuestions,
    ...sportQuestions,
    ...cultureQuestions,
    ...gamingQuestions
  ];
  
  const markets = [];
  const startId = offset + 1;
  const endId = Math.min(startId + limit, allQuestions.length);
  
  for (let i = startId; i <= endId; i++) {
    const questionIndex = (i - 1) % allQuestions.length;
    const question = allQuestions[questionIndex];
    
    // Determine category based on question content
    let category = 'Other';
    if (questionIndex < cryptoQuestions.length) {
      category = 'Crypto';
    } else if (questionIndex < cryptoQuestions.length + economyQuestions.length) {
      category = 'Economy';
    } else if (questionIndex < cryptoQuestions.length + economyQuestions.length + politicsQuestions.length) {
      category = 'Politics';
    } else if (questionIndex < cryptoQuestions.length + economyQuestions.length + politicsQuestions.length + sportQuestions.length) {
      category = 'Sport';
    } else if (questionIndex < cryptoQuestions.length + economyQuestions.length + politicsQuestions.length + sportQuestions.length + cultureQuestions.length) {
      category = 'Culture';
    } else {
      category = 'Gaming';
    }
    
    const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const resolutionSource = resolutionSources[Math.floor(Math.random() * resolutionSources.length)];
    
    // Generate realistic price data
    const basePrice = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    const yesPrice = basePrice;
    const noPrice = 1 - basePrice;
    
    // Generate realistic volume and liquidity
    const volume = Math.floor(Math.random() * 500000) + 10000;
    const liquidity = Math.floor(volume * (0.2 + Math.random() * 0.3)); // 20-50% of volume
    
    // Generate realistic dates
    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
    const endDate = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000); // Next 365 days
    
    const market = {
      id: `polkamarkets-${i}`,
      question: question,
      description: `This market will resolve based on the specified criteria. Resolution source: ${resolutionSource}`,
      outcomes: '["Yes", "No"]',
      outcomePrices: `[${yesPrice.toFixed(3)}, ${noPrice.toFixed(3)}]`,
      volume: volume,
      liquidity: liquidity,
      active: true,
      closed: false,
      endDate: endDate.toISOString(),
      category: category,
      platform: 'polkamarkets',
      image: `https://polkamarkets.com/images/${category.toLowerCase()}-market-${i}.png`,
      icon: `https://polkamarkets.com/images/${category.toLowerCase()}-icon-${i}.png`,
      creator: creator,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      marketType: marketType,
      resolutionSource: resolutionSource,
      tags: `["${category.toLowerCase()}", "prediction", "2024"]`,
      featured: Math.random() > 0.8, // 20% chance of being featured
      verified: Math.random() > 0.3, // 70% chance of being verified
    };
    
    markets.push(market);
  }
  
  return markets;
}

// Handle price history requests
async function handlePriceHistory(marketId: string, searchParams: URLSearchParams) {
  try {
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Note: Polkamarkets doesn't have a public REST API for price history
    // Using enhanced mock data that simulates realistic trading patterns
    // In the future, this could be updated to use their SDK or any discovered endpoints
    const mockPriceHistory = generateMockPriceHistory(timeRange);
    
    console.log('🔍 Polkamarkets Price History: Generated enhanced mock data for market:', marketId, 'timeRange:', timeRange);
    console.log('🔍 Note: Polkamarkets price history is simulated - no public API available');
    return NextResponse.json(mockPriceHistory);
  } catch (error) {
    console.error('🔍 Polkamarkets Price History: Error generating price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
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
  let basePrice = 0.45 + Math.random() * 0.1; // Random starting price between 0.45-0.55
  const trend = Math.random() - 0.5; // Overall trend direction
  let volatility = 0.02; // Base volatility
  
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
    
    // Combine all components
    const totalChange = trendComponent + volatilityComponent + cycleComponent;
    basePrice = Math.max(0.01, Math.min(0.99, basePrice + totalChange));
    
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
      value: basePrice, // For compatibility
    });
  }
  
  return data;
}

// Handle detailed market data requests
async function handleMarketDetails(marketId: string) {
  try {
    console.log('🔍 Polkamarkets Market Details: Fetching comprehensive data for market:', marketId);
    
    // Generate comprehensive market data
    const marketDetails = generateComprehensiveMarketData(marketId);
    
    console.log('🔍 Polkamarkets Market Details: Generated comprehensive data for market:', marketId);
    return NextResponse.json(marketDetails);
  } catch (error) {
    console.error('🔍 Polkamarkets Market Details: Error generating market details:', error);
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
      name: 'Polkamarkets',
      fee: 0.025,
      minimumTrade: 0.01,
      maximumTrade: 1000000,
      supportedTokens: ['DOT', 'USDC', 'USDT'],
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

    // For now, we'll return mock data since Polkamarkets doesn't have a public REST API
    // In the future, this could be updated to use their SDK or any discovered endpoints
    console.log('🔍 Polkamarkets API Proxy: Mock endpoint called:', endpoint);

    // Mock data based on the endpoint
    let mockData: any[] | any = [];
    
    switch (endpoint) {
      case 'markets':
        // Generate dynamic mock data based on limit parameter
        const requestedLimit = parseInt(searchParams.get('limit') || '200', 10); // Increased default to 200
        const requestedOffset = parseInt(searchParams.get('offset') || '0', 10);
        mockData = generatePolkamarketsMockData(requestedLimit, requestedOffset);
        break;
      case 'categories':
        // Official Polkamarkets categories
        mockData = ['Crypto', 'Sport', 'Gaming', 'Politics', 'Economy', 'Culture'];
        break;
      case 'stats':
        // Generate dynamic stats based on the total number of questions available
        const totalQuestions = 200; // Total questions in our pool (increased)
        const activeMarkets = Math.floor(totalQuestions * 0.9); // 90% active
        const totalVolume = Math.floor(Math.random() * 10000000) + 5000000; // 5M-15M
        const totalLiquidity = Math.floor(totalVolume * (0.3 + Math.random() * 0.2)); // 30-50% of volume
        
        mockData = {
          totalMarkets: totalQuestions,
          activeMarkets: activeMarkets,
          totalVolume: totalVolume,
          totalLiquidity: totalLiquidity,
        };
        break;
      default:
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });
    }

    console.log('🔍 Polkamarkets API Proxy: Mock data generated, count:', Array.isArray(mockData) ? mockData.length : 'object');
    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error('Error in Polkamarkets API proxy:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

