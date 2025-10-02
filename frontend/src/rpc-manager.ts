// rpc-manager.ts
import { TorProvider } from './tor-provider';

export class PrivateRPCManager {
  private providers: TorProvider[] = [];
  
  constructor() {
    // Add multiple private RPC endpoints
    this.providers.push(
      new TorProvider('http://nimbus1.onion:8545'),
      new TorProvider('http://nimbus2.onion:8545'),
      new TorProvider('http://127.0.0.1:8545') // Local Nimbus
    );
  }
  
  // Fallback mechanism
  async getProvider(): Promise<TorProvider> {
    for (const provider of this.providers) {
      try {
        await provider.getBlockNumber(); // Test connection
        return provider;
      } catch (e) {
        continue;
      }
    }
    throw new Error('No available RPC providers');
  }
}
