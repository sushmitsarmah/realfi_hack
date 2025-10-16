// lib/human-passport.ts
// Now uses backend API to avoid Node.js polyfill issues
import axios from 'axios';

export interface PassportStamp {
  provider: string;
  credential?: any;
  verified?: boolean;
}

export interface PassportScore {
  address: string;
  score: number;
  stamps: PassportStamp[];
  lastUpdated: number;
  passing_score?: boolean;
  threshold?: number;
}

export class humanPassportService {
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  constructor(apiKey?: string, scorerId?: string) {
    // API key and scorer ID are now handled by backend
    // These params kept for backwards compatibility but unused
  }

  // Get Passport score for an address
  async getScore(address: string): Promise<PassportScore> {
    try {
      const response = await axios.get(
        `${this.backendUrl}/api/passport/score/${address}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch score');
      }

      const data = response.data.data;

      return {
        address: data.address,
        score: parseFloat(data.score) || 0,
        stamps: [],
        lastUpdated: Date.now(),
        passing_score: data.passing_score,
        threshold: parseFloat(data.threshold) || 0
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
        `${this.backendUrl}/api/passport/stamps/${address}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch stamps');
      }

      const stamps = response.data.data.stamps || {};

      // Convert stamp_scores object to array
      return Object.entries(stamps).map(([provider, score]) => ({
        provider,
        verified: true,
        credential: { score }
      }));
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
