// lib/nillion-channels.ts
import { NillionClient, SecretInteger } from '@nillion/client-ts';

export class PrivatePaymentChannel {
  private client: NillionClient;
  
  // Open payment channel with encrypted balance
  async openChannel(
    counterparty: string,
    initialDeposit: string
  ) {
    const channelId = `channel_${Date.now()}`;
    
    // Store balances as secrets
    const storeId = await this.client.storeSecrets({
      secrets: {
        'balance_alice': new SecretInteger(
          BigInt(parseFloat(initialDeposit) * 1e18)
        ),
        'balance_bob': new SecretInteger(0n)
      },
      permissions: {
        compute: [await this.client.getUserId(), counterparty],
        update: [await this.client.getUserId(), counterparty]
      }
    });
    
    return { channelId, storeId };
  }
  
  // Send payment within channel (off-chain, encrypted)
  async sendPayment(storeId: string, amount: string) {
    // Update balances using blind computation
    await this.client.compute({
      program: 'update_channel_balance',
      bindings: {
        'balances': storeId
      },
      inputs: {
        'amount': new SecretInteger(
          BigInt(parseFloat(amount) * 1e18)
        )
      }
    });
  }
  
  // Close channel and settle on-chain
  async closeChannel(storeId: string) {
    // Compute final balances without revealing intermediate state
    const result = await this.client.compute({
      program: 'finalize_balances',
      bindings: {
        'balances': storeId
      }
    });
    
    return {
      aliceBalance: result.balance_alice.toString(),
      bobBalance: result.balance_bob.toString()
    };
  }
  
  // Get current balance WITHOUT revealing it
  async checkSufficientBalance(
    storeId: string,
    requiredAmount: string
  ): Promise<boolean> {
    const result = await this.client.compute({
      program: 'check_balance',
      bindings: { 'balances': storeId },
      inputs: {
        'required': new SecretInteger(
          BigInt(parseFloat(requiredAmount) * 1e18)
        )
      }
    });
    
    return result.sufficient;  // Just true/false
  }
}
