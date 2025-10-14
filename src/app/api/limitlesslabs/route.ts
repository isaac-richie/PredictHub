import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'markets';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  console.log(`🔍 LimitlessLabs API: Fetching ${endpoint}, limit: ${limit}, offset: ${offset}`);

  try {
    if (endpoint === 'markets') {
      // Fetch active markets from LimitlessLabs (max 25 per request)
      const maxLimit = Math.min(limit, 25);
      const response = await fetch(
        `https://api.limitless.exchange/markets/active?page=1&limit=${maxLimit}`,
        { next: { revalidate: 60 } }
      );

      if (!response.ok) {
        console.error(`❌ LimitlessLabs API: Failed to fetch markets, status: ${response.status}`);
        return NextResponse.json([]);
      }

      const data = await response.json();
      const markets = Array.isArray(data) ? data : (data.items || data.data || []);

      console.log(`✅ LimitlessLabs API: Fetched ${markets.length} markets`);

      // Transform markets to our format
      const transformedMarkets = markets.map((market: any) => {
        const yesPct = Array.isArray(market?.prices) ? parseFloat(market.prices[0]) : 0;
        const noPct = Array.isArray(market?.prices) ? parseFloat(market.prices[1]) : 0;
        
        // Convert percentage to 0-1 range
        const yesPrice = yesPct > 1 ? yesPct / 100 : yesPct;
        const noPrice = noPct > 1 ? noPct / 100 : noPct;

        // Parse formatted values (they're in thousands)
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
          externalUrl: market.slug ? `https://limitless.exchange/market/${market.slug}` : undefined,
          slug: market.slug,
          volumeNum,
          liquidityNum,
        };
      });

      return NextResponse.json(transformedMarkets);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error('❌ LimitlessLabs API Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

