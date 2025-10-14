// Find the Live Polymarket Trading API
const axios = require('axios');

async function findLivePolymarketAPI() {
  console.log('🔍 SEARCHING FOR LIVE POLYMARKET API');
  console.log('🎯 Goal: Find the real-time trading API with current market data');
  console.log('=' .repeat(70));
  
  // Known Polymarket API endpoints to test
  const apiEndpoints = [
    // Official Polymarket APIs
    'https://gamma-api.polymarket.com',
    'https://api.polymarket.com',
    'https://api.polymarket.io',
    'https://api.polymarket.co',
    
    // Alternative endpoints
    'https://clob.polymarket.com',
    'https://api-clob.polymarket.com',
    'https://trading.polymarket.com',
    'https://markets.polymarket.com',
    
    // Versioned APIs
    'https://gamma-api.polymarket.com/v1',
    'https://gamma-api.polymarket.com/v2',
    'https://api.polymarket.com/v1',
    'https://api.polymarket.com/v2',
    
    // GraphQL endpoints
    'https://api.thegraph.com/subgraphs/name/polymarket/polymarket',
    'https://api.thegraph.com/subgraphs/name/polymarket/polymarket-mainnet',
    'https://api.thegraph.com/subgraphs/name/polymarket/polymarket-optimism',
  ];
  
  const workingAPIs = [];
  
  for (const baseUrl of apiEndpoints) {
    console.log(`\n🔍 Testing: ${baseUrl}`);
    
    try {
      // Test different endpoints on each base URL
      const endpoints = [
        '/markets',
        '/api/markets',
        '/v1/markets',
        '/v2/markets',
        '/trading/markets',
        '/clob/markets',
        '/graphql',
      ];
      
      let foundWorking = false;
      
      for (const endpoint of endpoints) {
        try {
          const url = `${baseUrl}${endpoint}`;
          console.log(`   📡 Testing: ${endpoint}`);
          
          const response = await axios.get(url, {
            params: { limit: 5 },
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; PredictionTracker/1.0)'
            }
          });
          
          console.log(`   ✅ Status: ${response.status}`);
          
          if (response.data) {
            const dataType = Array.isArray(response.data) ? 'Array' : 'Object';
            const dataLength = Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length;
            
            console.log(`   📊 Data: ${dataType} with ${dataLength} items`);
            
            // Check if this looks like market data
            if (Array.isArray(response.data) && response.data.length > 0) {
              const sample = response.data[0];
              if (sample.question || sample.title || sample.id) {
                console.log(`   🎯 Found market data!`);
                console.log(`   📝 Sample: ${sample.question || sample.title || 'N/A'}`);
                
                // Check if it's current data
                const hasCurrentData = sample.endDate && new Date(sample.endDate) > new Date();
                const hasTradingData = sample.volume > 0 || sample.liquidity > 0;
                
                console.log(`   📅 Current data: ${hasCurrentData ? 'Yes' : 'No'}`);
                console.log(`   💰 Trading data: ${hasTradingData ? 'Yes' : 'No'}`);
                
                workingAPIs.push({
                  baseUrl,
                  endpoint,
                  status: response.status,
                  dataType,
                  dataLength,
                  hasCurrentData,
                  hasTradingData,
                  sample: sample
                });
                
                foundWorking = true;
              }
            }
          }
          
        } catch (endpointError) {
          console.log(`   ❌ ${endpoint}: ${endpointError.response?.status || endpointError.message}`);
        }
      }
      
      if (!foundWorking) {
        console.log(`   ⚠️  No working endpoints found on ${baseUrl}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Base URL error: ${error.message}`);
    }
  }
  
  // Summary of findings
  console.log('\n' + '=' .repeat(70));
  console.log('📊 API DISCOVERY SUMMARY');
  console.log('=' .repeat(70));
  
  if (workingAPIs.length === 0) {
    console.log('❌ No working APIs found');
    console.log('\n💡 This might mean:');
    console.log('   1. Polymarket has changed their API structure');
    console.log('   2. APIs require authentication/API keys');
    console.log('   3. APIs are behind rate limiting or CORS protection');
    console.log('   4. We need to use WebSocket connections for real-time data');
  } else {
    console.log(`✅ Found ${workingAPIs.length} working API endpoints:`);
    
    workingAPIs.forEach((api, index) => {
      console.log(`\n${index + 1}. ${api.baseUrl}${api.endpoint}`);
      console.log(`   Status: ${api.status}`);
      console.log(`   Data: ${api.dataType} with ${api.dataLength} items`);
      console.log(`   Current: ${api.hasCurrentData ? 'Yes' : 'No'}`);
      console.log(`   Trading: ${api.hasTradingData ? 'Yes' : 'No'}`);
      console.log(`   Sample: ${api.sample.question || api.sample.title || 'N/A'}`);
    });
  }
  
  // Test WebSocket connections
  console.log('\n🔌 TESTING WEBSOCKET CONNECTIONS');
  console.log('=' .repeat(50));
  
  const wsEndpoints = [
    'wss://gamma-api.polymarket.com/ws',
    'wss://api.polymarket.com/ws',
    'wss://clob.polymarket.com/ws',
    'wss://trading.polymarket.com/ws',
  ];
  
  console.log('💡 WebSocket endpoints to test manually:');
  wsEndpoints.forEach(ws => {
    console.log(`   ${ws}`);
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('   1. Check Polymarket\'s official documentation');
  console.log('   2. Look for API keys or authentication requirements');
  console.log('   3. Consider using their frontend API calls');
  console.log('   4. Test WebSocket connections for real-time data');
  console.log('   5. Look for GraphQL subscriptions');
  
  return workingAPIs;
}

// Test specific known working endpoints
async function testKnownEndpoints() {
  console.log('\n🧪 TESTING KNOWN WORKING ENDPOINTS');
  console.log('=' .repeat(50));
  
  // These are endpoints that might work based on common patterns
  const knownEndpoints = [
    {
      name: 'Polymarket Frontend API',
      url: 'https://gamma-api.polymarket.com/markets',
      params: { limit: 10, active: true, sort: 'volume' }
    },
    {
      name: 'Polymarket Categories',
      url: 'https://gamma-api.polymarket.com/categories',
      params: {}
    },
    {
      name: 'Polymarket Search',
      url: 'https://gamma-api.polymarket.com/markets/search',
      params: { q: 'bitcoin', limit: 5 }
    }
  ];
  
  for (const endpoint of knownEndpoints) {
    try {
      console.log(`\n📊 Testing: ${endpoint.name}`);
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        timeout: 10000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${Array.isArray(response.data) ? response.data.length : 'Object'} items`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const sample = response.data[0];
        console.log(`   📝 Sample: ${sample.question || sample.title || sample.label || 'N/A'}`);
        
        // Check for current data
        if (sample.endDate) {
          const endDate = new Date(sample.endDate);
          const isCurrent = endDate > new Date();
          console.log(`   📅 Current: ${isCurrent ? 'Yes' : 'No'} (ends ${sample.endDate})`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
    }
  }
}

// Main test runner
async function runAPIDiscovery() {
  console.log('🚀 POLYMARKET API DISCOVERY');
  console.log('🎯 Goal: Find the real-time trading API');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('\n');
  
  try {
    await testKnownEndpoints();
    const workingAPIs = await findLivePolymarketAPI();
    
    console.log('\n🎯 FINAL RECOMMENDATIONS:');
    if (workingAPIs.length > 0) {
      console.log('   ✅ Use the working APIs found above');
      console.log('   📊 Focus on APIs with current trading data');
      console.log('   🔄 Implement real-time updates');
    } else {
      console.log('   🔍 Research Polymarket\'s current API documentation');
      console.log('   🔑 Look for API key requirements');
      console.log('   🌐 Consider using their frontend API calls');
      console.log('   📡 Test WebSocket connections for live data');
    }
    
  } catch (error) {
    console.log(`❌ API discovery failed: ${error.message}`);
  }
}

// Run the API discovery
runAPIDiscovery().catch(console.error);




