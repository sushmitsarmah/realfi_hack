// tor-provider.ts
import { ethers } from 'ethers';
import { SocksProxyAgent } from 'socks-proxy-agent';
import https from 'https';

export class TorProvider extends ethers.JsonRpcProvider {
  constructor(rpcUrl: string, torProxy: string = 'socks5://127.0.0.1:9150') {
    const agent = new SocksProxyAgent(torProxy);
    
    // Custom fetch function that routes through Tor
    const fetchFunc = async (url: string, options: any) => {
      return fetch(url, {
        ...options,
        agent: agent
      });
    };
    
    super(rpcUrl, undefined, { fetchFunc });
  }
}

// Usage
const provider = new TorProvider('http://your-nimbus-onion.onion:8545');
