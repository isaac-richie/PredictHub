import { NextRequest, NextResponse } from 'next/server';
import { aiIntelligenceService } from '@/services/ai-intelligence-service';
import { aggregationService } from '@/services/aggregation-service';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * AI Intelligence API Endpoint
 * Provides AI-powered insights for prediction markets
 * 
 * Endpoints:
 * - /api/ai?endpoint=sentiment&marketId=123
 * - /api/ai?endpoint=predictions&marketId=123
 * - /api/ai?endpoint=intelligence&marketId=123
 * - /api/ai?endpoint=insights&marketId=123 (all data)
 * - /api/ai?endpoint=recommendations&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'insights';
    const marketId = searchParams.get('marketId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log('🤖 AI API called:', endpoint, marketId ? `marketId: ${marketId}` : '');

    // Check if AI is enabled
    if (!aiIntelligenceService.isEnabled()) {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 503 }
      );
    }

    // Handle different endpoints
    switch (endpoint) {
      case 'sentiment':
        return await handleSentimentAnalysis(marketId);
      
      case 'predictions':
        return await handlePricePredictions(marketId);
      
      case 'intelligence':
        return await handleMarketIntelligence(marketId);
      
      case 'insights':
        return await handleFullInsights(marketId);
      
      case 'recommendations':
        return await handleRecommendations(limit);
      
      case 'config':
        return handleConfigRequest();
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint. Valid endpoints: sentiment, predictions, intelligence, insights, recommendations, config' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ AI API Error:', error);
    return NextResponse.json(
      { 
        error: 'AI service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle sentiment analysis request
 */
async function handleSentimentAnalysis(marketId: string | null) {
  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch market data
    const market = await aggregationService.getMarketById(marketId);
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    // Analyze sentiment
    const sentiment = await aiIntelligenceService.analyzeMarketSentiment(market);

    return NextResponse.json({
      success: true,
      data: sentiment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sentiment Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze sentiment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle price predictions request
 */
async function handlePricePredictions(marketId: string | null) {
  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const market = await aggregationService.getMarketById(marketId);
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    const predictions = await aiIntelligenceService.generatePricePredictions(market);

    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price Predictions Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate predictions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle market intelligence request
 */
async function handleMarketIntelligence(marketId: string | null) {
  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const market = await aggregationService.getMarketById(marketId);
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    const intelligence = await aiIntelligenceService.analyzeMarketIntelligence(market);

    return NextResponse.json({
      success: true,
      data: intelligence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market Intelligence Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze market intelligence',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle full insights request (all AI data)
 */
async function handleFullInsights(marketId: string | null) {
  if (!marketId) {
    return NextResponse.json(
      { error: 'marketId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const market = await aggregationService.getMarketById(marketId);
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    const insights = await aiIntelligenceService.getMarketInsights(market);

    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Full Insights Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get market insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle recommendations request
 */
async function handleRecommendations(limit: number) {
  try {
    // Get top markets across all platforms
    const markets = await aggregationService.getAllMarkets(100);

    // Generate recommendations
    const recommendations = await aiIntelligenceService.getRecommendations(markets, limit);

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle config request
 */
function handleConfigRequest() {
  const config = aiIntelligenceService.getConfig();

  return NextResponse.json({
    success: true,
    data: config,
    timestamp: new Date().toISOString(),
  });
}

