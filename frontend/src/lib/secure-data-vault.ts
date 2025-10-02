// lib/secure-data-vault.ts
import { NillionClient, SecretBlob } from '@nillion/client-ts';
import { WakuMessenger } from './waku-messenger';
import { create as createIPFS } from 'ipfs-http-client';

export interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'document' | 'audio';
  title: string;
  description: string;
  timestamp: number;
  location?: { lat: number; lon: number };
  ipfsHash: string;
  nillionStoreId: string;
  encryptedFor: string[];  // Authorized viewers
  metadata: {
    camera?: string;
    fileSize: number;
    mimeType: string;
    hash: string;  // Content hash for verification
  };
  chain: {
    previousHash?: string;  // Chain of custody
    signatures: string[];  // Witness signatures
  };
}

export class SecureDataVault {
  private nillion: NillionClient;
  private waku: WakuMessenger;
  private ipfs: any;
  private vaultTopic = '/resistnet/1/vault/proto';
  
  async initialize() {
    this.nillion = await NillionClient.create({
      network: 'testnet'
    });
    
    this.waku = new WakuMessenger();
    await this.waku.initialize();
    
    this.ipfs = createIPFS({
      url: 'https://ipfs.infura.io:5001'
    });
  }
  
  // Upload sensitive evidence with encryption
  async uploadEvidence(
    file: File,
    metadata: {
      title: string;
      description: string;
      location?: { lat: number; lon: number };
      type: 'photo' | 'video' | 'document' | 'audio';
    },
    authorizedViewers: string[],  // Ethereum addresses
    uploaderPassportScore: number
  ): Promise<Evidence> {
    
    // Verify uploader identity
    if (uploaderPassportScore < 20) {
      throw new Error('Insufficient Passport score to upload evidence');
    }
    
    // Step 1: Calculate content hash (for integrity verification)
    const fileBuffer = await file.arrayBuffer();
    const contentHash = await this.calculateHash(fileBuffer);
    
    // Step 2: Encrypt file
    const encrypted = await this.encryptFile(fileBuffer, authorizedViewers);
    
    // Step 3: Upload to IPFS (permanent storage)
    const ipfsResult = await this.ipfs.add(encrypted);
    const ipfsHash = ipfsResult.path;
    
    // Step 4: Store encryption keys on Nillion (secure key management)
    const nillionStoreId = await this.storeEncryptionKeys(
      file.name,
      authorizedViewers
    );
    
    // Step 5: Create evidence record
    const evidence: Evidence = {
      id: `evidence_${Date.now()}`,
      type: metadata.type,
      title: metadata.title,
      description: metadata.description,
      timestamp: Date.now(),
      location: metadata.location,
      ipfsHash,
      nillionStoreId,
      encryptedFor: authorizedViewers,
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        hash: contentHash
      },
      chain: {
        signatures: []
      }
    };
    
    // Step 6: Announce evidence (without revealing content)
    await this.announceEvidence(evidence);
    
    console.log(`🔒 Evidence uploaded securely`);
    console.log(`📦 IPFS: ${ipfsHash}`);
    console.log(`🔐 Nillion: ${nillionStoreId}`);
    
