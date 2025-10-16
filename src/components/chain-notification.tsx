'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { base, polygon } from 'viem/chains';

interface ChainNotificationProps {
  requiredChainId: number;
  platformName: string;
}

export function ChainNotification({ requiredChainId, platformName }: ChainNotificationProps) {
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  
  // Get chain details
  const getChainInfo = (chainId: number) => {
    switch (chainId) {
      case base.id:
        return { name: 'Base', color: 'blue' };
      case polygon.id:
        return { name: 'Polygon', color: 'purple' };
      default:
        return { name: 'Unknown', color: 'gray' };
    }
  };
  
  const requiredChain = getChainInfo(requiredChainId);
  const isWrongChain = currentChainId !== requiredChainId;
  
  if (!isWrongChain) return null;
  
  return (
    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-xl animate-pulse">
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
            Wrong Network Detected
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
            To trade on <strong>{platformName}</strong>, you need to switch to the <strong>{requiredChain.name}</strong> network.
          </p>
          
          {/* Switch Button */}
          <button
            onClick={() => switchChain({ chainId: requiredChainId })}
            disabled={isPending}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Switching...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Switch to {requiredChain.name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}




