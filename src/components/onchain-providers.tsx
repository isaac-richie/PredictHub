'use client';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia, polygon, polygonAmoy } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { ReactNode } from 'react';
import { useEffect, useState } from 'react';

// Configure wagmi with RainbowKit for multiple chains
// Base: For LimitlessLabs trading
// Polygon: For Polymarket and Polkamarkets trading
const wagmiConfig = getDefaultConfig({
  appName: 'PredictHub',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a57b3b54d689f7423af373642a7a3110',
  chains: [base, baseSepolia, polygon, polygonAmoy],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable queries during SSR
      enabled: typeof window !== 'undefined',
    },
  },
});

interface OnchainProvidersProps {
  children: ReactNode;
}

export function OnchainProviders({ children }: OnchainProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render wallet providers during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={base}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

