'use client';

import { useEffect, useState } from 'react';
import { ClientWalletButton } from './client-wallet-button';

export function AutoHideWalletButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show button when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } 
      // Hide button when scrolling down past 100px
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed top-4 right-4 lg:right-6 xl:right-8 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-20'
      }`}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-md border border-gray-200/50 dark:border-gray-700/50 p-0.5 scale-90">
        <ClientWalletButton />
      </div>
    </div>
  );
}
