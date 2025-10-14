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

    // Search all platforms in parallel using service layer
    const searchPromises = [
      // Search Polymarket
      polymarketApi.getActiveMarkets(200, 0)
        .then(markets => {
          const results = markets.filter(market => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          });
          console.log(`🔍 Search API: Found ${results.length} Polymarket results`);
          return results;
        })
        .catch(error => {
          console.error('🔍 Search API: Error searching Polymarket:', error);
          return [];
        }),

      // Search Polkamarkets
      polkamarketsApi.getActiveMarkets(200, 0)
        .then(markets => {
          const results = markets.filter(market => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          });
          console.log(`🔍 Search API: Found ${results.length} Polkamarkets results`);
          return results;
        })
        .catch(error => {
          console.error('🔍 Search API: Error searching Polkamarkets:', error);
          return [];
        }),

      // Search LimitlessLabs
      limitlessApi.getActiveMarkets(25)
        .then(markets => {
          const results = markets.filter(market => {
            const title = (market.title || market.question || '').toLowerCase();
            const description = (market.description || '').toLowerCase();
            const category = (market.category || '').toLowerCase();
            return title.includes(searchQuery) || 
                   description.includes(searchQuery) || 
                   category.includes(searchQuery);
          });
          console.log(`🔍 Search API: Found ${results.length} LimitlessLabs results`);
          return results;
        })
        .catch(error => {
          console.error('🔍 Search API: Error searching LimitlessLabs:', error);
          return [];
        })
    ];

    const results = await Promise.all(searchPromises);
    allResults = results.flat();

    // Sort by relevance (exact matches first, then partial matches)
    // Then by volume for ties
    allResults = allResults.sort((a, b) => {
      const aTitleExact = (a.title || a.question || '').toLowerCase() === searchQuery;
      const bTitleExact = (b.title || b.question || '').toLowerCase() === searchQuery;
      
      if (aTitleExact && !bTitleExact) return -1;
      if (!aTitleExact && bTitleExact) return 1;
      
      // If both exact or both not exact, sort by volume
      return (b.totalVolume || 0) - (a.totalVolume || 0);
    });

    // Limit results
    allResults = allResults.slice(0, limit);

    console.log(`🔍 Search API: Total results: ${allResults.length}`);
    return NextResponse.json(allResults);
  } catch (error: any) {
    console.error('Error in Search API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
