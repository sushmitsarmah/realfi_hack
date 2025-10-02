// lib/resilient-coordination.ts
import { WakuMessenger } from './waku-messenger';
import { NillionClient, SecretInteger } from '@nillion/client-ts';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerPassportScore: number;
  options: string[];
  deadline: number;
  votingResults?: VotingResults;
}

export interface VotingResults {
  totalVotes: number;
  results: Map<string, number>;
  privacy: 'public' | 'private';
}

export class ResilientCoordination {
  private waku: WakuMessenger;
  private nillion: NillionClient;
  private contentTopic = '/resistnet/1/coordination/proto';
  
  async initialize() {
    this.waku = new WakuMessenger();
    await this.waku.initialize();
    
    this.nillion = await NillionClient.create({
      network: 'testnet'
    });
  }
  
  // Create proposal (works offline, syncs later)
  async createProposal(
    title: string,
    description: string,
    options: string[],
    duration: number,  // hours
    requirePassportScore: number = 15
  ): Promise<Proposal> {
    
    const proposer = await this.getCurrentUser();
    const passportScore = await this.getPassportScore(proposer);
    
    if (passportScore < requirePassportScore) {
      throw new Error('Insufficient Passport score to create proposal');
    }
    
    const proposal: Proposal = {
      id: `prop_${Date.now()}`,
      title,
      description,
      proposer,
      proposerPassportScore: passportScore,
      options,
      deadline: Date.now() + (duration * 3600 * 1000)
    };
    
    // Distribute via Waku (works in mesh networks)
    await this.waku.sendMessage(this.contentTopic, {
      type: 'proposal',
      data: proposal
    });
    
    // Store encrypted backup
    await this.storeProposalBackup(proposal);
    
    return proposal;
  }
  
  // Vote with privacy (Nillion blind computation)
  async votePrivately(
    proposalId: string,
    optionIndex: number,
    voterPassportScore: number
  ) {
    
    if (voterPassportScore < 15) {
      throw new Error('Insufficient Passport score to vote');
    }
    
    // Store vote as secret on Nillion
    const voteStoreId = await this.nillion.storeSecrets({
      secrets: {
        'vote_option': new SecretInteger(BigInt(optionIndex)),
        'voter_score': new SecretInteger(BigInt(voterPassportScore))
      },
      permissions: {
        compute: ['vote_counter'],  // Only counting program can access
        retrieve: []  // Nobody can see individual votes
      }
    });
    
    // Announce vote cast (without revealing choice)
    await this.waku.sendMessage(this.contentTopic, {
      type: 'vote-cast',
      proposalId,
      voteStoreId,
      voterScore: voterPassportScore,
      timestamp: Date.now()
    });
    
    console.log(`🗳️ Private vote cast for proposal: ${proposalId}`);
  }
  
  // Tally votes using Nillion (preserves privacy)
  async tallyVotes(proposalId: string): Promise<VotingResults> {
    // Collect all vote store IDs
    const voteStoreIds = await this.collectVoteStoreIds(proposalId);
    
    // Use Nillion to compute totals WITHOUT revealing individual votes
    const result = await this.nillion.compute({
      program: 'tally_votes',
      bindings: voteStoreIds.reduce((acc, id, idx) => {
        acc[`vote_${idx}`] = id;
        return acc;
      }, {})
    });
    
    return {
      totalVotes: result.total_votes,
      results: new Map(Object.entries(result.option_counts)),
      privacy: 'private'
    };
  }
  
  // Schedule meeting (offline-first)
  async scheduleMeeting(
    title: string,
    description: string,
    proposedTimes: number[],  // timestamps
    participants: string[]
  ) {
    
    const meeting = {
      id: `meet_${Date.now()}`,
      title,
      description,
      proposedTimes,
      participants,
      responses: new Map<string, number>()  // participant -> chosen time
    };
    
    // Distribute via Waku (participants get notification even offline)
    await this.waku.sendMessage(this.contentTopic, {
      type: 'meeting-invitation',
      data: meeting
    });
    
    // Store in local cache (works offline)
    await this.cacheLocally('meetings', meeting);
    
    return meeting;
  }
  
  // Respond to meeting (works offline, syncs later)
  async respondToMeeting(
    meetingId: string,
    chosenTimeIndex: number
  ) {
    const response = {
      meetingId,
      participant: await this.getCurrentUser(),
      chosenTime: chosenTimeIndex,
      timestamp: Date.now()
    };
    
    // Queue for sending (works offline)
    await this.queueForSending(response);
    
    // Send when online
    if (await this.isOnline()) {
      await this.waku.sendMessage(this.contentTopic, {
        type: 'meeting-response',
        data: response
      });
    }
  }
  
  // Emergency alert (high priority, multi-channel)
  async sendEmergencyAlert(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    passportScore: number
  ) {
    
    if (passportScore < 25) {
      throw new Error('High Passport score required for alerts');
    }
    
    const alert = {
      id: `alert_${Date.now()}`,
      message,
      severity,
      sender: await this.getCurrentUser(),
      senderScore: passportScore,
      timestamp: Date.now()
    };
    
    // Broadcast via multiple channels for resilience
    await Promise.all([
      this.waku.sendMessage(this.contentTopic, {
        type: 'emergency-alert',
        data: alert
      }),
      this.storeOnIPFS(alert),
      this.broadcastViaTor(alert)
    ]);
    
    console.log(`🚨 Emergency alert sent: ${severity}`);
  }
  
  // Task coordination (offline-capable)
  async assignTask(
    title: string,
    assignee: string,
    deadline: number,
    priority: number
  ) {
    const task = {
      id: `task_${Date.now()}`,
      title,
      assignee,
      deadline,
      priority,
      status: 'pending',
      createdBy: await this.getCurrentUser()
    };
    
    await this.waku.sendMessage(this.contentTopic, {
      type: 'task-assignment',
      data: task
    });
    
    return task;
  }
  
  // Helper methods
  private async storeProposalBackup(proposal: Proposal) {
    await this.nillion.storeSecrets({
      secrets: {
        [`proposal_${proposal.id}`]: new SecretBlob(
          Buffer.from(JSON.stringify(proposal))
        )
      }
    });
  }
  
  private async collectVoteStoreIds(proposalId: string): Promise<string[]> {
    const messages = await this.waku.getMessageHistory(this.contentTopic, 1000);
    return messages
      .filter(msg => msg.type === 'vote-cast' && msg.proposalId === proposalId)
      .map(msg => msg.voteStoreId);
  }
  
  private async cacheLocally(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  private async queueForSending(data: any) {
    const queue = JSON.parse(localStorage.getItem('send_queue') || '[]');
    queue.push(data);
    localStorage.setItem('send_queue', JSON.stringify(queue));
  }
  
  private async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }
  
  private async getCurrentUser(): Promise<string> {
    // Get from wallet context
    return '0x...';
  }
  
  private async getPassportScore(address: string): Promise<number> {
    // Implement Gitcoin Passport integration
    return 0;
  }
  
  private async storeOnIPFS(data: any): Promise<string> {
    // Implement IPFS upload
    return 'QmHash...';
  }
  
  private async broadcastViaTor(data: any) {
    // Implement Tor broadcast
  }
}
