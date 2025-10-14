// Test Polymarket Trading Data and Order Book
const axios = require('axios');

const POLYMARKET_BASE = 'https://gamma-api.polymarket.com';
const CLOB_BASE = 'https://clob.polymarket.com';

// Test configuration
const TEST_CONFIG = {
  timeout: 15000,
  delayBetweenRequests: 1000
};

// Utility function to delay requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testTradingEndpoints() {
  console.log('💰 TESTING POLYMARKET TRADING DATA');
  console.log('=' .repeat(60));
  
  try {
    // First, get a list of active markets
    console.log('\n📊 Step 1: Getting active markets...');
    const marketsResponse = await axios.get(`${POLYMARKET_BASE}/markets`, {
      params: { limit: 10, active: true, archived: false },
      timeout: TEST_CONFIG.timeout
    });
    
    console.log(`✅ Found ${marketsResponse.data.length} active markets`);
    
    if (marketsResponse.data.length === 0) {
      console.log('❌ No active markets found. Testing with any markets...');
      const allMarketsResponse = await axios.get(`${POLYMARKET_BASE}/markets`, {
        params: { limit: 5 },
        timeout: TEST_CONFIG.timeout
      });
      
      if (allMarketsResponse.data.length === 0) {
        console.log('❌ No markets found at all. API might be down.');
        return;
      }
      
      marketsResponse.data = allMarketsResponse.data;
    }
    
    // Test each market for trading data
    for (let i = 0; i < Math.min(3, marketsResponse.data.length); i++) {
      const market = marketsResponse.data[i];
      console.log(`\n🔍 Testing Market ${i + 1}: ${market.question}`);
      console.log(`   ID: ${market.id}`);
      console.log(`   Category: ${market.category}`);
      console.log(`   Active: ${market.active}, Closed: ${market.closed}`);
      
      await testMarketTradingData(market);
      await delay(TEST_CONFIG.delayBetweenRequests);
    }
    
  } catch (error) {
    console.log(`❌ Error in trading test: ${error.message}`);
  }
}

