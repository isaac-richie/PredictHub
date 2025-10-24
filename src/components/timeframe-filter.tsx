'use client';

import { useState } from 'react';

interface TimeframeFilterProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframes = [
  { id: 'all', label: 'All Markets', description: 'All available prediction markets', icon: '🌐' },
  { id: '24h', label: '24 Hours', description: 'Markets closing soon or high volume', icon: '⚡' },
  { id: '7d', label: '7 Days', description: 'Markets closing within a week', icon: '📅' },
  { id: '30d', label: '30 Days', description: 'Medium-term predictions', icon: '📊' },
  { id: 'future', label: 'Future', description: 'Long-term predictions', icon: '🔮' },
  { id: 'trending', label: 'Trending', description: 'High-volume trending markets', icon: '🔥' },
];

export function TimeframeFilter({ selectedTimeframe, onTimeframeChange }: TimeframeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full mb-6">
      <div className="flex flex-wrap gap-2">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => onTimeframeChange(timeframe.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedTimeframe === timeframe.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <span className="text-lg">{timeframe.icon}</span>
            <span>{timeframe.label}</span>
          </button>
        ))}
      </div>
      
      {/* Description for selected timeframe */}
      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {timeframes.find(t => t.id === selectedTimeframe)?.icon}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {timeframes.find(t => t.id === selectedTimeframe)?.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timeframes.find(t => t.id === selectedTimeframe)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

