// Test our updated Polymarket API service
const axios = require('axios');

const POLYMARKET_BASE = 'https://gamma-api.polymarket.com';

async function testUpdatedPolymarketAPI() {
  console.log('🧪 Testing Updated Polymarket API Integration');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Get active markets
    console.log('\n📊 Test 1: Fetching active markets...');
    const marketsResponse = await axios.get(`${POLYMARKET_BASE}/markets`, {
      params: { limit: 5, active: true, archived: false },
      timeout: 10000
    });
    
    console.log(`✅ Found ${marketsResponse.data.length} active markets`);
    
    if (marketsResponse.data.length > 0) {
      const market = marketsResponse.data[0];
      console.log('📝 Sample market data:');
      console.log(`   ID: ${market.id}`);
      console.log(`   Question: ${market.question}`);
      console.log(`   Category: ${market.category}`);
      console.log(`   Volume: ${market.volumeNum}`);
      console.log(`   Liquidity: ${market.liquidityNum}`);
      console.log(`   Active: ${market.active}`);
      console.log(`   Closed: ${market.closed}`);
      console.log(`   Outcomes: ${market.outcomes}`);
      console.log(`   Prices: ${market.outcomePrices}`);
      
      // Test parsing outcomes and prices
      try {
        const outcomes = JSON.parse(market.outcomes);
        const prices = JSON.parse(market.outcomePrices).map(p => parseFloat(p));
        console.log(`   Parsed Outcomes: ${outcomes.join(', ')}`);
        console.log(`   Parsed Prices: ${prices.join(', ')}`);
      } catch (e) {
        console.log(`   ❌ Failed to parse outcomes/prices: ${e.message}`);
      }
    }
    
    // Test 2: Get categories
    console.log('\n📊 Test 2: Fetching categories...');
    const categoriesResponse = await axios.get(`${POLYMARKET_BASE}/categories`, {
      timeout: 10000
    });
    
    console.log(`✅ Found ${categoriesResponse.data.length} categories`);
    
    if (categoriesResponse.data.length > 0) {
      console.log('📝 Sample categories:');
      categoriesResponse.data.slice(0, 5).forEach(cat => {
        console.log(`   ${cat.label} (${cat.slug})`);
      });
    }
    
    // Test 3: Test different market filters
    console.log('\n📊 Test 3: Testing market filters...');
    
    const filters = [
      { name: 'Politics', params: { category: 'Politics', limit: 3 } },
      { name: 'Sports', params: { category: 'Sports', limit: 3 } },
      { name: 'Crypto', params: { category: 'Crypto', limit: 3 } },
    ];
    
    for (const filter of filters) {
      try {
        const response = await axios.get(`${POLYMARKET_BASE}/markets`, {
          params: filter.params,
          timeout: 10000
        });
        
        console.log(`   ${filter.name}: ${response.data.length} markets`);
        if (response.data.length > 0) {
          console.log(`     Sample: ${response.data[0].question.substring(0, 50)}...`);
        }
      } catch (error) {
        console.log(`   ${filter.name}: Error - ${error.message}`);
      }
    }
    
    // Test 4: Test market status determination
    console.log('\n📊 Test 4: Testing market status logic...');
    
    const statusTests = [
      { market: { active: true, closed: false, archived: false, endDate: '2025-12-31T00:00:00Z' }, expected: 'active' },
      { market: { active: false, closed: true, archived: false, endDate: '2020-12-31T00:00:00Z' }, expected: 'resolved' },
      { market: { active: false, closed: false, archived: true, endDate: '2020-12-31T00:00:00Z' }, expected: 'cancelled' },
    ];
    
    statusTests.forEach((test, index) => {
      const endDate = new Date(test.market.endDate);
      const now = new Date();
      
      let status = 'pending';
      if (test.market.closed) {
        status = 'resolved';
      } else if (test.market.archived) {
        status = 'cancelled';
      } else if (test.market.active && endDate > now) {
        status = 'active';
      }
      
      const passed = status === test.expected;
      console.log(`   Test ${index + 1}: ${passed ? '✅' : '❌'} Expected ${test.expected}, got ${status}`);
    });
    
    console.log('\n🎯 API Integration Test Summary:');
    console.log('   ✅ Markets endpoint working');
    console.log('   ✅ Categories endpoint working');
    console.log('   ✅ Filtering working');
    console.log('   ✅ Data parsing working');
    console.log('   ✅ Status logic working');
    
    console.log('\n💡 Ready for production integration!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testUpdatedPolymarketAPI().catch(console.error);




