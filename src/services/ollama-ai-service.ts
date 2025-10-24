import { OLLAMA_CONFIG, getOllamaHeaders } from '@/config/ollama-config';
import { PredictionMarket } from '@/types/prediction-market';

/**
 * Ollama AI Service
 * 
 * This service connects to Ollama AI for real AI-powered market analysis
 * including sentiment analysis, price predictions, and market intelligence
 */

export class OllamaAIService {
  private apiUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.apiUrl = OLLAMA_CONFIG.API_URL;
    this.headers = getOllamaHeaders();
  }

  /**
   * Generate AI-powered market sentiment analysis
   */
  async analyzeSentiment(market: PredictionMarket): Promise<{
    sentiment: number;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const prompt = this.buildSentimentPrompt(market);
      const response = await this.callOllama(prompt);
      
      return this.parseSentimentResponse(response);
    } catch (error) {
      console.error('Ollama Sentiment Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered price predictions
   */
  async predictPrices(market: PredictionMarket): Promise<{
    predictions: Array<{
      timeframe: string;
      yesPrice: number;
      confidence: number;
    }>;
    reasoning: string;
  }> {
    try {
      const prompt = this.buildPredictionPrompt(market);
      const response = await this.callOllama(prompt);
      
      return this.parsePredictionResponse(response);
    } catch (error) {
      console.error('Ollama Price Prediction Error:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered market analysis
   */
  async analyzeMarket(market: PredictionMarket): Promise<{
    analysis: string;
    recommendation: 'buy' | 'sell' | 'hold';
    confidence: number;
    keyFactors: string[];
  }> {
    try {
      const prompt = this.buildAnalysisPrompt(market);
      const response = await this.callOllama(prompt);
      
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Ollama Market Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Call Ollama API with a prompt (LOCAL OLLAMA FORMAT)
   */
  private async callOllama(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.REQUEST_TIMEOUT);

    try {
      // Local Ollama uses /api/generate endpoint
      const response = await fetch(`${this.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_CONFIG.MODEL,
          prompt: `You are an expert prediction market analyst with deep knowledge of market dynamics, sentiment analysis, and price prediction. Provide clear, data-driven insights.\n\n${prompt}`,
          stream: false,
          options: {
            temperature: OLLAMA_CONFIG.TEMPERATURE,
            num_predict: OLLAMA_CONFIG.MAX_TOKENS,
          }
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Ollama API request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Build sentiment analysis prompt
   */
  private buildSentimentPrompt(market: PredictionMarket): string {
    return `Analyze the sentiment for this prediction market:

Title: ${market.title}
Description: ${market.description || 'N/A'}
Current Yes Price: ${(market.yesPrice * 100).toFixed(1)}%
Current No Price: ${(market.noPrice * 100).toFixed(1)}%
Total Volume: $${market.totalVolume.toLocaleString()}
Liquidity: $${market.liquidity.toLocaleString()}
Platform: ${market.platform}
Category: ${market.category || 'N/A'}
End Date: ${market.endDate.toLocaleDateString()}

Price Changes:
- 24h: ${market.oneDayPriceChange ? (market.oneDayPriceChange * 100).toFixed(2) + '%' : 'N/A'}
- 7d: ${market.oneWeekPriceChange ? (market.oneWeekPriceChange * 100).toFixed(2) + '%' : 'N/A'}

Based on this data, provide:
1. Overall sentiment score (0-100, where 0 is very bearish, 50 is neutral, 100 is very bullish)
2. Confidence level (0-100)
3. Brief reasoning (1-2 sentences)

Format your response as JSON:
{
  "sentiment": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<explanation>"
}`;
  }

  /**
   * Build price prediction prompt
   */
  private buildPredictionPrompt(market: PredictionMarket): string {
    return `Predict future prices for this prediction market:

Title: ${market.title}
Current Yes Price: ${(market.yesPrice * 100).toFixed(1)}%
Volume: $${market.totalVolume.toLocaleString()}
Liquidity: $${market.liquidity.toLocaleString()}
Recent Price Changes: ${market.oneDayPriceChange ? (market.oneDayPriceChange * 100).toFixed(2) + '%' : 'N/A'} (24h)

Predict prices for these timeframes: 24h, 7d, 30d

Format your response as JSON:
{
  "predictions": [
    {"timeframe": "24h", "yesPrice": <0-1>, "confidence": <0-100>},
    {"timeframe": "7d", "yesPrice": <0-1>, "confidence": <0-100>},
    {"timeframe": "30d", "yesPrice": <0-1>, "confidence": <0-100>}
  ],
  "reasoning": "<brief explanation>"
}`;
  }

  /**
   * Build market analysis prompt
   */
  private buildAnalysisPrompt(market: PredictionMarket): string {
    return `Provide a comprehensive analysis of this prediction market:

Title: ${market.title}
Description: ${market.description || 'N/A'}
Current Prices: ${(market.yesPrice * 100).toFixed(1)}% Yes / ${(market.noPrice * 100).toFixed(1)}% No
Volume: $${market.totalVolume.toLocaleString()}
Liquidity: $${market.liquidity.toLocaleString()}
End Date: ${market.endDate.toLocaleDateString()}

Provide:
1. Overall analysis (2-3 sentences)
2. Recommendation: buy, sell, or hold
3. Confidence level (0-100)
4. 3-5 key factors influencing the market

Format your response as JSON:
{
  "analysis": "<detailed analysis>",
  "recommendation": "<buy|sell|hold>",
  "confidence": <0-100>,
  "keyFactors": ["factor1", "factor2", "factor3"]
}`;
  }

  /**
   * Parse sentiment response from Ollama
   */
  private parseSentimentResponse(response: string): {
    sentiment: number;
    confidence: number;
    reasoning: string;
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: Math.max(0, Math.min(100, parsed.sentiment)),
          confidence: Math.max(0, Math.min(100, parsed.confidence)),
          reasoning: parsed.reasoning || 'AI-generated analysis',
        };
      }
    } catch (error) {
      console.error('Failed to parse Ollama sentiment response:', error);
    }

    // Fallback to basic parsing
    return {
      sentiment: 50,
      confidence: 50,
      reasoning: response.substring(0, 200),
    };
  }

  /**
   * Parse prediction response from Ollama
   */
  private parsePredictionResponse(response: string): {
    predictions: Array<{
      timeframe: string;
      yesPrice: number;
      confidence: number;
    }>;
    reasoning: string;
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          predictions: parsed.predictions.map((p: any) => ({
            timeframe: p.timeframe,
            yesPrice: Math.max(0, Math.min(1, p.yesPrice)),
            confidence: Math.max(0, Math.min(100, p.confidence)),
          })),
          reasoning: parsed.reasoning || 'AI-generated predictions',
        };
      }
    } catch (error) {
      console.error('Failed to parse Ollama prediction response:', error);
    }

    // Fallback
    return {
      predictions: [
        { timeframe: '24h', yesPrice: 0.5, confidence: 50 },
        { timeframe: '7d', yesPrice: 0.5, confidence: 40 },
        { timeframe: '30d', yesPrice: 0.5, confidence: 30 },
      ],
      reasoning: response.substring(0, 200),
    };
  }

  /**
   * Parse analysis response from Ollama
   */
  private parseAnalysisResponse(response: string): {
    analysis: string;
    recommendation: 'buy' | 'sell' | 'hold';
    confidence: number;
    keyFactors: string[];
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analysis: parsed.analysis,
          recommendation: parsed.recommendation.toLowerCase() as 'buy' | 'sell' | 'hold',
          confidence: Math.max(0, Math.min(100, parsed.confidence)),
          keyFactors: parsed.keyFactors || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse Ollama analysis response:', error);
    }

    // Fallback
    return {
      analysis: response.substring(0, 300),
      recommendation: 'hold',
      confidence: 50,
      keyFactors: ['Market analysis generated by AI'],
    };
  }

  /**
   * Test Ollama connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.callOllama('Say "connected" if you can read this.');
      return response.toLowerCase().includes('connected');
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ollamaAIService = new OllamaAIService();

