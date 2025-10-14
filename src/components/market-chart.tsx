'use client';

import { useState, useEffect, useMemo } from 'react';

interface MarketChartProps {
  data: any[];
  market: any;
  loading?: boolean;
  onTimeRangeChange?: (timeRange: string) => void;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  date: string;
}

interface CandlestickDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

export function MarketChart({ data, market, loading = false, onTimeRangeChange }: MarketChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [showVolumeBars, setShowVolumeBars] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point: any) => ({
      timestamp: new Date(point.timestamp || point.date).getTime(),
      price: parseFloat(point.price || point.value || 0),
      volume: parseFloat(point.volume || 0),
      date: new Date(point.timestamp || point.date).toLocaleDateString(),
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Convert line data to candlestick data
  const candlestickData = useMemo(() => {
    if (!chartData.length) return [];

    // Group data into time intervals for candlestick formation
    const interval = Math.max(1, Math.floor(chartData.length / 50)); // Aim for ~50 candlesticks
    const candles: CandlestickDataPoint[] = [];

    for (let i = 0; i < chartData.length; i += interval) {
      const group = chartData.slice(i, i + interval);
      if (group.length === 0) continue;

      const prices = group.map(d => d.price);
      const volumes = group.map(d => d.volume);
      
      const open = group[0].price;
      const close = group[group.length - 1].price;
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      const volume = volumes.reduce((sum, vol) => sum + vol, 0);

      candles.push({
        timestamp: group[0].timestamp,
        open,
        high,
        low,
        close,
        volume,
        date: group[0].date,
      });
    }

    return candles;
  }, [chartData]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const sourceData = chartType === 'candlestick' ? candlestickData : chartData;
    if (!sourceData.length) return [];

    const now = Date.now();
    let timeRange = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    switch (selectedTimeRange) {
      case '1h':
        timeRange = 60 * 60 * 1000; // 1 hour
        break;
      case '6h':
        timeRange = 6 * 60 * 60 * 1000; // 6 hours
        break;
      case '24h':
        timeRange = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case '7d':
        timeRange = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case '30d':
        timeRange = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
    }

    const cutoff = now - timeRange;
    return sourceData.filter(point => point.timestamp >= cutoff);
  }, [chartData, candlestickData, selectedTimeRange, chartType]);

  // Calculate responsive chart dimensions and scales
  const chartHeight = isMobile ? 300 : 400;
  const chartPadding = isMobile ? 30 : 40;
  const chartWidth = isMobile ? 600 : 800;

  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (!filteredData.length) return { minPrice: 0, maxPrice: 1, priceRange: 1, maxVolume: 1 };

    let prices: number[] = [];
    const volumes = filteredData.map(d => d.volume);

    if (chartType === 'candlestick') {
      // For candlesticks, use high and low prices
      const candlestickData = filteredData as CandlestickDataPoint[];
      prices = candlestickData.flatMap(d => [d.high, d.low]);
    } else {
      // For line charts, use price
      prices = filteredData.map(d => (d as ChartDataPoint).price);
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const maxVolume = Math.max(...volumes) || 1;

    return { minPrice, maxPrice, priceRange, maxVolume };
  }, [filteredData, chartType]);

  // Generate SVG path for price line
  const generatePricePath = () => {
    if (!filteredData.length) return '';

    const points = filteredData.map((point, index) => {
      const x = (index / (filteredData.length - 1)) * (chartWidth - 2 * chartPadding) + chartPadding;
      const price = chartType === 'candlestick' ? (point as CandlestickDataPoint).close : (point as ChartDataPoint).price;
      const y = chartHeight - chartPadding - ((price - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    return points.join(' ');
  };

  // Generate candlestick elements
  const generateCandlesticks = () => {
    if (chartType !== 'candlestick' || !filteredData.length) return null;

    const candlestickData = filteredData as CandlestickDataPoint[];
    const candleWidth = Math.max(2, (chartWidth - 2 * chartPadding) / candlestickData.length * 0.8);

    return candlestickData.map((candle, index) => {
      const x = (index / (candlestickData.length - 1)) * (chartWidth - 2 * chartPadding) + chartPadding;
      
      const openY = chartHeight - chartPadding - ((candle.open - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);
      const closeY = chartHeight - chartPadding - ((candle.close - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);
      const highY = chartHeight - chartPadding - ((candle.high - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);
      const lowY = chartHeight - chartPadding - ((candle.low - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);

      const isBullish = candle.close > candle.open;
      const fillColor = isBullish ? '#10B981' : '#EF4444'; // Green for bullish, red for bearish
      const strokeColor = isBullish ? '#059669' : '#DC2626';

      return (
        <g key={index}>
          {/* High-Low line */}
          <line
            x1={x}
            y1={highY}
            x2={x}
            y2={lowY}
            stroke={strokeColor}
            strokeWidth="1"
          />
          
          {/* Open tick */}
          <line
            x1={x - candleWidth / 2}
            y1={openY}
            x2={x}
            y2={openY}
            stroke={strokeColor}
            strokeWidth="2"
          />
          
          {/* Close tick */}
          <line
            x1={x}
            y1={closeY}
            x2={x + candleWidth / 2}
            y2={closeY}
            stroke={strokeColor}
            strokeWidth="2"
          />
          
          {/* Candle body */}
          <rect
            x={x - candleWidth / 4}
            y={Math.min(openY, closeY)}
            width={candleWidth / 2}
            height={Math.abs(closeY - openY) || 1}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity cursor-pointer"
            onMouseEnter={() => setHoveredPoint({
              ...candle,
              price: candle.close
            } as any)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        </g>
      );
    });
  };

  // Handle time range selection
  const handleTimeRangeChange = (newTimeRange: string) => {
    setSelectedTimeRange(newTimeRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newTimeRange);
    }
  };

  const timeRanges = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
  ];

  if (loading && chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Chart Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Price history data is not available for this market.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Time Range and Price */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Range:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleTimeRangeChange(range.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedTimeRange === range.value
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chart Type:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartType === 'line'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600'
                  }`}
                >
                  📈 Line
                </button>
                <button
                  onClick={() => setChartType('candlestick')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartType === 'candlestick'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600'
                  }`}
                >
                  🕯️ Candlestick
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVolumeBars(!showVolumeBars)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showVolumeBars
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600'
                }`}
              >
                📊 Volume Bars
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Current Price Display */}
        {filteredData.length > 0 && (
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {(() => {
                const lastPoint = filteredData[filteredData.length - 1];
                const currentPrice = chartType === 'candlestick' 
                  ? (lastPoint as CandlestickDataPoint).close 
                  : (lastPoint as ChartDataPoint).price;
                
                const prevPoint = filteredData[filteredData.length - 2];
                const prevPrice = prevPoint ? (
                  chartType === 'candlestick' 
                    ? (prevPoint as CandlestickDataPoint).close 
                    : (prevPoint as ChartDataPoint).price
                ) : currentPrice;
                
                return (
                  <>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      ${currentPrice.toFixed(4)}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      filteredData.length > 1 
                        ? (currentPrice > prevPrice
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200')
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {filteredData.length > 1 
                        ? (currentPrice > prevPrice ? '↗' : '↘')
                        : '—'
                      }
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center justify-end space-x-2 mt-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {chartType === 'candlestick' ? 'Close Price' : 'Current Price'} • {filteredData.length} {chartType === 'candlestick' ? 'candles' : 'data points'}
              </div>
              {(() => {
                // Check if we're using real data or fallback
                const hasRealData = market?.platform === 'polymarket' && 
                  filteredData.length > 0 && 
                  filteredData.some(point => {
                    const price = 'price' in point ? point.price : point.close;
                    return price > 0.001 && price < 0.999;
                  }); // Real Polymarket prices are usually in this range
                
                if (market?.platform === 'polymarket') {
                  return hasRealData ? (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                      🔴 Live Data
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                      📊 Realistic Chart Data
                    </div>
                  );
                } else {
                  return (
                    <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                      📊 Simulated
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Chart Container */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible"
        >
          {/* Enhanced Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Animated Price Line with Glow Effect */}
          <path
            d={generatePricePath()}
            fill="none"
            stroke="url(#priceGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            opacity="0.6"
          />
          <path
            d={generatePricePath()}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />

          {/* Enhanced Gradient Fill (only for line charts) */}
          {chartType === 'line' && (
            <path
              d={`${generatePricePath()} L ${chartWidth - chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${chartHeight - chartPadding} Z`}
              fill="url(#priceGradient)"
            />
          )}

          {/* Volume Bars */}
          {showVolumeBars && filteredData.map((point, index) => {
            const x = (index / (filteredData.length - 1)) * (chartWidth - 2 * chartPadding) + chartPadding;
            const barWidth = (chartWidth - 2 * chartPadding) / filteredData.length * 0.8;
            const barHeight = (point.volume / maxVolume) * (chartHeight - 2 * chartPadding) * 0.3;
            const barY = chartHeight - chartPadding - barHeight;
            
            return (
              <rect
                key={`volume-${index}`}
                x={x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#10B981"
                opacity="0.3"
                className="hover:opacity-60 transition-opacity duration-200"
              />
            );
          })}

          {/* Candlestick Chart */}
          {chartType === 'candlestick' && generateCandlesticks()}

          {/* Line Chart Data Points */}
          {chartType === 'line' && filteredData.map((point, index) => {
            const x = (index / (filteredData.length - 1)) * (chartWidth - 2 * chartPadding) + chartPadding;
            const y = chartHeight - chartPadding - (((point as ChartDataPoint).price - minPrice) / priceRange) * (chartHeight - 2 * chartPadding);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#3B82F6"
                  className="opacity-0 hover:opacity-100 transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point as ChartDataPoint)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3B82F6"
                  className="transition-all duration-200 cursor-pointer hover:r-5"
                  onMouseEnter={() => setHoveredPoint(point as ChartDataPoint)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Enhanced Hover Tooltip */}
          {hoveredPoint && (
            <g>
              <defs>
                <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
                </filter>
              </defs>
              <rect
                x={chartWidth - 220}
                y={20}
                width={200}
                height={100}
                fill="rgba(17, 24, 39, 0.95)"
                rx="12"
                filter="url(#tooltipShadow)"
              />
              <rect
                x={chartWidth - 220}
                y={20}
                width={200}
                height="2"
                fill="url(#priceGradient)"
                rx="12"
              />
              {chartType === 'candlestick' && (hoveredPoint as any).open ? (
                <>
                  <text x={chartWidth - 210} y={25} fill="white" fontSize="14" fontWeight="bold">
                    OHLC: ${(hoveredPoint as any).open.toFixed(4)} / ${(hoveredPoint as any).high.toFixed(4)} / ${(hoveredPoint as any).low.toFixed(4)} / ${(hoveredPoint as any).close.toFixed(4)}
                  </text>
                  <text x={chartWidth - 210} y={45} fill="white" fontSize="16" fontWeight="bold">
                    Close: ${hoveredPoint.price.toFixed(4)}
                  </text>
                  <text x={chartWidth - 210} y={65} fill="#94A3B8" fontSize="12">
                    Volume: {hoveredPoint.volume.toLocaleString()}
                  </text>
                  <text x={chartWidth - 210} y={85} fill="#94A3B8" fontSize="12">
                    {hoveredPoint.date}
                  </text>
                  <text x={chartWidth - 210} y={105} fill="#94A3B8" fontSize="11">
                    Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}
                  </text>
                </>
              ) : (
                <>
                  <text x={chartWidth - 210} y={45} fill="white" fontSize="16" fontWeight="bold">
                    ${hoveredPoint.price.toFixed(4)}
                  </text>
                  <text x={chartWidth - 210} y={65} fill="#94A3B8" fontSize="12">
                    Volume: {hoveredPoint.volume.toLocaleString()}
                  </text>
                  <text x={chartWidth - 210} y={85} fill="#94A3B8" fontSize="12">
                    {hoveredPoint.date}
                  </text>
                  <text x={chartWidth - 210} y={105} fill="#94A3B8" fontSize="11">
                    Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}
                  </text>
                </>
              )}
            </g>
          )}
        </svg>

        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>${maxPrice.toFixed(4)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(4)}</span>
          <span>${minPrice.toFixed(4)}</span>
        </div>

        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-12 right-12 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{filteredData[0]?.date || ''}</span>
          <span>{filteredData[Math.floor(filteredData.length / 2)]?.date || ''}</span>
          <span>{filteredData[filteredData.length - 1]?.date || ''}</span>
        </div>
      </div>

      {/* Enhanced Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="text-sm font-medium text-green-700 dark:text-green-400">Period High</div>
          </div>
          <div className="text-xl font-bold text-green-900 dark:text-green-100">
            ${maxPrice.toFixed(4)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">
            {selectedTimeRange.toUpperCase()} maximum
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="text-sm font-medium text-red-700 dark:text-red-400">Period Low</div>
          </div>
          <div className="text-xl font-bold text-red-900 dark:text-red-100">
            ${minPrice.toFixed(4)}
          </div>
          <div className="text-xs text-red-600 dark:text-red-500 mt-1">
            {selectedTimeRange.toUpperCase()} minimum
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {chartType === 'candlestick' ? 'Candles' : 'Data Points'}
            </div>
          </div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {filteredData.length}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
            {chartType === 'candlestick' ? 'Time intervals' : 'Price observations'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-400">
              {chartType === 'candlestick' ? 'Range' : 'Volatility'}
            </div>
          </div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
            {((maxPrice - minPrice) / minPrice * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">
            {chartType === 'candlestick' ? 'High-Low spread' : 'Price range'}
          </div>
        </div>
      </div>
    </div>
  );
}

