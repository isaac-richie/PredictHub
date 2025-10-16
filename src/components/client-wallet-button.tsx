'use client';

import dynamic from 'next/dynamic';

// Dynamically import WalletButton to avoid SSR issues
const WalletButton = dynamic(() => import('./wallet-button').then(mod => ({ default: mod.WalletButton })), {
  ssr: false,
  loading: () => <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
});

export function ClientWalletButton() {
  return <WalletButton />;
}
