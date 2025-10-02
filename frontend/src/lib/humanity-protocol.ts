// lib/humanity-protocol.ts
import axios from 'axios';

export interface HumanityProof {
  address: string;
  isHuman: boolean;
  score: number;
  verificationMethod: 'biometric' | 'social' | 'behavioral' | 'hybrid';
  timestamp: number;
  expiresAt: number;
  proofHash: string;
}

export class HumanityProtocolService {
  private apiUrl = 'https://api.humanity.tech';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Verify if address is a verified human
  async verifyHuman(address: string): Promise<HumanityProof> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/verify/${address}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return {
        address,
        isHuman: response.data.isHuman,
        score: response.data.humanityScore,
        verificationMethod: response.data.method,
        timestamp: Date.now(),
        expiresAt: response.data.expiresAt,
        proofHash: response.data.proofHash
      };
    } catch (error) {
      console.error('Humanity verification failed:', error);
      return {
        address,
        isHuman: false,
        score: 0,
        verificationMethod: 'hybrid',
        timestamp: Date.now(),
        expiresAt: 0,
        proofHash: ''
      };
    }
  }
  
  // Get detailed humanity score breakdown
  async getHumanityScore(address: string): Promise<{
    total: number;
    biometric: number;
    social: number;
    behavioral: number;
    reputation: number;
  }> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/score/${address}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.breakdown;
    } catch (error) {
      return {
        total: 0,
        biometric: 0,
        social: 0,
        behavioral: 0,
        reputation: 0
      };
    }
  }
  
  // Request new verification (for expired proofs)
  async requestVerification(address: string, method: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/verify/request`,
        {
          address,
          method
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.verificationUrl;
    } catch (error) {
      throw new Error('Failed to request verification');
    }
  }
  
  // Check if proof is still valid
  isProofValid(proof: HumanityProof): boolean {
    return proof.isHuman && proof.expiresAt > Date.now();
  }
  
  // Combine with Gitcoin Passport for stronger identity
  async getCombinedIdentityScore(
    address: string,
    gitcoinScore: number
  ): Promise<number> {
    const humanityProof = await this.verifyHuman(address);
    
    // Weighted combination: 60% Humanity + 40% Gitcoin
    const combinedScore = (humanityProof.score * 0.6) + (gitcoinScore * 0.4);
    
    return Math.round(combinedScore);
  }
}
