// lib/wallet-core.ts
import { ethers } from 'ethers';
import { createLightNode, waitForRemotePeer } from '@waku/sdk';
import { Protocols } from '@waku/interfaces';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class ShadowWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private wakuNode: any;
  private torAgent: any;
  
  // Initialize with all 4 technologies
  async initialize(privateKey?: string) {
    // 1. Setup Arti (Tor) SOCKS5 proxy
    this.torAgent = new SocksProxyAgent('socks5://127.0.0.1:9150');
    
    // 2. Setup Nimbus RPC provider through Tor
    this.provider = new ethers.JsonRpcProvider(
      'http://your-nimbus.onion:8545',
      undefined,
      {
        fetchFunc: async (url: string, options: any) => {
          return fetch(url, { ...options, agent: this.torAgent });
        }
      }
    );
    
    // 3. Create/restore wallet
    this.wallet = privateKey 
      ? new ethers.Wallet(privateKey, this.provider)
      : ethers.Wallet.createRandom().connect(this.provider);
    
    // 4. Initialize Waku for messaging
    this.wakuNode = await createLightNode({ defaultBootstrap: true });
    await this.wakuNode.start();
    await waitForRemotePeer(this.wakuNode, [
      Protocols.LightPush,
      Protocols.Filter
    ]);
    
    // Subscribe to messages
    await this.subscribeToMessages();
  }
  
  // Send payment with Waku notification
  async sendPayment(to: string, amount: string, message?: string) {
    try {
      // 1. Send transaction through Nimbus (via Tor)
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
      
      // 2. Notify recipient via Waku
      await this.sendWakuMessage(to, {
        type: 'payment',
        txHash: tx.hash,
        amount,
        from: this.wallet.address,
        message: message || 'Payment sent'
      });
      
      // return tx

      return tx;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }
  
  // Send message via Waku
  private async sendWakuMessage(recipient: string, payload: any) {
    const contentTopic = `/shadow-wallet/1/${recipient}/proto`;
    
    // Encrypt payload with recipient's public key
    const encrypted = await this.encryptForRecipient(payload, recipient);
    
    await this.wakuNode.lightPush.send({
      contentTopic,
      payload: encrypted
    });
  }
  
  // Subscribe to incoming messages
  private async subscribeToMessages() {
    const myTopic = `/shadow-wallet/1/${this.wallet.address}/proto`;
    
    await this.wakuNode.filter.subscribe(
      [{ contentTopic: myTopic }],
      async (message: any) => {
        const decrypted = await this.decryptMessage(message.payload);
        this.handleIncomingMessage(decrypted);
      }
    );
  }
  
  // Handle different message types
  private handleIncomingMessage(message: any) {
    switch (message.type) {
      case 'payment':
        this.onPaymentReceived(message);
        break;
      case 'payment-request':
        this.onPaymentRequest(message);
        break;
      case 'chat':
        this.onChatMessage(message);
        break;
    }
  }
  
  // Request payment from another user
  async requestPayment(from: string, amount: string, reason: string) {
    await this.sendWakuMessage(from, {
      type: 'payment-request',
      amount,
      to: this.wallet.address,
      reason,
      timestamp: Date.now()
    });
  }
  
  // Send chat message
  async sendChatMessage(to: string, message: string) {
    await this.sendWakuMessage(to, {
      type: 'chat',
      message,
      from: this.wallet.address,
      timestamp: Date.now()
    });
  }
  
  // Get balance through Tor
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
  
  // Get transaction history through Tor
  async getTransactionHistory(count: number = 10) {
    // This would query your Nimbus node or indexer
    const blockNumber = await this.provider.getBlockNumber();
    // Implement pagination logic
    return [];
  }
  
  // Encryption helpers (using wallet key for simplicity)
  private async encryptForRecipient(data: any, recipient: string): Promise<Uint8Array> {
    // In production, use proper ECIES encryption
    const dataString = JSON.stringify(data);
    return new TextEncoder().encode(dataString);
  }
  
  private async decryptMessage(payload: Uint8Array): Promise<any> {
    // In production, use proper ECIES decryption
    const dataString = new TextDecoder().decode(payload);
    return JSON.parse(dataString);
  }
  
  // Event handlers (connect to UI)
  private onPaymentReceived(message: any) {
    console.log('Payment received:', message);
    // Emit event to UI
  }
  
  private onPaymentRequest(message: any) {
    console.log('Payment request:', message);
    // Show notification in UI
  }
  
  private onChatMessage(message: any) {
    console.log('Chat message:', message);
    // Update chat UI
  }
  
  // Utility functions
  getAddress(): string {
    return this.wallet.address;
  }
  
  getPrivateKey(): string {
    return this.wallet.privateKey;
  }
  
  getMnemonic(): string | null {
    return this.wallet.mnemonic?.phrase || null;
  }
}
