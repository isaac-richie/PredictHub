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
    // Handle server-side requests by using absolute URLs
    // In production (Vercel), use the deployed URL, otherwise use localhost
    const isProduction = process.env.NODE_ENV === 'production';
    const port = process.env.PORT || '3000';
    
    let fullBaseUrl: string;
    if (baseUrl.startsWith('http')) {
      fullBaseUrl = baseUrl;
    } else if (isProduction) {
      // Use the deployed URL for production
      const deployedUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
      if (deployedUrl) {
        fullBaseUrl = `https://${deployedUrl}${baseUrl}`;
      } else {
        // Fallback for production without VERCEL_URL
        fullBaseUrl = `https://predicthub.vercel.app${baseUrl}`;
      }
    } else {
      // Development
      fullBaseUrl = `http://localhost:${port}${baseUrl}`;
    }
    
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
        console.log('🔍 ApiClient: Error occurred:', error.message, error.response?.status);
        throw new PredictionMarketError(
          error.response?.data?.message || error.message,
          this.baseUrl.includes('polymarket') ? 'polymarket' : 'unknown',
          error.response?.status,
          error
        );
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

