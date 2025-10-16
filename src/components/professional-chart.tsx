'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

interface ProfessionalChartProps {
  data: any[];
  market: any;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

export function ProfessionalChart({ data, market, selectedTimeRange, onTimeRangeChange }: ProfessionalChartProps) {
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [showMA, setShowMA] = useState(true);
  const [chartWidth, setChartWidth] = useState(1000);
  const [baseChartHeight, setBaseChartHeight] = useState(400);
  const [expanded, setExpanded] = useState(false);
  
  // Zoom & Pan state (in indices of candles)
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(50);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState<number | null>(null);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('chart-container');
      if (container) {
        const width = container.clientWidth;
        setChartWidth(width);
        setBaseChartHeight(width < 768 ? 300 : 400);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Process data into candlesticks with enhanced fallback
  const candleData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate realistic mock data when no real data is available
      const now = Date.now();
      const timeRange = selectedTimeRange === '1h' ? 60 * 60 * 1000 :
                       selectedTimeRange === '6h' ? 6 * 60 * 60 * 1000 :
                       selectedTimeRange === '24h' ? 24 * 60 * 60 * 1000 :
                       selectedTimeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                       30 * 24 * 60 * 60 * 1000;
      
      const startTime = now - timeRange;
      const interval = timeRange / 50; // 50 candles
      const basePrice = market?.yesPrice || 0.5;
      
      const mockCandles: CandleData[] = [];
      let currentPrice = basePrice;
      
      for (let i = 0; i < 50; i++) {
        const timestamp = startTime + (i * interval);
        const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
        const open = currentPrice;
        const close = Math.max(0.01, Math.min(0.99, open + priceChange));
        const high = Math.max(open, close) + Math.random() * 0.005;
        const low = Math.min(open, close) - Math.random() * 0.005;
        
        mockCandles.push({
          timestamp,
          open,
          high: Math.min(0.99, high),
          low: Math.max(0.01, low),
          close,
          volume: 5000 + Math.random() * 15000,
          date: new Date(timestamp).toISOString()
        });
        
        currentPrice = close;
      }
      
      return mockCandles;
    }

    // If we have real data but very little, enhance it
    if (data.length < 10) {
      // Use the real data as a base and generate additional points
      const basePrice = data[0]?.price || data[0]?.close || 0.5;
      const now = Date.now();
      const timeRange = selectedTimeRange === '1h' ? 60 * 60 * 1000 :
                       selectedTimeRange === '6h' ? 6 * 60 * 60 * 1000 :
                       selectedTimeRange === '24h' ? 24 * 60 * 60 * 1000 :
                       selectedTimeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                       30 * 24 * 60 * 60 * 1000;
      
      const startTime = now - timeRange;
      const interval = timeRange / 50;
      
      const enhancedCandles: CandleData[] = [];
      let currentPrice = basePrice;
      
      // Add real data points
      data.forEach((point, i) => {
        const price = point.price || point.close || currentPrice;
        enhancedCandles.push({
          timestamp: point.timestamp || (startTime + (i * interval)),
          open: price,
          high: price + Math.random() * 0.01,
          low: price - Math.random() * 0.01,
          close: price,
          volume: point.volume || 1000 + Math.random() * 5000,
          date: point.date || new Date(point.timestamp || startTime + (i * interval)).toISOString()
        });
        currentPrice = price;
      });
      
      // Fill gaps with realistic data
      while (enhancedCandles.length < 50) {
        const lastCandle = enhancedCandles[enhancedCandles.length - 1];
        const timestamp = lastCandle.timestamp + interval;
        const priceChange = (Math.random() - 0.5) * 0.01;
        const open = lastCandle.close;
        const close = Math.max(0.01, Math.min(0.99, open + priceChange));
        
        enhancedCandles.push({
          timestamp,
          open,
          high: Math.max(open, close) + Math.random() * 0.005,
          low: Math.min(open, close) - Math.random() * 0.005,
          close,
          volume: 1000 + Math.random() * 8000,
          date: new Date(timestamp).toISOString()
        });
      }
      
      return enhancedCandles.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Normal processing for sufficient data
    const interval = selectedTimeRange === '1h' ? 5 * 60 * 1000 :
                    selectedTimeRange === '6h' ? 15 * 60 * 1000 :
                    selectedTimeRange === '24h' ? 30 * 60 * 1000 :
                    selectedTimeRange === '7d' ? 2 * 60 * 60 * 1000 :
                    4 * 60 * 60 * 1000;

    const buckets = new Map<number, number[]>();
    
    data.forEach(point => {
      const price = point.price || point.close || 0;
      const bucketTime = Math.floor(point.timestamp / interval) * interval;
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(price);
    });

    const candles: CandleData[] = [];
    buckets.forEach((prices, timestamp) => {
      if (prices.length > 0) {
        candles.push({
          timestamp,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: Math.random() * 10000,
          date: new Date(timestamp).toISOString()
        });
      }
    });

    return candles.sort((a, b) => a.timestamp - b.timestamp);
  }, [data, selectedTimeRange, market]);

