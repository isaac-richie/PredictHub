// Comprehensive Polymarket API Deep Test
const axios = require('axios');
const fs = require('fs');

const POLYMARKET_BASE = 'https://gamma-api.polymarket.com';

// Test configuration
const TEST_CONFIG = {
  timeout: 15000,
  maxRetries: 3,
  delayBetweenRequests: 1000 // 1 second delay to be respectful
};

// Utility function to delay requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test all available endpoints
async function testAllEndpoints() {
  console.log('🔍 POLYMARKET API COMPREHENSIVE TEST');
  console.log('=' .repeat(80));
  
  const endpoints = [
    { name: 'Markets List', path: '/markets', params: { limit: 10 } },
    { name: 'Markets List (All)', path: '/markets', params: { limit: 100 } },
    { name: 'Markets List (Active Only)', path: '/markets', params: { active: true, limit: 50 } },
    { name: 'Markets List (Archived)', path: '/markets', params: { archived: true, limit: 20 } },
    { name: 'Markets List (Closed)', path: '/markets', params: { closed: true, limit: 20 } },
    { name: 'Markets by Category', path: '/markets', params: { category: 'Politics', limit: 10 } },
    { name: 'Markets Search', path: '/markets/search', params: { q: 'election', limit: 10 } },
    { name: 'Volume Stats', path: '/volume/24h', params: {} },
    { name: 'Volume Stats (7d)', path: '/volume/7d', params: {} },
    { name: 'Volume Stats (30d)', path: '/volume/30d', params: {} },
    { name: 'Categories List', path: '/categories', params: {} },
    { name: 'Tokens List', path: '/tokens', params: { limit: 20 } },
    { name: 'Users List', path: '/users', params: { limit: 10 } },
    { name: 'Orders List', path: '/orders', params: { limit: 10 } },
    { name: 'Trades List', path: '/trades', params: { limit: 10 } },
    { name: 'Positions List', path: '/positions', params: { limit: 10 } },
  ];

  const results = {};
  
  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.path}`);
    console.log(`   Params:`, endpoint.params);
    
    try {
      const response = await axios.get(`${POLYMARKET_BASE}${endpoint.path}`, {
        params: endpoint.params,
        timeout: TEST_CONFIG.timeout
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data Type: ${Array.isArray(response.data) ? 'Array' : 'Object'}`);
      console.log(`   📏 Data Length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length}`);
      
      // Save detailed data for analysis
      results[endpoint.name] = {
        success: true,
        status: response.status,
        dataType: Array.isArray(response.data) ? 'Array' : 'Object',
        dataLength: Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length,
        sampleData: Array.isArray(response.data) ? response.data.slice(0, 2) : response.data,
        fullData: response.data
      };
      
      // Show sample data structure
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`   🔍 Sample Item Keys:`, Object.keys(response.data[0]));
        console.log(`   📝 Sample Item:`, JSON.stringify(response.data[0], null, 2).substring(0, 300) + '...');
      } else if (typeof response.data === 'object') {
        console.log(`   🔍 Response Keys:`, Object.keys(response.data));
        console.log(`   📝 Sample Data:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   📊 Status: ${error.response?.status || 'No response'}`);
      
      results[endpoint.name] = {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
    
    // Be respectful with delays
    await delay(TEST_CONFIG.delayBetweenRequests);
  }
  
  return results;
}

