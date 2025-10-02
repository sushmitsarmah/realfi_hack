// lib/identity-manager.ts
import { GitcoinPassportService } from './gitcoin-passport';
import { HumanityProtocolService } from './humanity-protocol';

export interface IdentityProfile {
  address: string;
  gitcoinScore: number;
  humanityScore: number;
  combinedScore: number;
  isVerifiedHuman: boolean;
  reputation: number;
  permissions: {
    canPublish: boolean;
    canVote: boolean;
    canUploadEvidence: boolean;
    canReportAbuse: boolean;
    canGrantAccess: boolean;
  };
  badges: string[];
  lastVerified: number;
}

export class IdentityManager {
  private gitcoin: GitcoinPassportService;
  private humanity: HumanityProtocolService;
  
  // Permission thresholds
  private readonly THRESHOLDS = {
    PUBLISH: 15,
    VOTE: 10,
    UPLOAD_EVIDENCE: 20,
    REPORT_ABUSE: 15,
    GRANT_ACCESS: 25,
    EMERGENCY_ALERT: 30
  };
  
  constructor(
    gitcoinApiKey: string,
    gitcoinScorerId: string,
    humanityApiKey: string
  ) {
    this.gitcoin = new GitcoinPassportService(gitcoinApiKey, gitcoinScorerId);
    this.humanity = new HumanityProtocolService(humanityApiKey);
  }
  
  // Get complete identity profile
  async getIdentityProfile(address: string): Promise<IdentityProfile> {
    // Fetch from both services
    const [gitcoinData, humanityProof] = await Promise.all([
      this.gitcoin.getScore(address),
      this.humanity.verifyHuman(address)
    ]);
    
    // Calculate combined score
    const combinedScore = await this.humanity.getCombinedIdentityScore(
      address,
      gitcoinData.score
    );
    
    // Determine permissions based on scores
    const permissions = {
      canPublish: combinedScore >= this.THRESHOLDS.PUBLISH,
      canVote: combinedScore >= this.THRESHOLDS.VOTE,
      canUploadEvidence: combinedScore >= this.THRESHOLDS.UPLOAD_EVIDENCE,
      canReportAbuse: combinedScore >= this.THRESHOLDS.REPORT_ABUSE,
      canGrantAccess: combinedScore >= this.THRESHOLDS.GRANT_ACCESS
    };
    
    // Assign badges
    const badges = this.calculateBadges(
      gitcoinData.score,
      humanityProof.score,
      gitcoinData.stamps
    );
    
    return {
      address,
      gitcoinScore: gitcoinData.score,
      humanityScore: humanityProof.score,
      combinedScore,
      isVerifiedHuman: humanityProof.isHuman,
      reputation: combinedScore,
      permissions,
      badges,
      lastVerified: Date.now()
    };
  }
  
  // Verify action permission
  async canPerformAction(
    address: string,
    action: keyof typeof this.THRESHOLDS
  ): Promise<boolean> {
    const profile = await this.getIdentityProfile(address);
    const threshold = this.THRESHOLDS[action];
    
    return profile.combinedScore >= threshold;
  }
  
  // Verify user is human (prevents bots)
  async verifyNotBot(address: string): Promise<boolean> {
    const humanityProof = await this.humanity.verifyHuman(address);
    return humanityProof.isHuman;
  }
  
  // Calculate reputation badges
  private calculateBadges(
    gitcoinScore: number,
    humanityScore: number,
    stamps: any[]
  ): string[] {
    const badges: string[] = [];
    
    if (humanityScore >= 80) badges.push('Verified Human');
    if (gitcoinScore >= 25) badges.push('Trusted Contributor');
    if (gitcoinScore >= 40) badges.push('Power User');
    if (stamps.length >= 10) badges.push('Well Connected');
    if (stamps.some(s => s.provider === 'Github')) badges.push('Developer');
    if (stamps.some(s => s.provider === 'Twitter')) badges.push('Social Presence');
    
    return badges;
  }
  
  // Get verification suggestions
  async getVerificationSuggestions(address: string): Promise<string[]> {
    const gitcoinStamps = await this.gitcoin.getStamps(address);
    const humanityProof = await this.humanity.verifyHuman(address);
    
    const suggestions: string[] = [];
    
    if (!humanityProof.isHuman) {
      suggestions.push('Complete Humanity Protocol verification');
    }
    
    if (gitcoinStamps.length < 5) {
      suggestions.push('Add more Gitcoin Passport stamps');
    }
    
    const categories = this.gitcoin.getStampCategories(gitcoinStamps);
    if (!categories.includes('Github')) {
      suggestions.push('Connect your Github account');
    }
    if (!categories.includes('Twitter')) {
      suggestions.push('Connect your Twitter account');
    }
    
    return suggestions;
  }
  
  // Anti-Sybil check (combines both systems)
  async isSybilResistant(addresses: string[]): Promise<boolean> {
    const profiles = await Promise.all(
      addresses.map(addr => this.getIdentityProfile(addr))
    );
    
    // Check if all addresses are verified humans
    const allHuman = profiles.every(p => p.isVerifiedHuman);
    
    // Check if scores are diverse (not all the same)
    const scoreVariance = this.calculateVariance(
      profiles.map(p => p.combinedScore)
    );
    
    // Sybil-resistant if all human AND diverse scores
    return allHuman && scoreVariance > 10;
  }
  
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }
}
