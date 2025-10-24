'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  return (
    <div className="flex items-center">
      <ConnectButton 
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'avatar',
        }}
        showBalance={{
          smallScreen: false,
          largeScreen: false,
        }}
        label="Connect"
      />
    </div>
  );
}
