import { NextResponse } from 'next/server';
import { polymarketApi } from '@/services/polymarket-api';
import { myriadApi } from '@/services/myriad-api';
import { limitlessApi } from '@/services/limitlesslabs-api';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10); // Increased default from 50 to 100
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const platform = searchParams.get('platform') || 'all';
  const category = searchParams.get('category') || 'all';
  const timeframe = searchParams.get('timeframe') || 'all'; // Add timeframe support

  console.log(`🔍 Load More API: Fetching ${limit} markets, offset ${offset}, platform ${platform}, category ${category}, timeframe ${timeframe}`);

  try {
    let allMarkets: any[] = [];

    // Enhanced limit handling for more comprehensive data
    const fetchLimit = category !== 'all' ? 
      (platform === 'limitlesslabs' ? 50 : // Increased from 25 to 50
       Math.max(limit * 8, 200)) : // Increased multiplier from 5 to 8, min from 100 to 200
      (platform === 'limitlesslabs' ? Math.min(limit, 50) : limit); // Increased from 25 to 50

    // Fetch from platforms using service layer directly
    const promises = [];

    if (platform === 'all' || platform === 'polymarket') {
      promises.push(
        polymarketApi.getActiveMarkets(fetchLimit, offset, timeframe)
          .then(markets => {
            console.log(`🔍 Load More API: Polymarket data received: ${markets.length} markets`);
            return markets;
          })
          .catch(error => {
            console.error('Error fetching Polymarket markets:', error);
            return [];
          })
      );
    }

    if (platform === 'all' || platform === 'myriad') {
      promises.push(
        myriadApi.getActiveMarkets(fetchLimit, offset, timeframe)
          .then(markets => {
            console.log(`🔍 Load More API: Myriad data received: ${markets.length} markets`);
            return markets;
          })
          .catch(error => {
            console.error('Error fetching Myriad markets:', error);
            return [];
          })
      );
    }

    if (platform === 'all' || platform === 'limitlesslabs') {
      promises.push(
        (async () => {
          try {
            console.log(`🔍 Load More API: Fetching LimitlessLabs markets directly`);
            
            // Calculate page from offset
            const maxLimit = 25;
            const page = Math.floor(offset / maxLimit) + 1;
            
            let apiUrl = '';
            switch (timeframe) {
              case '24h':
                apiUrl = `https://api.limitless.exchange/markets/active?page=${page}&limit=${maxLimit}&sort=volume&timeframe=24h`;
                break;
              case '7d':
                apiUrl = `https://api.limitless.exchange/markets/active?page=${page}&limit=${maxLimit}&sort=volume&timeframe=7d`;
                break;
              case '30d':
                apiUrl = `https://api.limitless.exchange/markets/active?page=${page}&limit=${maxLimit}&sort=volume&timeframe=30d`;
                break;
              case 'future':
                apiUrl = `https://api.limitless.exchange/markets/upcoming?page=${page}&limit=${maxLimit}`;
                break;
              case 'trending':
                apiUrl = `https://api.limitless.exchange/markets/trending?page=${page}&limit=${maxLimit}`;
                break;
              default:
                apiUrl = `https://api.limitless.exchange/markets/active?page=${page}&limit=${maxLimit}`;
            }
            
            console.log(`🔍 Load More API: LimitlessLabs URL: ${apiUrl}`);
            
            const response = await fetch(apiUrl, { next: { revalidate: 60 } });
            
            if (!response.ok) {
              console.error(`❌ Load More API: LimitlessLabs HTTP error ${response.status}`);
              return [];
            }
            
            const data = await response.json();
            const markets = Array.isArray(data) ? data : (data.items || data.data || []);
            
            console.log(`✅ Load More API: LimitlessLabs fetched ${markets.length} markets`);
            
            // Transform markets to our format
            const transformedMarkets = markets.map((market: any) => {
              const yesPct = Array.isArray(market?.prices) ? parseFloat(market.prices[0]) : 0;
              const noPct = Array.isArray(market?.prices) ? parseFloat(market.prices[1]) : 0;
              
              const yesPrice = yesPct > 1 ? yesPct / 100 : yesPct;
              const noPrice = noPct > 1 ? noPct / 100 : noPct;

              const volumeNum = parseFloat(market.volumeFormatted || '0') * 1000;
              const liquidityNum = parseFloat(market.liquidityFormatted || '0') * 1000;
              const openInterestNum = parseFloat(market.openInterestFormatted || '0') * 1000;

              return {
                id: `limitlesslabs_${market.id}`,
                platform: 'limitlesslabs',
                title: market.title || 'Untitled',
                question: market.title || 'Untitled',
                description: market.description || '',
                category: Array.isArray(market.categories) && market.categories.length ? market.categories[0] : 'Other',
                tags: market.tags || [],
                active: market.status !== 'RESOLVED' && market.expired !== true,
                status: market.status,
                startDate: market.createdAt || new Date().toISOString(),
                endDate: market.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: market.createdAt || new Date().toISOString(),
                updatedAt: market.updatedAt || new Date().toISOString(),
                outcomes: ['Yes', 'No'],
                outcomePrices: [String(yesPrice), String(noPrice)],
                yesPrice,
                noPrice,
                volume: volumeNum,
                liquidity: liquidityNum,
                totalVolume: volumeNum,
                openInterest: openInterestNum,
                externalUrl: market.slug ? `https://limitless.exchange/advanced/markets/${market.slug}` : 'https://limitless.exchange/',
                slug: market.slug,
                volumeNum,
                liquidityNum,
              };
            });
            
            return transformedMarkets;
          } catch (error) {
            console.error('Error fetching LimitlessLabs markets:', error);
            return [];
          }
        })()
      );
    }

    const results = await Promise.all(promises);
    allMarkets = results.flat();

    // Sort markets by date in descending order (newest first)
    allMarkets = allMarkets.sort((a, b) => {
      const dateA = new Date(a.endDate || 0);
      const dateB = new Date(b.endDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Apply category filtering
    if (category !== 'all') {
      console.log(`🔍 Load More API: Filtering by category: ${category}`);
      allMarkets = allMarkets.filter(market => {
        // Check if market.category matches (case-insensitive)
        if (market.category && market.category.toLowerCase() === category.toLowerCase()) {
          return true;
        }
        
        // Special filtering for LimitlessLabs categories
        if (platform === 'limitlesslabs') {
          const titleLower = (market.title || market.question || '').toLowerCase();
          
          if (category === 'crypto') {
            const cryptoKeywords = ['btc', 'eth', 'sol', 'doge', 'xrp', 'link', 'avax', 'matic', 'ada', 'dot', 'atom', 'near', 'apt', 'sui', 'arb', 'op', 'hbar', 'kaito', 'pump', '$btc', '$eth', '$sol', '$doge', '$xrp'];
            return cryptoKeywords.some(keyword => titleLower.includes(keyword));
          }
          
          if (category === 'stocks') {
            const stockKeywords = ['spy', 's&p', 'nasdaq', 'dow', 'tsla', 'aapl', 'msft', 'googl', 'amzn', 'nvda', 'meta', 'tesla', 'apple', 'microsoft', 'google', 'amazon', 'nvidia', '$spy', 'stock', 'index'];
            return stockKeywords.some(keyword => titleLower.includes(keyword));
          }
        }
        
        // Also check tags array if it exists
        if (market.tags && Array.isArray(market.tags)) {
          return market.tags.some((tag: string) => 
            tag.toLowerCase() === category.toLowerCase()
          );
        }
        
        return false;
      });
      console.log(`🔍 Load More API: After filtering: ${allMarkets.length} markets match category "${category}"`);
    }

    // Shuffle and slice if fetching from 'all' to show mixed markets randomly
    if (platform === 'all') {
      allMarkets = allMarkets
        .sort(() => Math.random() - 0.5) // Random shuffle
        .slice(0, limit);
    } else {
      // For specific platforms, just slice after filtering
      allMarkets = allMarkets.slice(0, limit);
    }

    console.log(`🔍 Load More API: Total markets returned: ${allMarkets.length}`);
    return NextResponse.json(allMarkets);
  } catch (error: any) {
    console.error('Error in Load More API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
