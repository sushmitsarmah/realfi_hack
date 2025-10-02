// lib/waku-messenger.ts
import { createLightNode, waitForRemotePeer } from '@waku/sdk';
import { Protocols } from '@waku/interfaces';

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'chat' | 'payment' | 'payment-request';
  timestamp: number;
  metadata?: any;
}

export class WakuMessenger {
  private node: any;
  private baseContentTopic = '/shadow-wallet/1';
  private messageHandlers: Map<string, Function> = new Map();
  
  async initialize() {
    console.log('Initializing Waku node...');
    
    // Create light node for efficiency
    this.node = await createLightNode({
      defaultBootstrap: true,
    });
    
    await this.node.start();
    
    console.log('Waiting for Waku peers...');
    await waitForRemotePeer(this.node, [
      Protocols.LightPush,
      Protocols.Filter,
      Protocols.Store
    ]);
    
    console.log('Waku node ready!');
  }
  
  // Subscribe to messages for a specific address
  async subscribe(address: string, callback: (msg: Message) => void) {
    const contentTopic = `${this.baseContentTopic}/${address}/proto`;
    
    await this.node.filter.subscribe(
      [{ contentTopic }],
      async (wakuMessage: any) => {
        try {
          const payload = wakuMessage.payload;
          const decoded = this.decodeMessage(payload);
          callback(decoded);
        } catch (error) {
          console.error('Failed to decode message:', error);
        }
      }
    );
    
    this.messageHandlers.set(address, callback);
  }
  
  // Send message to recipient
  async sendMessage(to: string, message: Message) {
    const contentTopic = `${this.baseContentTopic}/${to}/proto`;
    const encoded = this.encodeMessage(message);
    
    await this.node.lightPush.send({
      contentTopic,
      payload: encoded
    });
  }
  
  // Query historical messages
  async getMessageHistory(address: string, limit: number = 50): Promise<Message[]> {
    const contentTopic = `${this.baseContentTopic}/${address}/proto`;
    const messages: Message[] = [];
    
    try {
      // Query store protocol
      for await (const messagesPromises of this.node.store.queryGenerator([
        { contentTopic }
      ])) {
        const results = await Promise.all(messagesPromises);
        
        for (const wakuMessage of results) {
          if (wakuMessage?.payload) {
            const decoded = this.decodeMessage(wakuMessage.payload);
            messages.push(decoded);
            
            if (messages.length >= limit) break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to query message history:', error);
    }
    
    return messages;
  }
  
  // Send payment notification
  async notifyPayment(to: string, txHash: string, amount: string, from: string) {
    const message: Message = {
      id: this.generateId(),
      from,
      to,
      content: `Payment of ${amount} ETH sent`,
      type: 'payment',
      timestamp: Date.now(),
      metadata: { txHash, amount }
    };
    
    await this.sendMessage(to, message);
  }
  
  // Send payment request
  async requestPayment(to: string, amount: string, reason: string, from: string) {
    const message: Message = {
      id: this.generateId(),
      from,
      to,
      content: reason,
      type: 'payment-request',
      timestamp: Date.now(),
      metadata: { amount, requestedBy: from }
    };
    
    await this.sendMessage(to, message);
  }
  
  // Send chat message
  async sendChat(to: string, content: string, from: string) {
    const message: Message = {
      id: this.generateId(),
      from,
      to,
      content,
      type: 'chat',
      timestamp: Date.now()
    };
    
    await this.sendMessage(to, message);
  }
  
  // Encode message to bytes
  private encodeMessage(message: Message): Uint8Array {
    const json = JSON.stringify(message);
    return new TextEncoder().encode(json);
  }
  
  // Decode message from bytes
  private decodeMessage(payload: Uint8Array): Message {
    const json = new TextDecoder().decode(payload);
    return JSON.parse(json);
  }
  
  // Generate unique message ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Stop Waku node
  async stop() {
    await this.node.stop();
  }
  
  // Get peer info
  async getPeers() {
    return await this.node.libp2p.peerStore.all();
  }
  
  // Check connection status
  isConnected(): boolean {
    return this.node?.isStarted() || false;
  }
}
