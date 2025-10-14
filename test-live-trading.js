// Test Live Trading Data for Active Markets
const axios = require('axios');

const POLYMARKET_BASE = 'https://gamma-api.polymarket.com';

async function testLiveTradingData() {
  console.log('🔥 TESTING LIVE TRADING DATA');
  console.log('🎯 Goal: Find markets with actual trading activity');
  console.log('=' .repeat(60));
  
  try {
    // Get markets that are currently active and not closed
    console.log('\n📊 Step 1: Finding truly active markets...');
    
    const activeMarketsResponse = await axios.get(`${POLYMARKET_BASE}/markets`, {
      params: { 
        limit: 50, 
        active: true, 
        archived: false 
      },
      timeout: 15000
    });
    
    console.log(`✅ Found ${activeMarketsResponse.data.length} markets marked as active`);
    
    // Filter for markets that are actually trading (not closed)
    const tradingMarkets = activeMarketsResponse.data.filter(market => {
      const isNotClosed = !market.closed;
      const hasVolume = market.volumeNum > 0;
      const hasLiquidity = market.liquidityNum > 0;
      const hasRecentActivity = market.volume24hr > 0 || market.volume1wk > 0;
      
      return isNotClosed && (hasVolume || hasLiquidity || hasRecentActivity);
    });
    
    console.log(`📈 Found ${tradingMarkets.length} markets with trading activity`);
    
    if (tradingMarkets.length === 0) {
      console.log('\n⚠️  No actively trading markets found. Let\'s check what we have...');
      
      // Show sample of what we do have
      console.log('\n📊 Sample of available markets:');
      activeMarketsResponse.data.slice(0, 5).forEach((market, i) => {
        console.log(`   ${i + 1}. ${market.question}`);
        console.log(`      Active: ${market.active}, Closed: ${market.closed}, Archived: ${market.archived}`);
        console.log(`      Volume: ${market.volumeNum}, Liquidity: ${market.liquidityNum}`);
        console.log(`      24h Volume: ${market.volume24hr}, 1wk Volume: ${market.volume1wk}`);
        console.log(`      End Date: ${market.endDate}`);
        console.log('');
      });
      
      // Try to find markets ending in the future
      const now = new Date();
      const futureMarkets = activeMarketsResponse.data.filter(market => {
        const endDate = new Date(market.endDate);
        return endDate > now;
      });
      
      console.log(`\n🔮 Found ${futureMarkets.length} markets ending in the future`);
      
      if (futureMarkets.length > 0) {
        console.log('\n📊 Future markets sample:');
        futureMarkets.slice(0, 3).forEach((market, i) => {
          console.log(`   ${i + 1}. ${market.question}`);
          console.log(`      End Date: ${market.endDate}`);
          console.log(`      Volume: ${market.volumeNum}, Liquidity: ${market.liquidityNum}`);
          console.log(`      Best Bid: ${market.bestBid}, Best Ask: ${market.bestAsk}`);
          console.log('');
        });
        
        // Test these future markets
        await testFutureMarkets(futureMarkets.slice(0, 3));
      }
      
      return;
    }
    
    // Test markets with trading activity
    console.log('\n📊 Testing markets with trading activity...');
    for (let i = 0; i < Math.min(3, tradingMarkets.length); i++) {
      const market = tradingMarkets[i];
      console.log(`\n🔍 Market ${i + 1}: ${market.question}`);
      console.log(`   Volume: ${market.volumeNum}, Liquidity: ${market.liquidityNum}`);
      console.log(`   24h Volume: ${market.volume24hr}, 1wk Volume: ${market.volume1wk}`);
      
      await testMarketTradingDetails(market);
    }
    
  } catch (error) {
    console.log(`❌ Error in live trading test: ${error.message}`);
  }
}

async function testFutureMarkets(markets) {
  console.log('\n🔮 TESTING FUTURE MARKETS');
  console.log('=' .repeat(40));
  
  for (const market of markets) {
    console.log(`\n📊 Testing: ${market.question}`);
    console.log(`   End Date: ${market.endDate}`);
    
    // Parse outcomes and prices
    try {
      const outcomes = JSON.parse(market.outcomes);
      const prices = JSON.parse(market.outcomePrices).map(p => parseFloat(p));
      
      console.log(`   🎯 Outcomes: ${outcomes.join(' vs ')}`);
      console.log(`   💵 Current Prices: ${prices.map((p, i) => `${outcomes[i]}: ${(p * 100).toFixed(2)}%`).join(', ')}`);
      console.log(`   📊 Best Bid: ${market.bestBid}, Best Ask: ${market.bestAsk}`);
      console.log(`   📊 Spread: ${market.spread}`);
      console.log(`   💰 Last Trade: ${market.lastTradePrice}`);
      
      // Check if prices make sense (not all zeros)
      const hasValidPrices = prices.some(p => p > 0 && p < 1);
      console.log(`   ✅ Valid Prices: ${hasValidPrices ? 'Yes' : 'No'}`);
      
      if (hasValidPrices) {
        console.log(`   🎉 This market has real trading data!`);
        
        // Try to get more detailed trading info
        await testDetailedTradingInfo(market);
      }
      
    } catch (e) {
      console.log(`   ❌ Error parsing market data: ${e.message}`);
    }
  }
}

