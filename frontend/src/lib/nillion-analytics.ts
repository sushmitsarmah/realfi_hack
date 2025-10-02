// lib/nillion-analytics.ts
import { NillionClient, SecretInteger } from '@nillion/client-ts';

export class PrivateAnalytics {
  private client: NillionClient;
  private storeIds: Map<string, string> = new Map();
  
  // Store transaction amounts privately
  async recordTransaction(amount: string, category: string) {
    const amountInt = new SecretInteger(
      BigInt(parseFloat(amount) * 1e18)  // Convert to wei
    );
    
    const storeId = await this.client.storeSecrets({
      secrets: {
        [`tx_amount_${Date.now()}`]: amountInt
      },
      permissions: {
        compute: [await this.client.getUserId()]
      }
    });
    
    this.storeIds.set(category, storeId);
  }
  
  // Calculate total spending WITHOUT revealing individual transactions
  async getTotalSpent(category: string): Promise<string> {
    const storeIds = Array.from(this.storeIds.entries())
      .filter(([cat]) => cat === category)
      .map(([_, id]) => id);
    
    // Run sum computation on Nillion
    const result = await this.client.compute({
      program: 'sum_amounts',
      bindings: storeIds.reduce((acc, id, idx) => {
        acc[`amount_${idx}`] = id;
        return acc;
      }, {})
    });
    
    return result.total.toString();
  }
  
  // Get average transaction WITHOUT revealing amounts
  async getAverageTransaction(): Promise<string> {
    const result = await this.client.compute({
      program: 'average_calculator',
      bindings: Object.fromEntries(this.storeIds)
    });
    
    return result.average.toString();
  }
  
  // Budget alerts WITHOUT revealing spending
  async checkBudget(monthlyLimit: string): Promise<boolean> {
    const limit = new SecretInteger(
      BigInt(parseFloat(monthlyLimit) * 1e18)
    );
    
    const result = await this.client.compute({
      program: 'budget_checker',
      inputs: { limit },
      bindings: Object.fromEntries(this.storeIds)
    });
    
    return result.over_budget;  // Just true/false, not amounts
  }
}
