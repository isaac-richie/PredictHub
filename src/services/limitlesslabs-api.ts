import { PredictionMarket } from '@/types/prediction-market';

const BASE_URL = 'https://api.limitless.exchange/api-v1';

function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  const n = parseFloat(String(value ?? '0'));
  return isNaN(n) ? 0 : n;
}

function normalizeMarket(raw: any): PredictionMarket {
  const yesPct = Array.isArray(raw?.prices) ? toNumber(raw.prices[0]) : 0;
  const noPct = Array.isArray(raw?.prices) ? toNumber(raw.prices[1]) : 0;
  // Limitless returns percentage values (e.g., 42.8). Convert to 0-1.
  const yesPrice = yesPct > 1 ? yesPct / 100 : yesPct;
  const noPrice = noPct > 1 ? noPct / 100 : noPct;

  // Formatted values appear to be in thousands (e.g., 164.109293 => 164.1K)
  const volumeNum = toNumber(raw.volumeFormatted) * 1000 || toNumber(raw.volume);
  // Limitless API doesn't provide liquidity data, so we'll use volume as a proxy
  const liquidityNum = toNumber(raw.liquidityFormatted) * 1000 || toNumber(raw.liquidity) || (volumeNum * 0.1); // Use 10% of volume as liquidity estimate
  const openInterestNum = toNumber(raw.openInterestFormatted) * 1000 || toNumber(raw.openInterest);

  return {
    id: `limitlesslabs_${raw.id ?? raw.slug ?? Math.random().toString(36).slice(2)}`,
    platform: 'limitlesslabs',
    title: raw.title ?? raw.question ?? 'Untitled',
    question: raw.title ?? raw.question ?? 'Untitled',
    category: Array.isArray(raw.categories) && raw.categories.length ? raw.categories[0] : 'Other',
    active: raw.status ? String(raw.status).toUpperCase() !== 'RESOLVED' && raw.expired !== true : true,
    startDate: raw.creationTimestamp ? new Date(raw.creationTimestamp) : new Date(),
    endDate: raw.expirationTimestamp ? new Date(raw.expirationTimestamp) : (raw.expirationDate ? new Date(raw.expirationDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
    outcomes: ['Yes', 'No'],
    outcomePrices: [String(yesPrice), String(noPrice)],
    yesPrice,
    noPrice,
    volume: volumeNum,
    liquidity: liquidityNum,
    totalVolume: volumeNum,
    externalUrl: raw.id ? `https://limitless.exchange/advanced/markets/${raw.id}` : undefined,
    slug: raw.slug,
    volumeNum,
    liquidityNum,
    openInterest: openInterestNum,
  } as unknown as PredictionMarket;
}

async function safeJson(res: Response) {
  try { 
    const text = await res.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (e) { 
    console.error('❌ LimitlessLabs: JSON parse error:', e instanceof Error ? e.message : String(e));
    return {}; 
  }
}

export const limitlessApi = {
  async getActiveMarkets(limit: number = 150, offset: number = 0, timeframe: string = 'all'): Promise<PredictionMarket[]> {
    console.log(`🔍 LimitlessLabs: getActiveMarkets CALLED with limit: ${limit}, offset: ${offset}, timeframe: ${timeframe}`);
    try {
      // Always call the external API directly to avoid circular dependencies
      console.log(`🔍 LimitlessLabs: Fetching external API directly`);
      
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
      
      console.log(`🔍 LimitlessLabs: External API URL: ${apiUrl}`);
      
      const res = await fetch(apiUrl, { next: { revalidate: 60 } });
      
      if (!res.ok) {
        console.error(`❌ LimitlessLabs: External API error ${res.status}`);
        return [];
      }
      
      const data = await res.json();
      const markets = Array.isArray(data) ? data : (data.items || data.data || []);
      
      console.log(`✅ LimitlessLabs: External API returned ${markets.length} markets`);
      
      return markets.map(normalizeMarket);
    } catch (e) {
      console.error('❌ LimitlessLabs getActiveMarkets error:', e instanceof Error ? e.message : String(e));
      return [];
    }
  },

  async getMarketsByCategory(category: string, limit: number = 50): Promise<PredictionMarket[]> {
    try {
      const res = await fetch(`${BASE_URL}/markets?category=${encodeURIComponent(category)}&limit=${limit}`, { next: { revalidate: 60 } });
      const data = await safeJson(res);
      const items = Array.isArray(data) ? data : (data.items || data.data || []);
      return items.map(normalizeMarket);
    } catch (e) {
      console.error('LimitlessLabs getMarketsByCategory error:', e);
      return [];
    }
  },

  async searchMarkets(query: string, limit: number = 30): Promise<PredictionMarket[]> {
    try {
      const res = await fetch(`${BASE_URL}/markets/search?q=${encodeURIComponent(query)}&limit=${limit}`, { next: { revalidate: 60 } });
      const data = await safeJson(res);
      const items = Array.isArray(data) ? data : (data.items || data.data || []);
      return items.map(normalizeMarket);
    } catch (e) {
      console.error('LimitlessLabs searchMarkets error:', e);
      return [];
    }
  },

  async getMarketById(id: string): Promise<PredictionMarket | null> {
    try {
      const res = await fetch(`${BASE_URL}/markets/${id}`);
      if (!res.ok) return null;
      const data = await safeJson(res);
      if (!data) return null;
      return normalizeMarket(data);
    } catch (e) {
      console.error('LimitlessLabs getMarketById error:', e);
      return null;
    }
  },

  async getMarketStats(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/markets/stats`, { next: { revalidate: 60 } });
      const data = await safeJson(res);
      return data || { totalMarkets: 0 };
    } catch {
      return { totalMarkets: 0 };
    }
  }
};

export type LimitlessApi = typeof limitlessApi;

