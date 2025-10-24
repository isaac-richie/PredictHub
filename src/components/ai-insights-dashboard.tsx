'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, BarChart3, AlertCircle, Lightbulb, Activity, Target } from 'lucide-react';
import { AISentimentData, AIPredictionData, AIIntelligenceData, AIInsights } from '@/types/ai-insights';
import { PredictionMarket } from '@/types/prediction-market';

interface AIInsightsDashboardProps {
  market: PredictionMarket;
}

export function AIInsightsDashboard({ market }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sentiment' | 'predictions' | 'intelligence' | 'recommendations'>('sentiment');

  useEffect(() => {
    loadInsights();
  }, [market.id]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai?endpoint=insights&marketId=${market.id}`);
      if (!response.ok) {
        throw new Error('Failed to load AI insights');
      }

      const data = await response.json();
      setInsights(data.data);
    } catch (err) {
      console.error('AI Insights Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Failed to load AI insights</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadInsights}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insights) return null;

  const tabs = [
    { id: 'sentiment' as const, label: 'Sentiment', icon: TrendingUp },
    { id: 'predictions' as const, label: 'Predictions', icon: BarChart3 },
    { id: 'intelligence' as const, label: 'Intelligence', icon: Brain },
    { id: 'recommendations' as const, label: 'Insights', icon: Lightbulb },
  ];

  return (
    <div className="space-y-4">
      {/* AI Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <Brain className="h-4 w-4" />
            <span>AI Powered</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated {new Date(insights.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'sentiment' && <SentimentAnalysisCard sentiment={insights.sentiment} />}
        {activeTab === 'predictions' && <PricePredictionsCard predictions={insights.predictions} />}
        {activeTab === 'intelligence' && <MarketIntelligenceCard intelligence={insights.intelligence} />}
        {activeTab === 'recommendations' && <RecommendationsCard recommendations={insights.recommendations} />}
      </div>
    </div>
  );
}

// Sentiment Analysis Card Component
function SentimentAnalysisCard({ sentiment }: { sentiment: AISentimentData }) {
  const sentimentColor = 
    sentiment.trend === 'bullish' ? 'text-green-600 dark:text-green-400' :
    sentiment.trend === 'bearish' ? 'text-red-600 dark:text-red-400' :
    'text-gray-600 dark:text-gray-400';

  const sentimentBg = 
    sentiment.trend === 'bullish' ? 'bg-green-100 dark:bg-green-900/30' :
    sentiment.trend === 'bearish' ? 'bg-red-100 dark:bg-red-900/30' :
    'bg-gray-100 dark:bg-gray-800';

  return (
    <div className="space-y-4">
      {/* Overall Sentiment Score */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Sentiment</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${sentimentBg} ${sentimentColor}`}>
            {sentiment.trend.toUpperCase()}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-5xl font-bold text-gray-900 dark:text-white">
            {sentiment.sentimentScore.toFixed(0)}
          </div>
          <div className="text-2xl text-gray-500 dark:text-gray-400 mb-2">/100</div>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Confidence: {(sentiment.confidence * 100).toFixed(0)}%
        </div>
      </div>

      {/* Social Sentiment */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            {sentiment.socialSentiment.twitter > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {((sentiment.socialSentiment.twitter + 1) * 50).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reddit Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            {sentiment.socialSentiment.reddit > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {((sentiment.socialSentiment.reddit + 1) * 50).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* News Sentiment Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">News Sentiment Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Positive</span>
            <span className="font-semibold text-green-600">{sentiment.newsSentiment.positive.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sentiment.newsSentiment.positive}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-600 dark:text-gray-400">Negative</span>
            <span className="font-semibold text-red-600">{sentiment.newsSentiment.negative.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sentiment.newsSentiment.negative}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-600 dark:text-gray-400">Neutral</span>
            <span className="font-semibold text-gray-600">{sentiment.newsSentiment.neutral.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gray-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sentiment.newsSentiment.neutral}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 🌐 Web Analysis Section */}
      {sentiment.webAnalysis && sentiment.webAnalysis.sourcesCount > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Web Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analysis from {sentiment.webAnalysis.sourcesCount} web sources
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {sentiment.webAnalysis.summary}
            </p>
          </div>

          {/* Key Points */}
          {sentiment.webAnalysis.keyPoints && sentiment.webAnalysis.keyPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {sentiment.webAnalysis.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Web Sources */}
          {sentiment.webAnalysis.sources && sentiment.webAnalysis.sources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Top Sources
              </h4>
              {sentiment.webAnalysis.sources.map((source: any, idx: number) => {
                const SourceCard = source.url ? 'a' : 'div';
                return (
                  <SourceCard
                    key={idx}
                    {...(source.url ? {
                      href: source.url,
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    } : {})}
                    className={`p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${
                      source.url 
                        ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:scale-[1.01] cursor-pointer' 
                        : 'hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            source.type === 'news' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            source.type === 'social' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {source.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{source.source}</span>
                          {source.url && (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-3 w-3 text-blue-600 dark:text-blue-400" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {source.title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {source.snippet}
                        </p>
                        {source.url && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            <span>Click to read full article</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          source.sentiment > 0.2 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          source.sentiment < -0.2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {source.sentiment > 0 ? '+' : ''}{(source.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(source.relevance * 100).toFixed(0)}% relevant
                        </div>
                      </div>
                    </div>
                  </SourceCard>
                );
              })}
            </div>
          )}

          {/* Warnings */}
          {sentiment.webAnalysis.warnings && sentiment.webAnalysis.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {sentiment.webAnalysis.warnings.map((warning: string, idx: number) => (
                    <p key={idx} className="text-xs text-yellow-800 dark:text-yellow-200">
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Price Predictions Card Component
function PricePredictionsCard({ predictions }: { predictions: AIPredictionData }) {
  return (
    <div className="space-y-4">
      {/* Model Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Model Accuracy</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {(predictions.modelAccuracy * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600 dark:text-blue-400">Version</div>
            <div className="text-sm font-mono text-blue-900 dark:text-blue-100">{predictions.modelVersion}</div>
          </div>
        </div>
      </div>

      {/* Predictions by Timeframe */}
      <div className="space-y-3">
        {predictions.predictions.map((pred, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{pred.timeframe} Prediction</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Confidence: {(pred.confidence * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Yes Price</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(pred.yesPrice * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">No Price</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {(pred.noPrice * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {pred.priceChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={pred.priceChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {pred.priceChange > 0 ? '+' : ''}{pred.priceChange.toFixed(2)}% expected change
              </span>
            </div>

            {/* Volatility Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Volatility</span>
                <span>{(pred.volatility * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pred.volatility * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Accuracy */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Historical Accuracy</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">7 Days</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(predictions.historicalAccuracy.last7Days * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">30 Days</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(predictions.historicalAccuracy.last30Days * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">All Time</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(predictions.historicalAccuracy.allTime * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Intelligence Card Component
function MarketIntelligenceCard({ intelligence }: { intelligence: AIIntelligenceData }) {
  const recommendationColors = {
    strong_buy: 'bg-green-600 text-white',
    buy: 'bg-green-500 text-white',
    hold: 'bg-yellow-500 text-white',
    sell: 'bg-orange-500 text-white',
    strong_sell: 'bg-red-600 text-white',
    avoid: 'bg-red-700 text-white',
  };

  return (
    <div className="space-y-4">
      {/* AI Recommendation */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendation</h3>
        </div>
        <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${recommendationColors[intelligence.recommendation]}`}>
          {intelligence.recommendation.replace('_', ' ').toUpperCase()}
        </div>
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{intelligence.recommendationReason}</p>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Score</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {intelligence.overallScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">out of 100</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Score</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {intelligence.riskScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {intelligence.riskScore < 30 ? 'Low Risk' : intelligence.riskScore < 60 ? 'Medium Risk' : 'High Risk'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Liquidity</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {intelligence.liquidityScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {intelligence.liquidityScore > 70 ? 'Excellent' : intelligence.liquidityScore > 40 ? 'Good' : 'Poor'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Volatility</div>
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
            {intelligence.volatilityScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {intelligence.volatilityScore > 70 ? 'High' : intelligence.volatilityScore > 40 ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Risk Factors Analysis</h4>
        <div className="space-y-3">
          {Object.entries(intelligence.riskFactors).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{value.toFixed(0)}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    value < 30 ? 'bg-green-600' : value < 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      {intelligence.trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Market Trends</h4>
          <div className="space-y-2">
            {intelligence.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : trend.direction === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{trend.indicator}</span>
                  <span className="text-xs text-gray-500">({trend.timeframe})</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {trend.strength.toFixed(0)}% strength
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Recommendations Card Component
function RecommendationsCard({ recommendations }: { recommendations: any[] }) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No recommendations available at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                rec.category === 'high_probability' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                rec.category === 'trending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                rec.category === 'risk_adjusted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {rec.category.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${
                rec.riskLevel === 'low' ? 'text-green-600' :
                rec.riskLevel === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {rec.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{rec.score.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{rec.reason}</p>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
            <span>Est. Return: {rec.estimatedReturn.toFixed(1)}%</span>
            <span>Timeframe: {rec.timeframe}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

