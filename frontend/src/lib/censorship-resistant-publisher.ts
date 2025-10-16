// lib/censorship-resistant-publisher.ts
import { WakuMessenger } from './waku-messenger';
import { createEncoder, createDecoder, type IRoutingInfo } from '@waku/sdk';
import { JsonRpcProvider } from 'ethers';

export interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
  ipfsHash: string;
  passportScore?: number;
  signatures: string[];  // Co-authors/witnesses
  category: 'article' | 'evidence' | 'report' | 'investigation';
}

export class CensorshipResistantPublisher {
  private waku!: WakuMessenger;
  private ipfs: any = null;
  private baseContentTopic = '/resistnet/1/publications';
  private pubsubTopic = '/waku/2/default-waku/proto';
  private ipfsUrl: string;
  private onionAddress: string | null = null;
  private nimbusProvider: JsonRpcProvider | null = null;

  constructor(
    ipfsUrl: string = 'http://localhost:5001',
    onionAddress?: string,
    nimbusRpcUrl?: string
  ) {
    this.ipfsUrl = ipfsUrl;
    this.onionAddress = onionAddress || null;

    // Initialize Nimbus RPC provider if URL provided
    if (nimbusRpcUrl) {
      try {
        this.nimbusProvider = new JsonRpcProvider(nimbusRpcUrl);
        console.log('🔗 Nimbus RPC provider initialized');
      } catch (error) {
        console.error('Failed to initialize Nimbus provider:', error);
      }
    }
  }

  async initialize() {
    console.log('🔌 Initializing publisher...');

    // Initialize Waku
    this.waku = new WakuMessenger();
    await this.waku.initialize();
    console.log('✅ Waku initialized');

    // Check if using Pinata or local IPFS
    const pinataApiUrl = import.meta.env.VITE_PINATA_API_URL;
    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;

    if (pinataApiUrl && pinataApiKey) {
      // Using Pinata
      this.ipfs = {
        isPinata: true,
        apiUrl: pinataApiUrl,
        apiKey: pinataApiKey,
      };
      console.log('✅ Pinata API configured');
    } else {
      // Connect to local IPFS
      try {
        const { create } = await import('kubo-rpc-client');
        this.ipfs = create({ url: this.ipfsUrl });

        // Test IPFS connection
        const version = await this.ipfs.version();
        console.log('✅ IPFS connected:', version.version);
      } catch (error) {
        console.error('⚠️ IPFS connection failed:', error);
        console.log('Publishing will work without IPFS storage');
      }
    }
  }
  
