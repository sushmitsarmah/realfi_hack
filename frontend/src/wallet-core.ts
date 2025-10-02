// wallet-core.ts
import { ethers } from 'ethers';
import { TorProvider } from './tor-provider';
import { WakuMessenger } from './waku-messaging';

export class PrivacyWallet {
  private wallet: ethers.Wallet;
  private provider: TorProvider;
  private messenger: WakuMessenger;
  
  constructor(privateKey?: string) {
    // Create or import wallet
    this.wallet = privateKey 
      ? new ethers.Wallet(privateKey)
      : ethers.Wallet.createRandom();
    
    this.provider = new TorProvider('http://nimbus-node.onion:8545');
    this.wallet = this.wallet.connect(this.provider);
    
    this.messenger = new WakuMessenger();
  }
  
  async initialize() {
    await this.messenger.initialize();
    
    // Subscribe to payment requests
    await this.messenger.subscribeToMessages(async (msg: any) => {
      if (msg.type === 'payment-request') {
        await this.handlePaymentRequest(msg);
      }
    });
  }
  
  // Get wallet info
  getAddress(): string {
    return this.wallet.address;
  }
  
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
  
  // Send ETH with privacy
  async sendTransaction(to: string, amount: string, notifyViaWaku: boolean = true) {
    const tx = await this.wallet.sendTransaction({
      to: to,
      value: ethers.parseEther(amount)
    });
    
    // Notify recipient via Waku
    if (notifyViaWaku) {
      await this.messenger.sendMessage(to, 'Payment sent', {
        txHash: tx.hash,
        amount: amount,
        from: this.wallet.address
      });
    }
    
    return tx;
  }
  
  // Request payment via Waku
  async requestPayment(from: string, amount: string, reason: string) {
    await this.messenger.sendMessage(from, reason, {
      type: 'payment-request',
      amount: amount,
      to: this.wallet.address
    });
  }
  
  private async handlePaymentRequest(msg: any) {
    // Show UI notification for payment request
    console.log(`Payment request: ${msg.amount} ETH to ${msg.to}`);
  }
}
