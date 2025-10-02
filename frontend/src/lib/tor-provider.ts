// lib/tor-provider.ts
import { ethers } from 'ethers';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class TorRPCProvider extends ethers.JsonRpcProvider {
  private torProxyUrl: string;
  private onionRpcUrl: string;
  private agent: any;
  
  constructor(
    onionRpcUrl: string = 'http://127.0.0.1:8545',
    torProxy: string = 'socks5://127.0.0.1:9150'
  ) {
    const agent = new SocksProxyAgent(torProxy);
    
    super(onionRpcUrl, undefined, {
      fetchFunc: async (url: string, options: any) => {
        return fetch(url, {
          ...options,
          agent: agent,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json'
          }
        });
      }
    });
    
    this.torProxyUrl = torProxy;
    this.onionRpcUrl = onionRpcUrl;
    this.agent = agent;
  }
  
  // Check Tor connection status
  async checkTorConnection(): Promise<boolean> {
    try {
      await this.getBlockNumber();
      return true;
    } catch (error) {
      console.error('Tor connection failed:', error);
      return false;
    }
  }
  
  // Get circuit info (if using control port)
  async getTorCircuitInfo(): Promise<any> {
    // This would require tor-control library
    // For now, return mock data
    return {
      circuitId: 'ABCD1234',
      path: ['GuardNode', 'MiddleNode', 'ExitNode'],
      status: 'BUILT'
    };
  }
}