async function testMarketTradingData(market) {
  const marketId = market.id;
  
  try {
    // Test 1: Get detailed market info
    console.log(`\n   📊 Test 1: Market Details for ${marketId}`);
    try {
      const marketDetails = await axios.get(`${POLYMARKET_BASE}/markets/${marketId}`, {
        timeout: TEST_CONFIG.timeout
      });
      
      const details = marketDetails.data;
      console.log(`   ✅ Market details retrieved`);
      console.log(`   📈 Volume: ${details.volumeNum || details.volume}`);
      console.log(`   💧 Liquidity: ${details.liquidityNum || details.liquidity}`);
      console.log(`   📊 Best Bid: ${details.bestBid}`);
      console.log(`   📊 Best Ask: ${details.bestAsk}`);
      console.log(`   📊 Spread: ${details.spread}`);
      console.log(`   💰 Last Trade Price: ${details.lastTradePrice}`);
      
      // Parse outcomes and prices
      try {
        const outcomes = JSON.parse(details.outcomes);
        const prices = JSON.parse(details.outcomePrices).map(p => parseFloat(p));
        console.log(`   🎯 Outcomes: ${outcomes.join(' vs ')}`);
        console.log(`   💵 Prices: ${prices.map((p, i) => `${outcomes[i]}: ${(p * 100).toFixed(2)}%`).join(', ')}`);
      } catch (e) {
        console.log(`   ⚠️  Could not parse outcomes/prices: ${e.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Market details failed: ${error.message}`);
    }
    
    // Test 2: Try to get order book data
    console.log(`\n   📊 Test 2: Order Book for ${marketId}`);
    await testOrderBook(marketId);
    
    // Test 3: Try to get recent trades
    console.log(`\n   📊 Test 3: Recent Trades for ${marketId}`);
    await testRecentTrades(marketId);
    
    // Test 4: Try to get price history
    console.log(`\n   📊 Test 4: Price History for ${marketId}`);
    await testPriceHistory(marketId);
    
    // Test 5: Test CLOB (Central Limit Order Book) endpoints
    console.log(`\n   📊 Test 5: CLOB Data for ${marketId}`);
    await testClobData(marketId, market);
    
  } catch (error) {
    console.log(`   ❌ Error testing market ${marketId}: ${error.message}`);
  }
}

async function testOrderBook(marketId) {
  const orderBookEndpoints = [
    `/markets/${marketId}/orderbook`,
    `/markets/${marketId}/orders`,
    `/orderbook/${marketId}`,
    `/orders?market=${marketId}`,
  ];
  
  for (const endpoint of orderBookEndpoints) {
    try {
      console.log(`     🔍 Trying: ${endpoint}`);
      const response = await axios.get(`${POLYMARKET_BASE}${endpoint}`, {
        timeout: 5000
      });
      
      console.log(`     ✅ Success! Status: ${response.status}`);
      console.log(`     📊 Data type: ${Array.isArray(response.data) ? 'Array' : 'Object'}`);
      console.log(`     📏 Length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`     📝 Sample order:`, JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }
      
      return; // Found working endpoint
    } catch (error) {
      console.log(`     ❌ Failed: ${error.response?.status || error.message}`);
    }
  }
  
  console.log(`     ⚠️  No order book endpoints found for market ${marketId}`);
}

async function testRecentTrades(marketId) {
  const tradesEndpoints = [
    `/markets/${marketId}/trades`,
    `/trades?market=${marketId}`,
    `/markets/${marketId}/recent-trades`,
    `/recent-trades/${marketId}`,
  ];
  
  for (const endpoint of tradesEndpoints) {
    try {
      console.log(`     🔍 Trying: ${endpoint}`);
      const response = await axios.get(`${POLYMARKET_BASE}${endpoint}`, {
        timeout: 5000
      });
      
      console.log(`     ✅ Success! Status: ${response.status}`);
      console.log(`     📊 Data type: ${Array.isArray(response.data) ? 'Array' : 'Object'}`);
      console.log(`     📏 Length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`     📝 Sample trade:`, JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }
      
      return; // Found working endpoint
    } catch (error) {
      console.log(`     ❌ Failed: ${error.response?.status || error.message}`);
    }
  }
  
  console.log(`     ⚠️  No trades endpoints found for market ${marketId}`);
}

async function testPriceHistory(marketId) {
  const priceHistoryEndpoints = [
    `/markets/${marketId}/price-history`,
    `/price-history/${marketId}`,
    `/markets/${marketId}/prices`,
    `/prices/${marketId}`,
  ];
  
  for (const endpoint of priceHistoryEndpoints) {
    try {
      console.log(`     🔍 Trying: ${endpoint}`);
      const response = await axios.get(`${POLYMARKET_BASE}${endpoint}`, {
        timeout: 5000
      });
      
      console.log(`     ✅ Success! Status: ${response.status}`);
      console.log(`     📊 Data type: ${Array.isArray(response.data) ? 'Array' : 'Object'}`);
      console.log(`     📏 Length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`     📝 Sample price data:`, JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }
      
      return; // Found working endpoint
    } catch (error) {
      console.log(`     ❌ Failed: ${error.response?.status || error.message}`);
    }
  }
  
  console.log(`     ⚠️  No price history endpoints found for market ${marketId}`);
}

async function testClobData(marketId, market) {
  // Try CLOB-specific endpoints
  const clobEndpoints = [
    `/book?token_id=${market.clobTokenIds ? JSON.parse(market.clobTokenIds)[0] : marketId}`,
    `/trades?token_id=${market.clobTokenIds ? JSON.parse(market.clobTokenIds)[0] : marketId}`,
    `/orders?token_id=${market.clobTokenIds ? JSON.parse(market.clobTokenIds)[0] : marketId}`,
  ];
  
  for (const endpoint of clobEndpoints) {
    try {
      console.log(`     🔍 Trying CLOB: ${endpoint}`);
      const response = await axios.get(`${CLOB_BASE}${endpoint}`, {
        timeout: 5000
      });
      
      console.log(`     ✅ CLOB Success! Status: ${response.status}`);
      console.log(`     📊 Data type: ${Array.isArray(response.data) ? 'Array' : 'Object'}`);
      console.log(`     📏 Length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`     📝 Sample CLOB data:`, JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }
      
      return; // Found working endpoint
    } catch (error) {
      console.log(`     ❌ CLOB Failed: ${error.response?.status || error.message}`);
    }
  }
  
  console.log(`     ⚠️  No CLOB endpoints found for market ${marketId}`);
}

async function testAlternativeTradingAPIs() {
  console.log('\n🔍 TESTING ALTERNATIVE TRADING APIs');
  console.log('=' .repeat(50));
  
  const alternativeAPIs = [
    {
      name: 'Polymarket GraphQL',
      url: 'https://api.thegraph.com/subgraphs/name/polymarket/polymarket',
      query: `{
        markets(first: 5, where: {active: true}) {
          id
          question
          volume
          liquidity
          outcomes
          outcomePrices
        }
      }`
    },
    {
      name: 'Polymarket Subgraph',
      url: 'https://api.thegraph.com/subgraphs/name/polymarket/polymarket-mainnet',
      query: `{
        markets(first: 5) {
          id
          question
          volume
          liquidity
        }
      }`
    }
  ];
  
  for (const api of alternativeAPIs) {
    try {
      console.log(`\n📊 Testing ${api.name}...`);
      const response = await axios.post(api.url, {
        query: api.query
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Response:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Main test runner
async function runTradingTests() {
  console.log('🚀 POLYMARKET TRADING DATA TEST');
  console.log('🎯 Goal: Find all available trading endpoints and data');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('\n');
  
  const startTime = Date.now();
  
  try {
    await testTradingEndpoints();
    await testAlternativeTradingAPIs();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TRADING TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`⏰ Duration: ${duration.toFixed(2)} seconds`);
    
    console.log('\n🎯 KEY FINDINGS:');
    console.log('   - Market details provide basic trading info (prices, volume, liquidity)');
    console.log('   - Order book and trades data may require different endpoints');
    console.log('   - CLOB (Central Limit Order Book) might have separate API');
    console.log('   - GraphQL subgraphs could provide historical data');
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Use market details for current prices and basic info');
    console.log('   2. Investigate CLOB API for order book data');
    console.log('   3. Consider GraphQL subgraphs for historical data');
    console.log('   4. Implement real-time price updates via WebSocket if available');
    
  } catch (error) {
    console.log(`❌ Trading test failed: ${error.message}`);
  }
}

// Run the trading tests
runTradingTests().catch(console.error);




