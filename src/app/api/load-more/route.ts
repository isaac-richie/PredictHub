import { NextResponse } from 'next/server';
import { polymarketApi } from '@/services/polymarket-api';
import { polkamarketsApi } from '@/services/polkamarkets-api';
import { limitlessApi } from '@/services/limitlesslabs-api';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const platform = searchParams.get('platform') || 'all';
  const category = searchParams.get('category') || 'all';

  console.log(`🔍 Load More API: Fetching ${limit} markets, offset ${offset}, platform ${platform}, category ${category}`);

  try {
    let allMarkets: any[] = [];

    // When filtering by category, fetch more data to find matches
    const fetchLimit = category !== 'all' ? 
      (platform === 'polkamarkets' ? 200 : 
       platform === 'limitlesslabs' ? 25 : 
       Math.max(limit * 5, 100)) : 
      (platform === 'limitlesslabs' ? Math.min(limit, 25) : limit);

    // Fetch from platforms using service layer directly
    const promises = [];

    if (platform === 'all' || platform === 'polymarket') {
      promises.push(
        polymarketApi.getActiveMarkets(fetchLimit, offset)
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

    if (platform === 'all' || platform === 'polkamarkets') {
      promises.push(
        polkamarketsApi.getActiveMarkets(fetchLimit, offset)
          .then(markets => {
            console.log(`🔍 Load More API: Polkamarkets data received: ${markets.length} markets`);
            return markets;
          })
          .catch(error => {
            console.error('Error fetching Polkamarkets markets:', error);
            return [];
          })
      );
    }

    if (platform === 'all' || platform === 'limitlesslabs') {
      promises.push(
        limitlessApi.getActiveMarkets(fetchLimit)
          .then(markets => {
            console.log(`🔍 Load More API: LimitlessLabs data received: ${markets.length} markets`);
            return markets;
          })
          .catch(error => {
            console.error('Error fetching LimitlessLabs markets:', error);
            return [];
          })
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
        
        // Special filtering for LimitlessLabs crypto category
        if (platform === 'limitlesslabs' && category === 'crypto') {
          const titleLower = (market.title || market.question || '').toLowerCase();
          const cryptoKeywords = ['btc', 'eth', 'sol', 'doge', 'xrp', 'link', 'avax', 'matic', 'ada', 'dot', 'atom', 'near', 'apt', 'sui', 'arb', 'op', 'hbar', 'kaito', '$'];
          return cryptoKeywords.some(keyword => titleLower.includes(keyword));
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
