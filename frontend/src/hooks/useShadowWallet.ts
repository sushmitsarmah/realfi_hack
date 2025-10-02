// hooks/useShadowWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { ShadowWallet } from '@/lib/wallet-core';
import { Message } from '@/lib/waku-messenger';

export function useShadowWallet() {
  const [wallet, setWallet] = useState<ShadowWallet | null>(null);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.0');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [torStatus, setTorStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [wakuStatus, setWakuStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Initialize wallet
  const initialize = useCallback(async (privateKey?: string) => {
    try {
      setTorStatus('connecting');
      setWakuStatus('connecting');
      
      const newWallet = new ShadowWallet();
      await newWallet.initialize(privateKey);
      
      setWallet(newWallet);
      setAddress(newWallet.getAddress());
      
      // Update balance
      const bal = await newWallet.getBalance();
      setBalance(bal);
      
      setTorStatus('connected');
      setWakuStatus('connected');
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      setTorStatus('disconnected');
      setWakuStatus('disconnected');
    }
  }, []);
  
  // Send payment
  const sendPayment = useCallback(async (to: string, amount: string, message?: string) => {
    if (!wallet) throw new Error('Wallet not initialized');
    
    const tx = await wallet.sendPayment(to, amount, message);
    
    // Update balance after transaction
    const newBalance = await wallet.getBalance();
    setBalance(newBalance);
    
    return tx;
  }, [wallet]);
  
  // Send message
  const sendMessage = useCallback(async (to: string, content: string) => {
    if (!wallet) throw new Error('Wallet not initialized');
    
    await wallet.sendChatMessage(to, content);
  }, [wallet]);
  
  // Request payment
  const requestPayment = useCallback(async (from: string, amount: string, reason: string) => {
    if (!wallet) throw new Error('Wallet not initialized');
    
    await wallet.requestPayment(from, amount, reason);
  }, [wallet]);
  
  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    
    const bal = await wallet.getBalance();
    setBalance(bal);
  }, [wallet]);
  
  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!wallet) return;
    
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet, refreshBalance]);
  
  return {
    wallet,
    address,
    balance,
    messages,
    isInitialized,
    torStatus,
    wakuStatus,
    initialize,
    sendPayment,
    sendMessage,
    requestPayment,
    refreshBalance
  };
}