// Test specific market details
async function testMarketDetails() {
  console.log('\n🔍 TESTING SPECIFIC MARKET DETAILS');
  console.log('=' .repeat(50));
  
  try {
    // First get a list of markets
    const marketsResponse = await axios.get(`${POLYMARKET_BASE}/markets`, {
      params: { limit: 5, active: true },
      timeout: TEST_CONFIG.timeout
    });
    
    if (marketsResponse.data && marketsResponse.data.length > 0) {
      const marketId = marketsResponse.data[0].id;
      console.log(`\n📊 Testing market details for ID: ${marketId}`);
      
      // Test individual market endpoints
      const marketEndpoints = [
        { name: 'Market Details', path: `/markets/${marketId}` },
        { name: 'Market Trades', path: `/markets/${marketId}/trades` },
        { name: 'Market Orders', path: `/markets/${marketId}/orders` },
        { name: 'Market Positions', path: `/markets/${marketId}/positions` },
        { name: 'Market Price History', path: `/markets/${marketId}/price-history` },
        { name: 'Market Volume', path: `/markets/${marketId}/volume` },
        { name: 'Market Liquidity', path: `/markets/${marketId}/liquidity` },
      ];
      
      for (const endpoint of marketEndpoints) {
        try {
          console.log(`\n   📡 Testing: ${endpoint.name}`);
          const response = await axios.get(`${POLYMARKET_BASE}${endpoint.path}`, {
            timeout: TEST_CONFIG.timeout
          });
          
          console.log(`   ✅ Status: ${response.status}`);
          console.log(`   📊 Data:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
          
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
        
        await delay(TEST_CONFIG.delayBetweenRequests);
      }
    }
  } catch (error) {
    console.log(`❌ Error getting market list: ${error.message}`);
  }
}

// Test pagination and limits
async function testPagination() {
  console.log('\n🔍 TESTING PAGINATION & LIMITS');
  console.log('=' .repeat(40));
  
  const limits = [1, 5, 10, 25, 50, 100, 200];
  
  for (const limit of limits) {
    try {
      console.log(`\n📊 Testing limit: ${limit}`);
      const response = await axios.get(`${POLYMARKET_BASE}/markets`, {
        params: { limit, active: true },
        timeout: TEST_CONFIG.timeout
      });
      
      console.log(`   ✅ Returned: ${response.data.length} items`);
      console.log(`   📏 Requested: ${limit} items`);
      console.log(`   🎯 Efficiency: ${(response.data.length / limit * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.log(`   ❌ Error with limit ${limit}: ${error.message}`);
    }
    
    await delay(TEST_CONFIG.delayBetweenRequests);
  }
}

// Test filtering and search capabilities
async function testFiltering() {
  console.log('\n🔍 TESTING FILTERING & SEARCH');
  console.log('=' .repeat(40));
  
  const filters = [
    { name: 'Active Markets', params: { active: true, limit: 10 } },
    { name: 'Archived Markets', params: { archived: true, limit: 10 } },
    { name: 'Closed Markets', params: { closed: true, limit: 10 } },
    { name: 'Politics Category', params: { category: 'Politics', limit: 10 } },
    { name: 'Sports Category', params: { category: 'Sports', limit: 10 } },
    { name: 'Crypto Category', params: { category: 'Crypto', limit: 10 } },
    { name: 'Search "election"', params: { q: 'election', limit: 10 } },
    { name: 'Search "bitcoin"', params: { q: 'bitcoin', limit: 10 } },
    { name: 'Search "trump"', params: { q: 'trump', limit: 10 } },
  ];
  
  for (const filter of filters) {
    try {
      console.log(`\n📊 Testing: ${filter.name}`);
      const response = await axios.get(`${POLYMARKET_BASE}/markets`, {
        params: filter.params,
        timeout: TEST_CONFIG.timeout
      });
      
      console.log(`   ✅ Found: ${response.data.length} markets`);
      if (response.data.length > 0) {
        console.log(`   📝 Sample: ${response.data[0].question || response.data[0].title || 'N/A'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    await delay(TEST_CONFIG.delayBetweenRequests);
  }
}

// Analyze data structure in detail
async function analyzeDataStructure() {
  console.log('\n🔍 ANALYZING DATA STRUCTURE');
  console.log('=' .repeat(40));
  
  try {
    const response = await axios.get(`${POLYMARKET_BASE}/markets`, {
      params: { limit: 5, active: true },
      timeout: TEST_CONFIG.timeout
    });
    
    if (response.data && response.data.length > 0) {
      const market = response.data[0];
      console.log('\n📊 Market Object Structure:');
      console.log('   Keys:', Object.keys(market));
      console.log('\n📝 Detailed Analysis:');
      
      Object.entries(market).forEach(([key, value]) => {
        const type = typeof value;
        const isArray = Array.isArray(value);
        const length = isArray ? value.length : (typeof value === 'string' ? value.length : 'N/A');
        
        console.log(`   ${key}:`);
        console.log(`     Type: ${isArray ? 'Array' : type}`);
        console.log(`     Length: ${length}`);
        console.log(`     Value: ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
        console.log('');
      });
      
      // Save full sample for analysis
      fs.writeFileSync('polymarket-sample-data.json', JSON.stringify(market, null, 2));
      console.log('💾 Full sample data saved to: polymarket-sample-data.json');
    }
  } catch (error) {
    console.log(`❌ Error analyzing data structure: ${error.message}`);
  }
}

// Main test runner
async function runDeepTest() {
  console.log('🚀 POLYMARKET API DEEP STRESS TEST');
  console.log('🎯 Goal: Extract every possible detail from Polymarket API');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('\n');
  
  const startTime = Date.now();
  
  try {
    // Run all tests
    const endpointResults = await testAllEndpoints();
    await testMarketDetails();
    await testPagination();
    await testFiltering();
    await analyzeDataStructure();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 DEEP TEST SUMMARY');
    console.log('=' .repeat(80));
    console.log(`⏰ Duration: ${duration.toFixed(2)} seconds`);
    console.log(`✅ Successful endpoints: ${Object.values(endpointResults).filter(r => r.success).length}`);
    console.log(`❌ Failed endpoints: ${Object.values(endpointResults).filter(r => !r.success).length}`);
    
    // Save comprehensive results
    const fullResults = {
      timestamp: new Date().toISOString(),
      duration: duration,
      endpointResults: endpointResults,
      summary: {
        totalEndpoints: Object.keys(endpointResults).length,
        successful: Object.values(endpointResults).filter(r => r.success).length,
        failed: Object.values(endpointResults).filter(r => !r.success).length
      }
    };
    
    fs.writeFileSync('polymarket-deep-test-results.json', JSON.stringify(fullResults, null, 2));
    console.log('💾 Full results saved to: polymarket-deep-test-results.json');
    
    console.log('\n🎯 KEY FINDINGS:');
    console.log('   - Check the JSON files for detailed data structures');
    console.log('   - Use this data to build accurate TypeScript interfaces');
    console.log('   - Identify the most reliable endpoints for production use');
    console.log('   - Note any rate limiting or authentication requirements');
    
  } catch (error) {
    console.log(`❌ Deep test failed: ${error.message}`);
  }
}

// Run the deep test
runDeepTest().catch(console.error);




