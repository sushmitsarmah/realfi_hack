// scripts/create-nillion-collections.js
// Based on: https://docs.nillion.com/build/private-storage/quickstart

import { Keypair, NilauthClient, PayerBuilder } from '@nillion/nuc'
import { SecretVaultBuilderClient } from '@nillion/secretvaults'
import { randomUUID } from 'crypto'

// Configuration from environment
const NILLION_API_KEY = '08b75f2d07152acd63bc03ace16dc132bec9692ee965eec561b50492fc634ccc'

// Nillion Testnet URLs from https://docs.nillion.com/build/network-config
const config = {
  NILCHAIN_URL: 'https://nilchain-rpc.nillion.network',
  NILAUTH_URL: 'https://nilauth.nillion.network',
  NILDB_NODES: ['https://api.nildb.nillion.network']
}

async function createCollections() {
  try {
    console.log('🔌 Initializing Nillion SecretVaults...\n')

    // Create keypair from API key
    const builderKeypair = Keypair.from(NILLION_API_KEY)

    // Setup payer for authentication
    console.log('🔑 Setting up authentication...')
    const payer = await new PayerBuilder()
      .keypair(builderKeypair)
      .chainUrl(config.NILCHAIN_URL)
      .build()

    // Initialize NilAuth client
    const nilauth = await NilauthClient.from(config.NILAUTH_URL, payer)

    // Initialize SecretVault Builder Client
    console.log('🔌 Connecting to SecretVault...')
    const builder = await SecretVaultBuilderClient.from({
      keypair: builderKeypair,
      urls: {
        chain: config.NILCHAIN_URL,
        auth: config.NILAUTH_URL,
        dbs: config.NILDB_NODES
      }
    })

    console.log('✅ Connected to Nillion\n')

    // Create Contacts Collection
    console.log('📦 Creating Contacts Collection...')
    const contactsCollectionId = randomUUID()
    const contactsCollection = {
      _id: contactsCollectionId,
      type: 'owned',
      name: 'ResistNet Contacts',
      schema: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          name: { type: 'string' },
          addedAt: { type: 'number' },
          addedBy: { type: 'string' }
        },
        required: ['address', 'addedAt', 'addedBy'],
        encrypted: ['name'] // Fields to encrypt
      }
    }

    await builder.createCollection(contactsCollection)
    console.log('✅ Contacts Collection Created:', contactsCollectionId)
    console.log()

    // Create Messages Collection
    console.log('📦 Creating Messages Collection...')
    const messagesCollectionId = randomUUID()
    const messagesCollection = {
      _id: messagesCollectionId,
      type: 'owned',
      name: 'ResistNet Messages',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          content: { type: 'string' },
          type: { type: 'string' },
          timestamp: { type: 'number' },
          metadata: { type: 'string' }
        },
        required: ['id', 'from', 'to', 'content', 'type', 'timestamp'],
        encrypted: ['content', 'metadata'] // Fields to encrypt
      }
    }

    await builder.createCollection(messagesCollection)
    console.log('✅ Messages Collection Created:', messagesCollectionId)
    console.log()

    // Output instructions
    console.log('━'.repeat(60))
    console.log('📋 NEXT STEPS:')
    console.log('━'.repeat(60))
    console.log()
    console.log('Add these lines to your frontend/.env.local file:')
    console.log()
    console.log(`VITE_NILLION_CONTACTS_COLLECTION_ID=${contactsCollectionId}`)
    console.log(`VITE_NILLION_MESSAGES_COLLECTION_ID=${messagesCollectionId}`)
    console.log()
    console.log('━'.repeat(60))
    console.log('✅ Collections created successfully!')
    console.log('━'.repeat(60))

  } catch (error) {
    console.error('❌ Error creating collections:', error.message)
    console.error()
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

// Run the script
createCollections()
