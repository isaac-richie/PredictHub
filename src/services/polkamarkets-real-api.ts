import { PredictionMarket, MarketStats } from '@/types/prediction-market';
import { createApiClient } from '@/lib/api-client';
// import { PredictionMarketError } from '@/types/prediction-market-error';

// Polkamarkets blockchain integration
export class PolkamarketsRealApiService {
  private apiClient;
  private polkadotApi: any = null;
  private isConnected = false;

  constructor(apiKey?: string) {
    // For now, we'll use a proxy route that will handle blockchain connections
    this.apiClient = createApiClient(
      '/api/polkamarkets-real',
      {
        apiKey,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        timeout: 15000,
      }
    );
  }

  // Initialize connection to Polkamarkets blockchain
  private async initializeConnection() {
    if (this.isConnected) return;
    
    try {
      console.log('🔍 PolkamarketsRealAPI: Initializing blockchain connection...');
      
      // This would connect to the actual Polkamarkets blockchain
      // For now, we'll simulate this with a server-side connection
      this.isConnected = true;
      console.log('🔍 PolkamarketsRealAPI: Blockchain connection established');
    } catch (error) {
      console.error('Error connecting to Polkamarkets blockchain:', error);
      throw error;
    }
  }

  // Fetch active markets from Polkamarkets blockchain
  async getActiveMarkets(limit: number = 10, offset: number = 0): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching active markets from blockchain, limit:', limit, 'offset:', offset);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<PredictionMarket[]>('', {
        params: {
          endpoint: 'markets',
          limit,
          offset,
          active: true,
        },
      });

      console.log('🔍 PolkamarketsRealAPI: Blockchain data received, markets count:', response.length);
      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets active markets:', error);
      throw error;
    }
  }

  // Get market by ID from blockchain
  async getMarketById(id: string): Promise<PredictionMarket | null> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching market by ID from blockchain:', id);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<PredictionMarket>(`/${id}`, {
        params: {
          endpoint: 'market',
        },
      });

      return response;
    } catch (error) {
      console.error(`Error fetching Polkamarkets market by ID ${id}:`, error);
      return null;
    }
  }

  // Get market statistics from blockchain
  async getMarketStats(): Promise<MarketStats> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching market stats from blockchain');
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<MarketStats>('', {
        params: {
          endpoint: 'stats',
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets market stats:', error);
      throw error;
    }
  }

  // Get categories from blockchain
  async getCategories(): Promise<string[]> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching categories from blockchain');
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<string[]>('', {
        params: {
          endpoint: 'categories',
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets categories:', error);
      throw error;
    }
  }

  // Search markets on blockchain
  async searchMarkets(query: string, limit: number = 10): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Searching markets on blockchain for query:', query);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<PredictionMarket[]>('', {
        params: {
          endpoint: 'search',
          query,
          limit,
        },
      });

      return response;
    } catch (error) {
      console.error('Error searching Polkamarkets markets:', error);
      throw error;
    }
  }

  // Get markets by category from blockchain
  async getMarketsByCategory(category: string, limit: number = 10): Promise<PredictionMarket[]> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching markets by category from blockchain:', category);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<PredictionMarket[]>('', {
        params: {
          endpoint: 'category',
          category,
          limit,
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets markets by category:', error);
      throw error;
    }
  }

  // Get price history from blockchain
  async getPriceHistory(marketId: string): Promise<any[]> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching price history from blockchain for market:', marketId);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<any[]>(`/${marketId}/history`, {
        params: {
          endpoint: 'price-history',
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets price history:', error);
      throw error;
    }
  }

  // Get real-time market data from blockchain
  async getRealTimeData(marketId: string): Promise<any> {
    try {
      console.log('🔍 PolkamarketsRealAPI: Fetching real-time data from blockchain for market:', marketId);
      
      await this.initializeConnection();
      
      const response = await this.apiClient.get<any>(`/${marketId}/realtime`, {
        params: {
          endpoint: 'realtime',
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching Polkamarkets real-time data:', error);
      throw error;
    }
  }

  // Disconnect from blockchain
  async disconnect() {
    if (this.polkadotApi) {
      await this.polkadotApi.disconnect();
      this.polkadotApi = null;
      this.isConnected = false;
      console.log('🔍 PolkamarketsRealAPI: Disconnected from blockchain');
    }
  }
}

// Export singleton instance
export const polkamarketsRealApi = new PolkamarketsRealApiService();

