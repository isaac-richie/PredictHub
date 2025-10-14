import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  console.log(`🔍 Search API: Searching for "${query}", limit: ${limit}`);

  if (!query || query.trim().length < 2) {
    console.log('🔍 Search API: Query too short, returning empty results');
    return NextResponse.json([]);
  }

  try {
    const searchQuery = query.toLowerCase().trim();
    let allResults: any[] = [];

    // Search Polymarket
    try {
      const polymarketResponse = await fetch(
        `http://localhost:3000/api/polymarket?endpoint=markets&limit=200&offset=0&order=created_at&ascending=false&closed=false&active=true`
      );
      
      if (polymarketResponse.ok) {
        const polymarketData = await polymarketResponse.json();
        const polymarketResults = polymarketData
          .filter((market: any) => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          })
          .map((market: any) => ({
            ...market,
            platform: 'polymarket'
          }));
        
        allResults = [...allResults, ...polymarketResults];
        console.log(`🔍 Search API: Found ${polymarketResults.length} Polymarket results`);
      }
    } catch (error) {
      console.error('🔍 Search API: Error searching Polymarket:', error);
    }

    // Search Polkamarkets
    try {
      const polkamarketsResponse = await fetch(
        `http://localhost:3000/api/polkamarkets?endpoint=markets&limit=200&offset=0`
      );
      
      if (polkamarketsResponse.ok) {
        const polkamarketsData = await polkamarketsResponse.json();
        const polkamarketsResults = polkamarketsData
          .filter((market: any) => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          })
          .map((market: any) => ({
            ...market,
            platform: 'polkamarkets'
          }));
        
        allResults = [...allResults, ...polkamarketsResults];
        console.log(`🔍 Search API: Found ${polkamarketsResults.length} Polkamarkets results`);
      }
    } catch (error) {
      console.error('🔍 Search API: Error searching Polkamarkets:', error);
    }

    // Search LimitlessLabs
    try {
      const limitlessResponse = await fetch(
        `http://localhost:3000/api/limitlesslabs?endpoint=markets&limit=25&offset=0`
      );
      
      if (limitlessResponse.ok) {
        const limitlessData = await limitlessResponse.json();
        const limitlessResults = limitlessData
          .filter((market: any) => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          })
          .map((market: any) => ({
            ...market,
            platform: 'limitlesslabs'
          }));
        
        allResults = [...allResults, ...limitlessResults];
        console.log(`🔍 Search API: Found ${limitlessResults.length} LimitlessLabs results`);
      }
    } catch (error) {
      console.error('🔍 Search API: Error searching LimitlessLabs:', error);
    }

    // Sort by relevance (exact matches first, then by volume)
    const sortedResults = allResults.sort((a, b) => {
      const aTitle = (a.title || a.question || '').toLowerCase();
      const bTitle = (b.title || b.question || '').toLowerCase();
      
      // Exact matches first
      const aExact = aTitle === searchQuery ? 1 : 0;
      const bExact = bTitle === searchQuery ? 1 : 0;
      
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by title starts with query
      const aStarts = aTitle.startsWith(searchQuery) ? 1 : 0;
      const bStarts = bTitle.startsWith(searchQuery) ? 1 : 0;
      
      if (aStarts !== bStarts) return bStarts - aStarts;
      
      // Finally by volume
      return (b.volumeNum || b.totalVolume || 0) - (a.volumeNum || a.totalVolume || 0);
    });

    const limitedResults = sortedResults.slice(0, limit);
    
    console.log(`🔍 Search API: Returning ${limitedResults.length} total results`);
    return NextResponse.json(limitedResults);
  } catch (error: any) {
    console.error('🔍 Search API: Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

