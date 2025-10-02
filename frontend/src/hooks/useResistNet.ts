// hooks/useResistNet.ts
import { useState, useEffect, useCallback } from 'react';
import { EnhancedShadowWallet } from '@/lib/enhanced-wallet';
import { CensorshipResistantPublisher } from '@/lib/censorship-resistant';
import { ResilientCoordination } from '@/lib/resilient-coordination';
import { SecureDataVault } from '@/lib/secure-vault';
import { IdentityManager } from '@/lib/identity-manager';

export function useResistNet() {
  const [wallet, setWallet] = useState<EnhancedShadowWallet | null>(null);
  const [publisher, setPublisher] = useState<CensorshipResistantPublisher | null>(null);
  const [coordination, setCoordination] = useState<ResilientCoordination | null>(null);
  const [vault, setVault] = useState<SecureDataVault | null>(null);
  const [identity, setIdentity] = useState<any>(null);
  
  const [networkStatus, setNetworkStatus] = useState({
    tor: 'disconnected',
    waku: 'disconnected',
    nimbus: 'disconnected',
    nillion: 'disconnected',
    ipfs: 'disconnected'
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize all systems
  const initialize = useCallback(async (
    privateKey?: string,
    gitcoinApiKey?: string,
    humanityApiKey?: string
  ) => {
    try {
      console.log('🚀 Initializing ResistNet...');
      
      // 1. Initialize Identity Manager
      const identityMgr = new IdentityManager(
        gitcoinApiKey || process.env.NEXT_PUBLIC_GITCOIN_API_KEY!,
        process.env.NEXT_PUBLIC_GITCOIN_SCORER_ID!,
        humanityApiKey || process.env.NEXT_PUBLIC_HUMANITY_API_KEY!
      );
      
      // 2. Initialize Wallet (includes Waku + Tor + Nimbus + Nillion)
      setNetworkStatus(prev => ({ ...prev, tor: 'connecting', waku: 'connecting', nimbus: 'connecting', nillion: 'connecting' }));
      
      const newWallet = new EnhancedShadowWallet();
      await newWallet.initialize(true); // Enable Nillion MPC
      setWallet(newWallet);
      
      setNetworkStatus(prev => ({ ...prev, tor: 'connected', waku: 'connected', nimbus: 'connected', nillion: 'connected' }));
      
      // 3. Get Identity Profile
      const address = newWallet.getAddress();
      const identityProfile = await identityMgr.getIdentityProfile(address);
      setIdentity(identityProfile);
      
      // 4. Initialize Publishing Platform
      setNetworkStatus(prev => ({ ...prev, ipfs: 'connecting' }));
      const pub = new CensorshipResistantPublisher();
      await pub.initialize();
      setPublisher(pub);
      setNetworkStatus(prev => ({ ...prev, ipfs: 'connected' }));
      
      // 5. Initialize Coordination Tools
      const coord = new ResilientCoordination();
      await coord.initialize();
      setCoordination(coord);
      
      // 6. Initialize Secure Vault
      const vlt = new SecureDataVault();
      await vlt.initialize();
      setVault(vlt);
      
      setIsInitialized(true);
      console.log('✅ ResistNet initialized successfully');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }, []);
  
  // Publishing functions
  const publishArticle = useCallback(async (
    title: string,
    content: string,
    category: string
  ) => {
    if (!publisher || !identity) throw new Error('Not initialized');
    
    return await publisher.publish(
      title,
      content,
      category,
      wallet!.getAddress(),
      identity.combinedScore
    );
  }, [publisher, identity, wallet]);
  
  // Governance functions
  const createProposal = useCallback(async (
    title: string,
    description: string,
    options: string[],
    duration: number
  ) => {
    if (!coordination || !identity) throw new Error('Not initialized');
    
    return await coordination.createProposal(
      title,
      description,
      options,
      duration,
      identity.combinedScore
    );
  }, [coordination, identity]);
  
  const voteOnProposal = useCallback(async (
    proposalId: string,
    optionIndex: number
  ) => {
    if (!coordination || !identity) throw new Error('Not initialized');
    
    await coordination.votePrivately(
      proposalId,
      optionIndex,
      identity.combinedScore
    );
  }, [coordination, identity]);
  
  // Vault functions
  const uploadEvidence = useCallback(async (
    file: File,
    metadata: any,
    authorizedViewers: string[]
  ) => {
    if (!vault || !identity) throw new Error('Not initialized');
    
    return await vault.uploadEvidence(
      file,
      metadata,
      authorizedViewers,
      identity.combinedScore
    );
  }, [vault, identity]);
  
  // Emergency alert
  const sendEmergencyAlert = useCallback(async (
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    if (!coordination || !identity) throw new Error('Not initialized');
    
    await coordination.sendEmergencyAlert(
      message,
      severity,
      identity.combinedScore
    );
  }, [coordination, identity]);
  
  // Payment functions
  const sendPayment = useCallback(async (
    to: string,
    amount: string,
    message?: string
  ) => {
    if (!wallet) throw new Error('Not initialized');
    
    return await wallet.sendPayment(to, amount, message);
  }, [wallet]);
  
  const getBalance = useCallback(async () => {
    if (!wallet) return '0.0';
    return await wallet.getBalance();
  }, [wallet]);
  
  // Identity functions
  const refreshIdentity = useCallback(async () => {
    if (!wallet) return;
    
    // Re-fetch identity scores
    const identityMgr = new IdentityManager(
      process.env.NEXT_PUBLIC_GITCOIN_API_KEY!,
      process.env.NEXT_PUBLIC_GITCOIN_SCORER_ID!,
      process.env.NEXT_PUBLIC_HUMANITY_API_KEY!
    );
    
    const updated = await identityMgr.getIdentityProfile(wallet.getAddress());
    setIdentity(updated);
  }, [wallet]);
  
  return {
    // State
    wallet,
    identity,
    networkStatus,
    isInitialized,
    
    // Core functions
    initialize,
    
    // Publishing
    publishArticle,
    
    // Governance
    createProposal,
    voteOnProposal,
    sendEmergencyAlert,
    
    // Vault
    uploadEvidence,
    
    // Wallet
    sendPayment,
    getBalance,
    
    // Identity
    refreshIdentity
  };
}