  // Publish content across multiple resilient layers
  async publish(
    title: string,
    content: string,
    category: Publication['category'],
    author: string,
    passportScore?: number
  ): Promise<Publication> {
    console.log('📤 Publishing:', title);

    let ipfsHash = '';

    // Step 1: Store to IPFS if available
    if (this.ipfs) {
      try {
        console.log('📦 Uploading to IPFS...');

        // Check if using Pinata
        if (this.ipfs.isPinata) {
          // Upload to Pinata
          const formData = new FormData();
          const blob = new Blob([content], { type: 'text/plain' });
          formData.append('file', blob, 'content.txt');

          const pinataMetadata = JSON.stringify({
            name: title,
            keyvalues: {
              category: category,
              author: author,
            },
          });
          formData.append('pinataMetadata', pinataMetadata);

          const response = await fetch(`${this.ipfs.apiUrl}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.ipfs.apiKey}`,
            },
            body: formData,
          });

          const result = await response.json();
          ipfsHash = result.IpfsHash;
          console.log(`✅ Pinata uploaded: ${ipfsHash}`);
        } else {
          // Upload to local IPFS
          const result = await this.ipfs.add(content);
          ipfsHash = result.cid.toString();
          console.log(`✅ IPFS uploaded: ${ipfsHash}`);
        }
      } catch (error) {
        console.error('⚠️ IPFS upload failed:', error);
        ipfsHash = `fallback_${Date.now()}`;
      }
    } else {
      ipfsHash = `local_${Date.now()}`;
    }

    // Step 2: Create publication metadata
    const publication: Publication = {
      id: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      author,
      timestamp: Date.now(),
      ipfsHash,
      passportScore,
      signatures: [],
      category
    };

    // Step 3: Distribute via Waku (P2P, unstoppable)
    try {
      console.log('📡 Broadcasting to Waku network...');
      const contentTopic = `${this.baseContentTopic}/proto`;
      const routingInfo: IRoutingInfo = {
        clusterId: 1,
        shardId: 1,
        pubsubTopic: this.pubsubTopic
      };

      const encoder = createEncoder({
        contentTopic,
        routingInfo
      });

      const payload = new TextEncoder().encode(JSON.stringify({
        type: 'publication',
        data: publication
      }));

      await this.waku['node'].lightPush.send(encoder, { payload });
      console.log('✅ Broadcasted to Waku');
    } catch (error) {
      console.error('⚠️ Waku broadcast failed:', error);
    }

    console.log(`✅ Published: ${title}`);
    if (ipfsHash.startsWith('Qm') || ipfsHash.startsWith('bafy')) {
      console.log(`📦 IPFS: https://ipfs.io/ipfs/${ipfsHash}`);
      if (this.onionAddress) {
        console.log(`🧅 Tor: http://${this.onionAddress}/ipfs/${ipfsHash}`);
      } else {
        console.log(`🧅 Tor: Configure Arti onion service to get onion address`);
      }
    }

    return publication;
  }
  
  // Subscribe to all publications on the network
  async subscribeToPublications(callback: (pub: Publication) => void): Promise<boolean> {
    try {
      console.log('🔔 Subscribing to publication feed...');
      const contentTopic = `${this.baseContentTopic}/proto`;
      const routingInfo: IRoutingInfo = {
        clusterId: 1,
        shardId: 1,
        pubsubTopic: this.pubsubTopic
      };

      const decoder = createDecoder(contentTopic, routingInfo);

      const success = await this.waku['node'].filter.subscribe([decoder], async (wakuMessage: any) => {
        try {
          if (!wakuMessage.payload) return;
          const json = new TextDecoder().decode(wakuMessage.payload);
          const message = JSON.parse(json);

          if (message.type === 'publication' && message.data) {
            console.log('📥 Received publication:', message.data.title);
            callback(message.data);
          }
        } catch (error) {
          console.error('Failed to decode publication:', error);
        }
      });

      if (success) {
        console.log('✅ Subscribed to publication feed');
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to subscribe:', error);
      return false;
    }
  }

  // Subscribe to publications from a specific author
  async subscribeToAuthor(authorAddress: string, callback: (pub: Publication) => void): Promise<boolean> {
    return this.subscribeToPublications((pub) => {
      if (pub.author.toLowerCase() === authorAddress.toLowerCase()) {
        callback(pub);
      }
    });
  }

  // Query historical publications from Waku Store
  async getPublications(limit: number = 50): Promise<Publication[]> {
    try {
      console.log('🔍 Querying publication history...');
      const contentTopic = `${this.baseContentTopic}/proto`;
      const routingInfo: IRoutingInfo = {
        clusterId: 1,
        shardId: 1,
        pubsubTopic: this.pubsubTopic
      };

      const decoder = createDecoder(contentTopic, routingInfo);
      const publications: Publication[] = [];

      for await (const messagesPromises of this.waku['node'].store.queryGenerator([decoder])) {
        const results = await Promise.all(messagesPromises);

        for (const wakuMessage of results) {
          if (wakuMessage?.payload) {
            try {
              const json = new TextDecoder().decode(wakuMessage.payload);
              const message = JSON.parse(json);

              if (message.type === 'publication' && message.data) {
                publications.push(message.data);
              }

              if (publications.length >= limit) break;
            } catch (error) {
              console.error('Failed to decode message:', error);
            }
          }
        }

        if (publications.length >= limit) break;
      }

      console.log(`✅ Found ${publications.length} publications`);
      return publications;
    } catch (error) {
      console.error('❌ Failed to query publications:', error);
      return [];
    }
  }

  // Check if publisher is ready
  isReady(): boolean {
    return this.waku && this.waku.isConnected();
  }

  // Get IPFS status
  hasIPFS(): boolean {
    return this.ipfs !== null;
  }
}
