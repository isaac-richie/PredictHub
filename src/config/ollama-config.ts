/**
 * Ollama AI Configuration
 * 
 * This file contains configuration for connecting to Ollama AI services
 * for real AI-powered market analysis and predictions
 */

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

export const OLLAMA_CONFIG = {
  // Ollama API configuration
  API_KEY: '', // Not needed for local Ollama
  API_URL: isProduction ? '' : 'http://localhost:11434', // Local Ollama server (disabled in production)
  
  // Model configuration
  MODEL: 'llama3.2', // Using your installed llama3.2 model
  TEMPERATURE: 0.7, // Creativity level (0-1)
  MAX_TOKENS: 1000, // Maximum response length
  
  // Feature flags - Disabled in production, enabled in development
  USE_OLLAMA_FOR_SENTIMENT: !isProduction,
  USE_OLLAMA_FOR_PREDICTIONS: !isProduction,
  USE_OLLAMA_FOR_ANALYSIS: !isProduction,
  
  // Fallback configuration
  FALLBACK_TO_MOCK: true, // If Ollama fails, use mock data
  REQUEST_TIMEOUT: 30000, // 30 seconds (AI can be slow)
} as const;

/**
 * Get Ollama API headers
 */
export function getOllamaHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${OLLAMA_CONFIG.API_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Check if Ollama is properly configured
 */
export function isOllamaConfigured(): boolean {
  return !!OLLAMA_CONFIG.API_URL && !isProduction; // Only works in development
}

