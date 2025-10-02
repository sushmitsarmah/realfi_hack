// waku-messaging.ts
import { createLightNode, waitForRemotePeer } from '@waku/sdk';
import { Protocols } from '@waku/interfaces';

export class WakuMessenger {
  private node: any;
  private contentTopic = '/shadow-wallet/1/messages/proto';
  
  async initialize() {
    // Create Waku light node
    this.node = await createLightNode({ 
      defaultBootstrap: true 
    });
    
    await this.node.start();
    await waitForRemotePeer(this.node, [
      Protocols.LightPush,
      Protocols.Filter
    ]);
  }
  
  async sendMessage(recipient: string, message: string, paymentData?: any) {
    const payload = {
      to: recipient,
      message: message,
      payment: paymentData, // Optional: include transaction details
      timestamp: Date.now()
    };
    
    // Encrypt with recipient's public key
    const encrypted = await this.encryptMessage(payload, recipient);
    
    // Send via Waku
    await this.node.lightPush.send({
      contentTopic: this.contentTopic,
      payload: encrypted
    });
  }
  
  async subscribeToMessages(callback: Function) {
    await this.node.filter.subscribe(
      [{ contentTopic: this.contentTopic }],
      async (message: any) => {
        const decrypted = await this.decryptMessage(message.payload);
        callback(decrypted);
      }
    );
  }
}
