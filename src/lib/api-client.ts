import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PredictionMarketError } from '@/types/prediction-market';

export class ApiClient {
  private instance: AxiosInstance;
  private rateLimitQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(
    private baseUrl: string,
    private config: {
      apiKey?: string;
      requestsPerMinute?: number;
      requestsPerHour?: number;
      timeout?: number;
    } = {}
  ) {
    // Use the baseUrl directly since we're calling external APIs
    const fullBaseUrl = baseUrl;
    
    this.instance = axios.create({
      baseURL: fullBaseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
    });

    // Request interceptor for rate limiting
    this.instance.interceptors.request.use(async (config) => {
      console.log('🔍 ApiClient: Making request to:', config.url, 'with params:', config.params);
      // Temporarily disable rate limiting for debugging
      // await this.enforceRateLimit();
      return config;
    });

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => {
        console.log('🔍 ApiClient: Response received:', response.status, response.data?.length || 'no data');
        return response;
      },
      (error) => {
        console.log('🔍 ApiClient: Error occurred:', error?.message || 'Unknown error', error?.response?.status);
        
        try {
          // Safely extract error details with proper null checks
          const message = error?.response?.data?.message || error?.message || 'Unknown error';
          const statusCode = error?.response?.status || 500;
          const platform = this.baseUrl.includes('polymarket') ? 'polymarket' : 
                          this.baseUrl.includes('limitless') ? 'limitlesslabs' :
                          this.baseUrl.includes('myriad') ? 'myriad' : 'unknown';
          
          // Create a safe error object to avoid circular references
          const safeError = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error;
          
          throw new PredictionMarketError(message, platform, statusCode, safeError as Error);
        } catch (constructionError) {
          // If PredictionMarketError construction fails, throw a simple error
          console.error('🔍 ApiClient: Failed to construct PredictionMarketError:', constructionError);
          throw new Error(`API Error: ${error?.message || 'Unknown error'} (Platform: ${this.baseUrl})`);
        }
      }
    );
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const minuteElapsed = now - this.lastResetTime > 60000;
    const hourElapsed = now - this.lastResetTime > 3600000;

    // Reset counters if time windows have elapsed
    if (hourElapsed) {
      this.requestCount = 0;
      this.lastResetTime = now;
    } else if (minuteElapsed) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check rate limits
    const requestsPerMinute = this.config.requestsPerMinute || 60;
    const requestsPerHour = this.config.requestsPerHour || 1000;

    if (this.requestCount >= requestsPerMinute) {
      const waitTime = 60000 - (now - this.lastResetTime);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    if (this.requestCount >= requestsPerHour) {
      const waitTime = 3600000 - (now - this.lastResetTime);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Batch request method for multiple API calls
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map(request => request()));
  }

  // Retry mechanism for failed requests
  async withRetry<T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, i);
        await this.delay(waitTime);
      }
    }

    throw lastError!;
  }

  // Set authentication token for API requests
  setAuthToken(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization'];
  }
}

// Factory function to create API clients
export const createApiClient = (
  baseUrl: string,
  config?: {
    apiKey?: string;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    timeout?: number;
  }
) => new ApiClient(baseUrl, config);

