// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useShadowWallet } from '@/hooks/useShadowWallet';
import WalletView from '@/components/WalletView';
import MessengerView from '@/components/MessengerView';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const {
    wallet,
    address,
    balance,
    isInitialized,
    torStatus,
    wakuStatus,
    initialize,
    sendPayment,
    sendMessage
  } = useShadowWallet();
  
  useEffect(() => {
    // Check for existing wallet in localStorage
    const savedKey = localStorage.getItem('wallet_private_key');
    
    if (savedKey) {
      initialize(savedKey);
    } else {
      // Create new wallet
      initialize().then(() => {
        if (wallet) {
          localStorage.setItem('wallet_private_key', wallet.getPrivateKey());
        }
      });
    }
  }, []);
  
  if (!isInitialized) {
    return <LoadingScreen torStatus={torStatus} wakuStatus={wakuStatus} />;
  }
  
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Your UI components */}
      </div>
    </main>
  );
}
