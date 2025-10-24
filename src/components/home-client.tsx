'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import EnhancedServerMarkets from '@/components/enhanced-server-markets';
import { PolymarketStyleModal } from '@/components/polymarket-style-modal';
import Footer from '../app/Footer';
import { AutoHideWalletButton } from '@/components/auto-hide-wallet-button';
import { OnchainProviders } from '@/components/onchain-providers';
import { PredictionMarket } from '@/types/prediction-market';

interface HomeClientProps {
  serverMarkets: PredictionMarket[];
}

export default function HomeClient({ serverMarkets }: HomeClientProps) {
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed - isModalOpen:', isModalOpen, 'selectedMarket:', selectedMarket?.title);
  }, [isModalOpen, selectedMarket]);

  const handleMarketClick = (market: PredictionMarket) => {
    console.log('🔍 Market clicked:', market.title || market.question);
    console.log('🔍 Setting selectedMarket:', market);
    console.log('🔍 Setting isModalOpen to true');
    setSelectedMarket(market);
    setIsModalOpen(true);
    console.log('🔍 Modal state should now be open');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  return (
    <OnchainProviders>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ErrorBoundary>
        <div className="flex-1">
               {/* Auto-hide Wallet Button */}
               <AutoHideWalletButton />
               
               {/* Enhanced Header */}
               <div className="relative overflow-hidden">
                 {/* Background Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20"></div>
                 
                 {/* Animated Background Elements */}
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                 </div>
                 
               <div className="relative container mx-auto px-4 py-16">
                 
                 <header className="text-center">
                   {/* Logo and Brand */}
                   <div className="mb-8">
                      <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
                        PredictHub
                      </h1>
                       
                       <div className="flex items-center justify-center space-x-2 mb-6">
                         <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                         <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                         <div className="h-1 w-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
                       </div>
                       
                       <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
                         Your Gateway to the Future of Prediction Markets
                       </p>
                       
                       <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
                         Discover, analyze, and trade prediction markets across multiple platforms. 
                         Real-time data, smart insights, and seamless trading in one place.
                       </p>
                     </div>
                     
                     {/* Stats and Features */}
                     <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                         <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-lg font-semibold text-gray-900 dark:text-white">
                           {serverMarkets?.length || 0} Active Markets
                         </span>
                       </div>
                       
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                         <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                         <span className="text-lg font-semibold text-gray-900 dark:text-white">
                           4+ Platforms
                         </span>
                       </div>
                       
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                         <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                         <span className="text-lg font-semibold text-gray-900 dark:text-white">
                           Real-time Data
                         </span>
                       </div>
                     </div>
                     
                     {/* Call to Action */}
                     <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                               <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                         <span className="flex items-center space-x-2">
                           <span>Explore Markets</span>
                           <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                           </svg>
                         </span>
                       </button>
                       
                       <button className="group px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                         <span className="flex items-center space-x-2">
                           <span>Learn More</span>
                           <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </span>
                       </button>
                     </div>
                   </header>
                 </div>
               </div>

               {/* Display server-side markets immediately */}
               <div className="container mx-auto px-4 py-8">
                 <EnhancedServerMarkets markets={serverMarkets} onMarketClick={handleMarketClick} />
               </div>
        </div>
      </ErrorBoundary>
      
      {/* Market Detail Modal with AI Insights */}
      {isModalOpen && selectedMarket && (
        <PolymarketStyleModal 
          market={selectedMarket}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
      
      {/* Sticky Footer */}
      <Footer />
    </div>
    </OnchainProviders>
  );
}