async function testMarketTradingDetails(market) {
  try {
    // Get detailed market info
    const marketDetails = await axios.get(`${POLYMARKET_BASE}/markets/${market.id}`, {
      timeout: 10000
    });
    
    const details = marketDetails.data;
    
    // Parse and display trading info
    const outcomes = JSON.parse(details.outcomes);
    const prices = JSON.parse(details.outcomePrices).map(p => parseFloat(p));
    
    console.log(`   🎯 Outcomes: ${outcomes.join(' vs ')}`);
    console.log(`   💵 Prices: ${prices.map((p, i) => `${outcomes[i]}: ${(p * 100).toFixed(2)}%`).join(', ')}`);
    console.log(`   📊 Best Bid: ${details.bestBid}, Best Ask: ${details.bestAsk}`);
    console.log(`   📊 Spread: ${details.spread}`);
    console.log(`   💰 Last Trade: ${details.lastTradePrice}`);
    console.log(`   📈 Volume 24h: ${details.volume24hr}`);
    console.log(`   📈 Volume 1wk: ${details.volume1wk}`);
    console.log(`   💧 Liquidity: ${details.liquidityNum}`);
    
    // Check price changes
    console.log(`   📊 Price Changes:`);
    console.log(`      1h: ${details.oneHourPriceChange}%`);
    console.log(`      1d: ${details.oneDayPriceChange}%`);
    console.log(`      1w: ${details.oneWeekPriceChange}%`);
    
  } catch (error) {
    console.log(`   ❌ Error getting market details: ${error.message}`);
  }
}

async function testDetailedTradingInfo(market) {
  console.log(`   🔍 Testing detailed trading endpoints...`);
  
  // Try different trading-related endpoints
  const tradingEndpoints = [
    `/markets/${market.id}/trades`,
    `/markets/${market.id}/orders`,
    `/markets/${market.id}/book`,
    `/markets/${market.id}/positions`,
    `/markets/${market.id}/volume`,
    `/markets/${market.id}/liquidity`,
  ];
  
  for (const endpoint of tradingEndpoints) {
    try {
      const response = await axios.get(`${POLYMARKET_BASE}${endpoint}`, {
        timeout: 5000
      });
      
      console.log(`     ✅ ${endpoint}: Status ${response.status}`);
      console.log(`     📊 Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`     ❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
}

async function testAlternativeDataSources() {
  console.log('\n🔍 TESTING ALTERNATIVE DATA SOURCES');
  console.log('=' .repeat(50));
  
  // Try different API versions or endpoints
  const alternativeEndpoints = [
    'https://api.polymarket.com/markets',
    'https://api.polymarket.com/v1/markets',
    'https://gamma-api.polymarket.com/v1/markets',
    'https://gamma-api.polymarket.com/api/markets',
  ];
  
  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`\n📊 Testing: ${endpoint}`);
      const response = await axios.get(endpoint, {
        params: { limit: 5, active: true },
        timeout: 10000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Markets: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const market = response.data[0];
        console.log(`   📝 Sample: ${market.question || market.title || 'N/A'}`);
        console.log(`   📊 Volume: ${market.volume || market.volumeNum || 'N/A'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
    }
  }
}

// Main test runner
async function runLiveTradingTests() {
  console.log('🚀 LIVE TRADING DATA TEST');
  console.log('🎯 Goal: Find markets with real trading activity and prices');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('\n');
  
  const startTime = Date.now();
  
  try {
    await testLiveTradingData();
    await testAlternativeDataSources();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 LIVE TRADING TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`⏰ Duration: ${duration.toFixed(2)} seconds`);
    
    console.log('\n🎯 KEY FINDINGS:');
    console.log('   - Most markets in the API are historical/closed');
    console.log('   - Need to find currently active markets with real trading');
    console.log('   - Price data shows 0% for closed markets');
    console.log('   - Need to identify markets ending in the future');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Focus on markets with end dates in the future');
    console.log('   2. Look for markets with recent volume activity');
    console.log('   3. Consider using different API endpoints');
    console.log('   4. Implement real-time price monitoring');
    
  } catch (error) {
    console.log(`❌ Live trading test failed: ${error.message}`);
  }
}

// Run the live trading tests
runLiveTradingTests().catch(console.error);