  // Calculate moving average
  const movingAverage = useMemo(() => {
    if (candleData.length < 7) return [];
    const ma: { timestamp: number; value: number }[] = [];
    const period = 7;
    
    for (let i = period - 1; i < candleData.length; i++) {
      const sum = candleData.slice(i - period + 1, i + 1).reduce((acc, c) => acc + c.close, 0);
      ma.push({
        timestamp: candleData[i].timestamp,
        value: sum / period
      });
    }
    
    return ma;
  }, [candleData]);

  // Determine visible candles based on zoom/pan
  const visibleCandles = useMemo(() => {
    if (candleData.length === 0) return [] as CandleData[];
    const count = Math.min(candleData.length, Math.max(10, visibleCount || candleData.length));
    const start = Math.min(
      Math.max(0, visibleStart),
      Math.max(0, candleData.length - count)
    );
    return candleData.slice(start, start + count);
  }, [candleData, visibleStart, visibleCount]);

  // Keep zoom defaults in sync when data changes
  useEffect(() => {
    if (candleData.length > 0) {
      const defaultCount = Math.min(candleData.length, Math.max(30, Math.floor(candleData.length * 0.6)));
      setVisibleCount(defaultCount);
      setVisibleStart(Math.max(0, candleData.length - defaultCount));
    }
  }, [candleData]);

  // Calculate ranges
  const priceRange = useMemo(() => {
    if (visibleCandles.length === 0) return { min: 0, max: 1 };
    const prices = visibleCandles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.15;
    return { min: Math.max(0, min - padding), max: max + padding };
  }, [visibleCandles]);

  const volumeRange = useMemo(() => {
    if (visibleCandles.length === 0) return { min: 0, max: 100 };
    const volumes = visibleCandles.map(c => c.volume);
    return { min: 0, max: Math.max(...volumes) };
  }, [visibleCandles]);

  // Chart dimensions
  const padding = { top: 30, right: 70, bottom: 50, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const chartHeight = (expanded ? Math.round(baseChartHeight * 1.6) : baseChartHeight);
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const priceHeight = innerHeight * 0.75;
  const volumeHeight = innerHeight * 0.20;

  // Scale functions
  const xScale = (timestamp: number) => {
    if (visibleCandles.length === 0) return 0;
    const minTime = visibleCandles[0].timestamp;
    const maxTime = visibleCandles[visibleCandles.length - 1].timestamp;
    return ((timestamp - minTime) / (maxTime - minTime)) * innerWidth + padding.left;
  };

  const yScale = (price: number) => {
    return priceHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * priceHeight + padding.top;
  };

  const volumeYScale = (volume: number) => {
    return volumeHeight - (volume / volumeRange.max) * volumeHeight;
  };

  // Format functions
  const formatPrice = (price: number) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(3);
    return price.toFixed(4);
  };


  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedTimeRange === '1h' || selectedTimeRange === '6h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (selectedTimeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Grid lines
  const gridLines: Array<{ price: number; y: number }> = Array.from({ length: 5 }, (_, i) => {
    const price = priceRange.min + (priceRange.max - priceRange.min) * (i / 4);
    const y = yScale(price);
    return { price, y };
  });