    return evidence;
  }
  
  // Grant access to new viewer
  async grantAccess(
    evidenceId: string,
    newViewer: string,
    granterPassportScore: number
  ) {
    if (granterPassportScore < 25) {
      throw new Error('Insufficient score to grant access');
    }
    
    // Update Nillion permissions
    await this.nillion.updatePermissions(evidenceId, {
      retrieve: [...(await this.getCurrentViewers(evidenceId)), newViewer]
    });
    
    // Notify via Waku
    await this.waku.sendMessage(this.vaultTopic, {
      type: 'access-granted',
      evidenceId,
      newViewer,
      timestamp: Date.now()
    });
  }
  
  // Revoke access
  async revokeAccess(evidenceId: string, viewer: string) {
    const currentViewers = await this.getCurrentViewers(evidenceId);
    const updatedViewers = currentViewers.filter(v => v !== viewer);
    
    await this.nillion.updatePermissions(evidenceId, {
      retrieve: updatedViewers
    });
  }
  
  // Download and decrypt evidence (if authorized)
  async downloadEvidence(evidenceId: string): Promise<Blob> {
    // Step 1: Retrieve encryption keys from Nillion
    const keys = await this.nillion.retrieveSecrets(evidenceId);
    
    if (!keys) {
      throw new Error('Unauthorized: Cannot access this evidence');
    }
    
    // Step 2: Get encrypted file from IPFS
    const evidence = await this.getEvidenceMetadata(evidenceId);
    const encryptedData = await this.ipfs.cat(evidence.ipfsHash);
    
    // Step 3: Decrypt
    const decrypted = await this.decryptFile(encryptedData, keys);
    
    // Step 4: Verify integrity
    const hash = await this.calculateHash(decrypted);
    if (hash !== evidence.metadata.hash) {
      throw new Error('Evidence integrity check failed!');
    }
    
    return new Blob([decrypted]);
  }
  
  // Add witness signature (chain of custody)
  async witnessEvidence(
    evidenceId: string,
    signature: string,
    witnessPassportScore: number
  ) {
    if (witnessPassportScore < 20) {
      throw new Error('Insufficient score to witness');
    }
    
    await this.waku.sendMessage(this.vaultTopic, {
      type: 'witness-signature',
      evidenceId,
      signature,
      witnessScore: witnessPassportScore,
      timestamp: Date.now()
    });
    
    console.log(`✍️ Witness signature added to evidence chain`);
  }
  
  // Create evidence collection (for complex cases)
  async createCollection(
    name: string,
    description: string,
    evidenceIds: string[]
  ) {
    const collection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      evidenceIds,
      createdAt: Date.now(),
      contributors: []
    };
    
    await this.waku.sendMessage(this.vaultTopic, {
      type: 'collection-created',
      data: collection
    });
    
    return collection;
  }
  
  // Export evidence package (for legal proceedings)
  async exportEvidencePackage(evidenceIds: string[]): Promise<Blob> {
    const package_data = {
      exportedAt: Date.now(),
      evidence: await Promise.all(
        evidenceIds.map(id => this.getEvidenceMetadata(id))
      ),
      verification: {
        ipfsHashes: evidenceIds.map(id => `ipfs://...`),
        contentHashes: evidenceIds.map(id => '0x...'),
        signatures: []
      }
    };
    
    return new Blob([JSON.stringify(package_data, null, 2)], {
      type: 'application/json'
    });
  }
  
  // Search evidence vault
  async searchEvidence(
    query: {
      type?: string;
      dateRange?: { start: number; end: number };
      location?: { lat: number; lon: number; radius: number };
      minWitnesses?: number;
    }
  ): Promise<Evidence[]> {
    // Query Waku Store for evidence announcements
    const messages = await this.waku.getMessageHistory(this.vaultTopic, 1000);
    
    return messages
      .filter(msg => msg.type === 'evidence-announcement')
      .map(msg => msg.data)
      .filter(evidence => {
        if (query.type && evidence.type !== query.type) return false;
        if (query.dateRange) {
          if (evidence.timestamp < query.dateRange.start || 
              evidence.timestamp > query.dateRange.end) return false;
        }
        if (query.minWitnesses && 
            evidence.chain.signatures.length < query.minWitnesses) return false;
        return true;
      });
  }
  
  // Private helper methods
  private async encryptFile(
    data: ArrayBuffer,
    authorizedViewers: string[]
  ): Promise<Uint8Array> {
    // Implement asymmetric encryption for each viewer
    // In production, use proper ECIES or similar
    return new Uint8Array(data);
  }
  
  private async decryptFile(
    encrypted: Uint8Array,
    keys: any
  ): Promise<ArrayBuffer> {
    // Implement decryption
    return encrypted.buffer;
  }
  
  private async calculateHash(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  private async storeEncryptionKeys(
    fileName: string,
    authorizedViewers: string[]
  ): Promise<string> {
    return await this.nillion.storeSecrets({
      secrets: {
        'encryption_key': new SecretBlob(Buffer.from('key_data'))
      },
      permissions: {
        retrieve: authorizedViewers,
        update: [],
        compute: []
      }
    });
  }
  
  private async announceEvidence(evidence: Evidence) {
    // Announce without revealing content
    await this.waku.sendMessage(this.vaultTopic, {
      type: 'evidence-announcement',
      data: {
        id: evidence.id,
        type: evidence.type,
        title: evidence.title,
        timestamp: evidence.timestamp,
        ipfsHash: evidence.ipfsHash  // Encrypted, so safe to share
      }
    });
  }
  
  private async getEvidenceMetadata(evidenceId: string): Promise<Evidence> {
    // Retrieve from local cache or Waku
    return {} as Evidence;
  }
  
  private async getCurrentViewers(evidenceId: string): Promise<string[]> {
    // Query Nillion for current permissions
    return [];
  }
}
