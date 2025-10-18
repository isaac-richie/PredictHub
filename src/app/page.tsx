import { ErrorBoundary } from '@/components/error-boundary';
import EnhancedServerMarkets from '@/components/enhanced-server-markets';
import { aggregationService } from '@/services/aggregation-service';
import Footer from './Footer';
import { ClientWalletButton } from '@/components/client-wallet-button';

async function getServerSideMarkets(limit: number = 300) {
  try {
    console.log('🔍 PredictHub: Fetching featured markets from all platforms...', 'limit:', limit);
    
    // Get featured markets - this ensures a proper shuffle from both Polymarket and Polkamarkets
    const featuredMarkets = await aggregationService.getFeaturedMarkets(limit);
    
    console.log('🔍 PredictHub: Featured markets ready for display');
    
    // Serialize dates to strings to prevent hydration mismatch
    const serializedMarkets = featuredMarkets.map(market => {
      const safeDate = (date: Date | undefined) => {
        if (!date) return undefined;
        try {
          return date.toISOString();
        } catch {
          return new Date().toISOString(); // Fallback to current date
        }
      };
      
      return {
        ...market,
        endDate: safeDate(market.endDate) || new Date().toISOString(),
        createdAt: safeDate(market.createdAt) || new Date().toISOString(),
        updatedAt: safeDate(market.updatedAt) || new Date().toISOString(),
        startDate: market.startDate ? safeDate(market.startDate) : undefined,
      };
    });
    
    return serializedMarkets as any;
  } catch (error) {
    console.error('Error fetching featured markets:', error);
    return [];
  }
}

export default async function Home() {
  const serverMarkets = await getServerSideMarkets();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ErrorBoundary>
        <div className="flex-1">
               {/* Wallet Button - Fixed Top Right */}
               <div className="fixed top-4 right-4 sm:top-6 sm:right-6 lg:right-8 xl:right-12 z-50">
                 <ClientWalletButton />
               </div>
               
               {/* Enhanced Header */}
               <div className="relative overflow-hidden">
                 {/* Background Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20"></div>
                 
                 {/* Animated Background Elements */}
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                 </div>
                 
               <div className="relative container mx-auto px-4 py-12 sm:py-16">
                 
                 <header className="text-center">
                   {/* Logo and Brand */}
                   <div className="mb-6 sm:mb-8">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
                        PredictHub
                      </h1>
                       
                       <div className="flex items-center justify-center space-x-2 mb-6">
                         <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                         <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                         <div className="h-1 w-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
                       </div>
                       
                       <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed px-4">
                         Your Gateway to the Future of Prediction Markets
                       </p>
                       
                       <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed px-4">
                         Discover, analyze, and trade prediction markets across multiple platforms. 
                         Real-time data, smart insights, and seamless trading in one place.
                       </p>
                     </div>
                     
                     {/* Stats and Features */}
                     <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8 mb-6 sm:mb-8 px-4">
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto justify-center">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                           {serverMarkets?.length || 0} Active Markets
                         </span>
                       </div>
                       
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto justify-center">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                         <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                           4+ Platforms
                         </span>
                       </div>
                       
                       <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto justify-center">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                         <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                           Real-time Data
                         </span>
                       </div>
                     </div>
                     
                     {/* Call to Action */}
                     <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                               <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                         <span className="flex items-center justify-center space-x-2">
                           <span>Explore Markets</span>
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                           </svg>
                         </span>
                       </button>
                       
                       <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                         <span className="flex items-center justify-center space-x-2">
                           <span>Learn More</span>
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                 <EnhancedServerMarkets markets={serverMarkets} />
               </div>
        </div>
      </ErrorBoundary>
      
      {/* Sticky Footer */}
      <Footer />
    </div>
  );
}
