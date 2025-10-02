// lib/nillion-multisig.ts
import { NillionClient } from '@nillion/client-ts';

export class PrivateMultiSig {
  private client: NillionClient;
  
  // Create shared wallet where participants don't know each other
  async createSharedWallet(
    participants: string[],
    threshold: number,
    initialFunds: string
  ) {
    // Store wallet key as MPC secret
    const wallet = ethers.Wallet.createRandom();
    
    const storeId = await this.client.storeSecrets({
      secrets: {
        'shared_wallet_key': new SecretBlob(
          Buffer.from(wallet.privateKey.slice(2), 'hex')
        )
      },
      permissions: {
        compute: participants,  // All can compute
        retrieve: []  // Nobody can retrieve raw key
      },
      threshold: threshold  // Need N of M to sign
    });
    
    return {
      walletAddress: wallet.address,
      storeId: storeId
    };
  }
  
  // Propose transaction (encrypted proposal)
  async proposeTransaction(
    storeId: string,
    to: string,
    amount: string,
    reason: string
  ) {
    const proposalId = await this.client.storeSecrets({
      secrets: {
        'proposal_to': new SecretBlob(Buffer.from(to)),
        'proposal_amount': new SecretInteger(BigInt(amount)),
        'proposal_reason': new SecretBlob(Buffer.from(reason))
      },
      permissions: {
        compute: []  // Will be set by wallet permissions
      }
    });
    
    return proposalId;
  }
  
  // Sign transaction when threshold reached
  async executeTransaction(storeId: string, proposalId: string) {
    // Nillion will only execute if threshold signatures reached
    const result = await this.client.compute({
      program: 'multisig_execute',
      bindings: {
        'wallet_key': storeId,
        'proposal': proposalId
      }
    });
    
    return result.signed_tx;
  }
  
  // Anonymous voting on proposals
  async voteOnProposal(proposalId: string, approve: boolean) {
    await this.client.compute({
      program: 'anonymous_vote',
      bindings: {
        'proposal': proposalId
      },
      inputs: {
        'vote': new SecretInteger(approve ? 1n : 0n)
      }
    });
  }
}