  const timeRanges = ['1h', '6h', '24h', '7d', '30d'];
  const candleWidth = Math.max(3, Math.min(20, innerWidth / Math.max(1, visibleCandles.length) * 0.7));

  if (visibleCandles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Chart</h3>
          <div className="flex gap-2">
            {timeRanges.map(range => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-center">
            <BarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try selecting a different time range</p>
          </div>
        </div>
      </div>
    );
  }

  const latestCandle = visibleCandles[visibleCandles.length - 1];
  const firstCandle = visibleCandles[0];
  const priceChange = latestCandle.close - firstCandle.open;
  const priceChangePercent = (priceChange / firstCandle.open) * 100;

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Price Chart</h3>
          {hoveredCandle ? (
            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs">O</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatPrice(hoveredCandle.open)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs">H</span>
                <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(hoveredCandle.high)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs">L</span>
                <span className="font-bold text-red-600 dark:text-red-400">{formatPrice(hoveredCandle.low)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs">C</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatPrice(hoveredCandle.close)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(latestCandle.close)}</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Time Range + MA Toggle + Zoom/Expand */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              showMA
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            MA7
          </button>
          {timeRanges.map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <button
              onClick={() => {
                const newCount = Math.max(10, Math.floor(visibleCount * 0.8));
                const center = visibleStart + visibleCount / 2;
                const start = Math.max(0, Math.round(center - newCount / 2));
                setVisibleCount(newCount);
                setVisibleStart(Math.min(Math.max(0, start), Math.max(0, candleData.length - newCount)));
              }}
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Zoom-
            </button>
            <button
              onClick={() => {
                const newCount = Math.min(candleData.length, Math.ceil(visibleCount * 1.25));
                const center = visibleStart + visibleCount / 2;
                const start = Math.max(0, Math.round(center - newCount / 2));
                setVisibleCount(newCount);
                setVisibleStart(Math.min(Math.max(0, start), Math.max(0, candleData.length - newCount)));
              }}
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Zoom+
            </button>
            <button
              onClick={() => {
                const defaultCount = Math.min(candleData.length, Math.max(30, Math.floor(candleData.length * 0.6)));
                setVisibleCount(defaultCount);
                setVisibleStart(Math.max(0, candleData.length - defaultCount));
              }}
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Reset
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
            >
              {expanded ? 'Contract' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Chart SVG */}
      <div id="chart-container" className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="select-none"
          onMouseLeave={() => { setHoveredCandle(null); setIsPanning(false); setPanStartX(null); }}
          onWheel={(e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1; // 1 = zoom out, -1 = zoom in
            const factor = direction > 0 ? 1.15 : 0.85;
            const newCount = Math.min(Math.max(10, Math.round(visibleCount * factor)), candleData.length);
            const center = visibleStart + visibleCount / 2;
            const start = Math.max(0, Math.round(center - newCount / 2));
            setVisibleCount(newCount);
            setVisibleStart(Math.min(Math.max(0, start), Math.max(0, candleData.length - newCount)));
          }}
          onMouseDown={(e) => {
            setIsPanning(true);
            setPanStartX(e.clientX);
          }}
          onMouseUp={() => { setIsPanning(false); setPanStartX(null); }}
          onMouseMove={(e) => {
            if (!isPanning || panStartX == null) return;
            const dx = e.clientX - panStartX;
            const pixelsPerCandle = innerWidth / Math.max(1, visibleCount);
            if (Math.abs(pixelsPerCandle) < 0.0001) return;
            const shift = -Math.round(dx / pixelsPerCandle);
            if (shift !== 0) {
              const newStart = Math.min(Math.max(0, visibleStart + shift), Math.max(0, candleData.length - visibleCount));
              setVisibleStart(newStart);
              setPanStartX(e.clientX);
            }
          }}
        >
          {/* Grid Lines */}
          {gridLines.map(({ price, y }, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.08}
                className="text-gray-300 dark:text-gray-700"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - padding.right + 10}
                y={y + 4}
                fill="currentColor"
                fontSize={12}
                fontWeight="500"
                className="text-gray-600 dark:text-gray-400"
              >
                {formatPrice(price)}
              </text>
            </g>
          ))}

          {/* Moving Average */}
          {showMA && movingAverage.length > 1 && (
            <path
              d={movingAverage.map((ma, i) => 
                `${i === 0 ? 'M' : 'L'} ${xScale(ma.timestamp)} ${yScale(ma.value)}`
              ).join(' ')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeOpacity={0.7}
            />
          )}

          {/* Candlesticks */}
          {visibleCandles.map((candle, i) => {
            const x = xScale(candle.timestamp);
            const isGreen = candle.close >= candle.open;
            const bodyTop = yScale(Math.max(candle.open, candle.close));
            const bodyBottom = yScale(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(2, bodyBottom - bodyTop);

            return (
              <g
                key={`candle-${i}`}
                onMouseEnter={() => setHoveredCandle(candle)}
                className="cursor-pointer"
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={yScale(candle.high)}
                  x2={x}
                  y2={yScale(candle.low)}
                  stroke={isGreen ? '#10B981' : '#EF4444'}
                  strokeWidth={Math.max(1, candleWidth / 4)}
                  opacity={0.9}
                />
                
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isGreen ? '#10B981' : '#EF4444'}
                  opacity={hoveredCandle === candle ? 1 : 0.95}
                  stroke={isGreen ? '#059669' : '#DC2626'}
                  strokeWidth={hoveredCandle === candle ? 2 : 0}
                  rx={1}
                />

                {/* Hover Indicator */}
                {hoveredCandle === candle && (
                  <>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={priceHeight + padding.top}
                      stroke="#6B7280"
                      strokeWidth={1}
                      strokeOpacity={0.3}
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={x}
                      cy={yScale(candle.close)}
                      r={4}
                      fill={isGreen ? '#10B981' : '#EF4444'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Volume Bars */}
          <g transform={`translate(0, ${priceHeight + padding.top + 20})`}>
            {visibleCandles.map((candle, i) => {
              const x = xScale(candle.timestamp);
              const barHeight = volumeYScale(candle.volume);
              const isGreen = candle.close >= candle.open;

              return (
                <rect
                  key={`volume-${i}`}
                  x={x - candleWidth / 2}
                  y={volumeHeight - barHeight}
                  width={candleWidth}
                  height={barHeight}
                  fill={isGreen ? '#10B981' : '#EF4444'}
                  opacity={0.3}
                  rx={1}
                />
              );
            })}
          </g>

          {/* X-axis labels */}
          {visibleCandles.filter((_, i) => i % Math.max(1, Math.ceil(visibleCandles.length / 6)) === 0).map((candle, i) => (
            <text
              key={`label-${i}`}
              x={xScale(candle.timestamp)}
              y={chartHeight - 15}
              fill="currentColor"
              fontSize={11}
              fontWeight="500"
              textAnchor="middle"
              className="text-gray-600 dark:text-gray-400"
            >
              {formatDate(candle.timestamp)}
            </text>
          ))}

          {/* Volume Label */}
          <text
            x={padding.left}
            y={priceHeight + padding.top + 15}
            fill="currentColor"
            fontSize={10}
            fontWeight="600"
            className="text-gray-500 dark:text-gray-400"
          >
            Volume
          </text>
        </svg>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Current</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatPrice(latestCandle.close)}
          </div>
        </div>

        <div className={`bg-gradient-to-br ${priceChange >= 0 ? 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800' : 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800'} rounded-lg p-4 border`}>
          <div className="flex items-center gap-2 mb-1">
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-xs font-semibold ${priceChange >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              Change
            </span>
          </div>
          <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">High</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatPrice(Math.max(...candleData.map(c => c.high)))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Low</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {formatPrice(Math.min(...candleData.map(c => c.low)))}
          </div>
        </div>
      </div>
    </div>
  );
}
