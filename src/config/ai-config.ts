/**
 * AI Features Configuration
 * 
 * This file controls the availability of AI features in PredictHub.
 * Set `AI_ENABLED` to false to completely disable all AI functionality.
 * 
 * Individual features can also be toggled on/off for granular control.
 */

export const AI_CONFIG = {
  // Master switch - Set to false to disable all AI features
  AI_ENABLED: true,
  
  // Individual feature toggles
  SENTIMENT_ANALYSIS_ENABLED: true,
  PRICE_PREDICTION_ENABLED: true,
  MARKET_INTELLIGENCE_ENABLED: true,
  RECOMMENDATIONS_ENABLED: true,
  
  // Performance settings
  UPDATE_INTERVAL: 60000, // 1 minute
  CACHE_TIMEOUT: 300000, // 5 minutes
  
  // UI settings
  SHOW_AI_TAB_IN_MODAL: true,
  SHOW_AI_BADGES: true,
  SHOW_AI_RECOMMENDATIONS: true,
  
  // API settings
  AI_API_TIMEOUT: 10000, // 10 seconds
  AI_API_RETRY_COUNT: 2,
  
  // Feature flags for future AI features
  EXPERIMENTAL_FEATURES: {
    AI_CHAT: false,
    AUTO_TRADING: false,
    PORTFOLIO_OPTIMIZATION: false,
    MARKET_FORECASTING: false,
  },
} as const;

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return AI_CONFIG.AI_ENABLED;
}

/**
 * Check if a specific AI feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof AI_CONFIG): boolean {
  if (!AI_CONFIG.AI_ENABLED) return false;
  return AI_CONFIG[feature] as boolean;
}

/**
 * Get AI configuration
 */
export function getAIConfig() {
  return { ...AI_CONFIG };
}

/**
 * Emergency kill switch - Disable all AI features
 * Call this function in case of issues with AI services
 */
export function disableAI(): void {
  if (typeof window !== 'undefined') {
    console.warn('🚨 AI features have been disabled via kill switch');
    // In production, this would update a global state or localStorage
    localStorage.setItem('ai_disabled', 'true');
  }
}

/**
 * Re-enable AI features after kill switch
 */
export function enableAI(): void {
  if (typeof window !== 'undefined') {
    console.log('✅ AI features have been re-enabled');
    localStorage.removeItem('ai_disabled');
  }
}

/**
 * Check if AI is disabled via kill switch
 */
export function isAIDisabledViaKillSwitch(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_disabled') === 'true';
  }
  return false;
}

