import { NextResponse } from 'next/server';

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
    // For Polkamarkets, we need to fetch all 200 markets to cover all categories
    // For LimitlessLabs, cap at 25 (their API limit)
    const fetchLimit = category !== 'all' ? 
      (platform === 'polkamarkets' ? 200 : 
       platform === 'limitlesslabs' ? 25 : 
       Math.max(limit * 5, 100)) : 
      (platform === 'limitlesslabs' ? Math.min(limit, 25) : limit);

    if (platform === 'all' || platform === 'polymarket') {
      const polymarketResponse = await fetch(
          `http://localhost:3000/api/polymarket?endpoint=markets&limit=${fetchLimit}&offset=${offset}&order=created_at&ascending=false&closed=false&active=true`
        );
      
      if (polymarketResponse.ok) {
        const polymarketData = await polymarketResponse.json();
        const polymarketMarkets = polymarketData.map((market: any) => ({
          ...market,
          platform: 'polymarket'
        }));
        allMarkets = [...allMarkets, ...polymarketMarkets];
        console.log(`🔍 Load More API: Polymarket data received: ${polymarketData.length} markets`);
      }
    }

    if (platform === 'all' || platform === 'polkamarkets') {
      const polkamarketsResponse = await fetch(
        `http://localhost:3000/api/polkamarkets?endpoint=markets&limit=${fetchLimit}&offset=${offset}`
      );
      
      if (polkamarketsResponse.ok) {
        const polkamarketsData = await polkamarketsResponse.json();
        const polkamarketsMarkets = polkamarketsData.map((market: any) => ({
          ...market,
          platform: 'polkamarkets'
        }));
        allMarkets = [...allMarkets, ...polkamarketsMarkets];
        console.log(`🔍 Load More API: Polkamarkets data received: ${polkamarketsData.length} markets`);
      }
    }

    if (platform === 'all' || platform === 'limitlesslabs') {
      const limitlessResponse = await fetch(
        `http://localhost:3000/api/limitlesslabs?endpoint=markets&limit=${fetchLimit}&offset=${offset}`
      );
      
      if (limitlessResponse.ok) {
        const limitlessData = await limitlessResponse.json();
        const limitlessMarkets = limitlessData.map((market: any) => ({
          ...market,
          platform: 'limitlesslabs'
        }));
        allMarkets = [...allMarkets, ...limitlessMarkets];
        console.log(`🔍 Load More API: LimitlessLabs data received: ${limitlessData.length} markets`);
      }
    }

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
