import { ApiClient } from '@/lib/api-client';

export interface LimitlessAuthRequest {
  client: string;
  signature: string;
  address: string;
  message: string;
}

export interface LimitlessAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    address: string;
    id: string;
  };
}

export class LimitlessLabsAuthService {
  private apiClient: ApiClient;
  private accessToken: string | null = null;

  constructor() {
    this.apiClient = new ApiClient('https://api.limitless.exchange');
    
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('limitless_access_token');
      if (this.accessToken) {
        this.apiClient.setAuthToken(this.accessToken);
      }
    }
  }

  /**
   * Get signing message for wallet authentication
   */
  async getSigningMessage(): Promise<string> {
    try {
      // For now, return a mock message since the external API might have CORS issues
      // In production, you'd want to use a proxy route
      const mockMessage = `Welcome to LimitlessLabs! Please sign this message to authenticate.\n\nTimestamp: ${Date.now()}\nNonce: ${Math.random().toString(36).substring(7)}`;
      return mockMessage;
    } catch (error) {
      console.error('❌ LimitlessLabs Auth: Failed to get signing message:', error);
      throw new Error('Failed to get signing message');
    }
  }

  /**
   * Authenticate with wallet signature
   */
  async authenticateWithWallet(
    address: string, 
    signature: string, 
    message: string
  ): Promise<LimitlessAuthResponse> {
    try {
      // For now, simulate successful authentication
      // In production, you'd make the actual API call through a proxy route
      const mockAuthResponse: LimitlessAuthResponse = {
        accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        refreshToken: `mock_refresh_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        user: {
          address: address,
          id: `user_${address.substring(0, 8)}`
        }
      };

      this.accessToken = mockAuthResponse.accessToken;
      
      // Store tokens in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('limitless_access_token', mockAuthResponse.accessToken);
        localStorage.setItem('limitless_refresh_token', mockAuthResponse.refreshToken);
      }
      
      console.log('✅ LimitlessLabs Auth: Mock authentication successful');
      return mockAuthResponse;
    } catch (error) {
      console.error('❌ LimitlessLabs Auth: Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Verify authentication status
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('❌ LimitlessLabs Auth: Verification failed:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      console.log('✅ LimitlessLabs Auth: Mock logout successful');
    } catch (error) {
      console.error('❌ LimitlessLabs Auth: Logout failed:', error);
    } finally {
      // Clear tokens regardless of API response
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('limitless_access_token');
        localStorage.removeItem('limitless_refresh_token');
      }
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }
    
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('limitless_access_token');
      if (storedToken) {
        this.accessToken = storedToken;
        return storedToken;
      }
    }
    
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get authenticated headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with LimitlessLabs');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}

// Export singleton instance
export const limitlessLabsAuth = new LimitlessLabsAuthService();
