// lib/gitcoin-passport.ts
import axios from 'axios';

export interface PassportStamp {
  provider: string;
  credential: any;
  verified: boolean;
}

export interface PassportScore {
  address: string;
  score: number;
  stamps: PassportStamp[];
  lastUpdated: number;
}

export class humanPassportService {
  private apiKey: string;
  private apiUrl = import.meta.env.VITE_HUMAN_BASE_URL || 'https://api.passport.xyz';
  private scorerId: string;
  
  constructor(apiKey: string, scorerId: string) {
    this.apiKey = apiKey;
    this.scorerId = scorerId;
  }
  
  // Get Passport score for an address
  async getScore(address: string): Promise<PassportScore> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/registry/score/${this.scorerId}/${address}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          }
        }
      );
      
      return {
        address,
        score: response.data.score,
        stamps: response.data.stamps || [],
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch Passport score:', error);
      return {
        address,
        score: 0,
        stamps: [],
        lastUpdated: Date.now()
      };
    }
  }
  
  // Get all stamps for an address
  async getStamps(address: string): Promise<PassportStamp[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/registry/stamps/${address}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          }
        }
      );
      
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to fetch stamps:', error);
      return [];
    }
  }
  
  // Check if address meets minimum score
  async meetsThreshold(address: string, threshold: number): Promise<boolean> {
    const score = await this.getScore(address);
    return score.score >= threshold;
  }
  
  // Get stamp categories
  getStampCategories(stamps: PassportStamp[]): string[] {
    return [...new Set(stamps.map(s => s.provider))];
  }
  
  // Verify specific stamp type
  hasStamp(stamps: PassportStamp[], provider: string): boolean {
    return stamps.some(s => s.provider === provider && s.verified);
  }
}
