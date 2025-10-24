import { NextRequest, NextResponse } from 'next/server';
import { ollamaAIService } from '@/services/ollama-ai-service';
import { isOllamaConfigured, OLLAMA_CONFIG } from '@/config/ollama-config';

export const dynamic = 'force-dynamic';

/**
 * Test Ollama API Connection
 * GET /api/test-ollama
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Ollama API connection...');
    
    // Check if Ollama is configured
    if (!isOllamaConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Ollama is not configured. Please set API_KEY and API_URL.',
        config: {
          hasApiKey: !!OLLAMA_CONFIG.API_KEY,
          hasApiUrl: !!OLLAMA_CONFIG.API_URL,
          model: OLLAMA_CONFIG.MODEL,
        }
      }, { status: 500 });
    }

    console.log('✅ Ollama configuration found');
    console.log('🔑 API Key:', OLLAMA_CONFIG.API_KEY.substring(0, 10) + '...');
    console.log('🌐 API URL:', OLLAMA_CONFIG.API_URL);
    console.log('🤖 Model:', OLLAMA_CONFIG.MODEL);

    // Test the connection
    const isConnected = await ollamaAIService.testConnection();

    if (isConnected) {
      console.log('✅ Ollama API connection successful!');
      return NextResponse.json({
        success: true,
        message: 'Ollama API is working correctly!',
        config: {
          apiUrl: OLLAMA_CONFIG.API_URL,
          model: OLLAMA_CONFIG.MODEL,
          temperature: OLLAMA_CONFIG.TEMPERATURE,
          maxTokens: OLLAMA_CONFIG.MAX_TOKENS,
        }
      });
    } else {
      console.log('❌ Ollama API connection failed');
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Ollama API. Please check your API key and network connection.',
        config: {
          apiUrl: OLLAMA_CONFIG.API_URL,
          model: OLLAMA_CONFIG.MODEL,
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Ollama test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

