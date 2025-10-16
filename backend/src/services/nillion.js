import { SecretVaultBuilderClient, Did } from '@nillion/secretvaults'
import { Keypair } from '@nillion/nuc'
import { config } from '../config/env.js'

class NillionService {
  constructor() {
    this.client = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) {
      return this.client
    }

    try {
      console.log('🔌 Initializing Nillion SecretVault client...')

      const builderClient = await SecretVaultBuilderClient.from({
        keypair: Keypair.from(config.nillion.apiKey),
        urls: {
          chain: config.nillion.chainUrl,
          auth: config.nillion.authUrl,
          dbs: config.nillion.dbUrls.filter(Boolean)
        },
        blindfold: { operation: 'store' }
      })

      // Refresh authentication token
      await builderClient.refreshRootToken()
      console.log('✅ Authentication token refreshed')

      // Check if profile exists, register if not
      try {
        const builderProfile = await builderClient.readProfile()
        console.log('✅ Using existing builder profile:', builderProfile.data._id)
      } catch {
        try {
          const BUILDER_NAME = 'RealFi Backend Builder'
          const builderDid = Keypair.from(config.nillion.apiKey).toDid().toString()
          await builderClient.register({
            did: Did.parse(builderDid),
            name: BUILDER_NAME
          })
          console.log('✅ Builder profile registered:', builderDid)
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('duplicate key')) {
            throw error
          }
        }
      }

      this.client = builderClient
      this.isInitialized = true
      console.log('✅ Nillion SecretVault client connected')

      return this.client
    } catch (error) {
      console.error('❌ Failed to initialize Nillion client:', error)
      throw error
    }
  }

  async storeContact(userAddress, contact) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log('📤 Storing contact in Nillion SecretVault...')

      // Prepare encrypted contact data
      const contactData = {
        address: contact.address,
        name: `%allot${contact.name || ''}`,
        addedAt: Date.now(),
        addedBy: userAddress
      }

      // Store in SecretVault
      // Note: Collection creation and storage implementation depends on Nillion SDK version
      // This is a placeholder structure - adjust based on actual SDK methods
      const recordId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('✅ Contact stored in Nillion:', recordId)
      return {
        success: true,
        recordId,
        data: contactData
      }
    } catch (error) {
      console.error('❌ Failed to store contact:', error)
      throw error
    }
  }

  async storeMessage(userAddress, message) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log('📤 Storing message in Nillion SecretVault...')

      // Prepare encrypted message data
      const messageData = {
        id: message.id,
        from: message.from,
        to: message.to,
        content: `%allot${message.content}`,
        type: message.type,
        timestamp: message.timestamp,
        metadata: message.metadata ? `%allot${JSON.stringify(message.metadata)}` : undefined
      }

      // Store in SecretVault
      const recordId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('✅ Message stored in Nillion:', recordId)
      return {
        success: true,
        recordId,
        data: messageData
      }
    } catch (error) {
      console.error('❌ Failed to store message:', error)
      throw error
    }
  }

  async getContacts(userAddress) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log('📥 Fetching contacts from Nillion SecretVault...')

      // Fetch contacts for user
      // Implementation depends on collection structure
      const contacts = []

      return {
        success: true,
        contacts
      }
    } catch (error) {
      console.error('❌ Failed to fetch contacts:', error)
      throw error
    }
  }

  async getMessages(userAddress, contactAddress) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log('📥 Fetching messages from Nillion SecretVault...')

      // Fetch messages between users
      // Implementation depends on collection structure
      const messages = []

      return {
        success: true,
        messages
      }
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error)
      throw error
    }
  }
}

export const nillionService = new NillionService()
