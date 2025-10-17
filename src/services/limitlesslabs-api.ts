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

  // Use raw volume/liquidity values directly - they're already in the correct units
  // volumeFormatted and liquidityFormatted are in thousands for display, but raw values are correct
  const volumeNum = toNumber(raw.volume);
  const liquidityNum = toNumber(raw.liquidity);
  const openInterestNum = toNumber(raw.openInterest);

  // Extract the actual market ID for URL construction
  // Limitless uses a specific ID format in their URLs
  const marketId = raw.id || raw.slug || raw.marketId;
  
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
    // Override any externalUrl from the API with our correct format
    externalUrl: marketId ? `https://limitless.exchange/advanced/markets/${marketId}` : undefined,
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
  async getActiveMarkets(limit: number = 100): Promise<PredictionMarket[]> {
    console.log(`🔍 LimitlessLabs: getActiveMarkets CALLED with limit: ${limit}`);
    try {
      // LimitlessLabs API has a max limit of 25 per request
      const maxPerRequest = 25;
      const requestedLimit = Math.min(limit, maxPerRequest);
      
      const url = `https://api.limitless.exchange/markets/active?page=1&limit=${requestedLimit}`;
      console.log(`🔍 LimitlessLabs: Fetching from URL: ${url} (max ${maxPerRequest} per request)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(url, { 
        signal: controller.signal,
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PredictHub/1.0',
        }
      });
      
      clearTimeout(timeoutId);
      console.log(`🔍 LimitlessLabs: Response received, status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`❌ LimitlessLabs: HTTP error ${res.status}`);
        const errorText = await res.text();
        console.error(`❌ LimitlessLabs: Error response: ${errorText.substring(0, 200)}`);
        return [];
      }
      
      const data = await safeJson(res);
      console.log(`🔍 LimitlessLabs: Data parsed, type: ${Array.isArray(data) ? 'array' : typeof data}`);
      
      if (data && typeof data === 'object') {
        console.log(`🔍 LimitlessLabs: Data keys: ${Object.keys(data).join(', ')}`);
      }
      
      const items = Array.isArray(data) ? data : (data.items || data.data || []);
      console.log(`✅ LimitlessLabs: Extracted ${items.length} items from response`);
      
      if (items.length === 0) {
        console.warn(`⚠️ LimitlessLabs: No markets found. Full data:`, JSON.stringify(data).substring(0, 500));
      }
      
      const normalized = items.map(normalizeMarket);
      console.log(`✅ LimitlessLabs: Returning ${normalized.length} normalized markets`);
      return normalized;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        console.error('❌ LimitlessLabs: Request timeout after 10 seconds');
      } else {
        console.error('❌ LimitlessLabs getActiveMarkets error:', e instanceof Error ? e.message : String(e));
        console.error('❌ LimitlessLabs error stack:', e instanceof Error ? e.stack : 'No stack');
      }
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

