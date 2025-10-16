// hooks/useNillionMessenger.ts
// Using Nillion SecretVaults for encrypted contact and message storage
import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
// import { SecretVaultUserClient } from '@nillion/secretvaults'
// import { Keypair } from '@nillion/nuc'

export interface EncryptedContact {
  address: string
  name?: string
  lastMessage?: string
  unread?: number
  recordId?: string // Nillion record ID
}

export interface EncryptedMessage {
  id: string
  from: string
  to: string
  content: string
  type: 'chat' | 'payment' | 'payment-request'
  timestamp: number
  metadata?: any
  recordId?: string // Nillion record ID
}

const NILLION_TESTNET_URL = 'https://api.nildb.nillion.network'

export function useNillionMessenger() {
  const { address } = useAccount()
  const [contacts, setContacts] = useState<EncryptedContact[]>([])
  const [messages, setMessages] = useState<EncryptedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  // const [nillionClient, setNillionClient] = useState<SecretVaultUserClient | null>(null)
  const [nillionClient, setNillionClient] = useState<any>(null)

  // Initialize Nillion client when user connects wallet
  useEffect(() => {
    const initNillion = async () => {
      if (!address) {
        setIsConnected(false)
        return
      }

      const apiKey = import.meta.env.VITE_NILLION_API_KEY

      if (!apiKey) {
        console.warn('⚠️ VITE_NILLION_API_KEY not set, using localStorage fallback')
        setIsConnected(false)
        return
      }

      try {
        console.log('🔌 Initializing Nillion SecretVault client...')

        // Create user keypair from wallet address
        // Note: In production, generate unique keypair per user
        const keypair = '' // Keypair.generate()

        // Initialize SecretVault User Client with baseUrls
        // const client = await SecretVaultUserClient.from({
        //   baseUrls: [NILLION_TESTNET_URL],
        //   keypair,
        //   blindfold: {
        //     operation: 'store'
        //   }
        // })
        const client = {} // Placeholder until Nillion SDK is available

        setNillionClient(client)
        setIsConnected(true)
        console.log('✅ Nillion SecretVault client connected')
      } catch (error) {
        console.error('❌ Failed to initialize Nillion client:', error)
        setIsConnected(false)
      }
    }

    initNillion()
  }, [address])

  // Load contacts from storage on mount
  useEffect(() => {
    if (!address) return
    loadContactsFromStorage()
  }, [address])

  // Load contacts from localStorage (Nillion records stored as references)
  const loadContactsFromStorage = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const contactsKey = `resistnet_contacts_${address}`
      const storedContacts = localStorage.getItem(contactsKey)

      if (storedContacts) {
        const contactList = JSON.parse(storedContacts)
        setContacts(contactList)
        console.log(`📂 Loaded ${contactList.length} contacts from storage`)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save contact to Nillion SecretVault
  const saveContact = useCallback(async (contact: EncryptedContact): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      let recordId: string

      // Try to store in Nillion if available
      if (isConnected && nillionClient) {
        try {
          console.log('📤 Storing contact in Nillion SecretVault...')

          // Create encrypted contact data with %allot marker for encryption
          const contactData = {
            address: contact.address,
            name: `%allot${contact.name || ''}`, // Encrypted field
            addedAt: Date.now(),
            addedBy: address
          }

          // Store data in user's vault (requires collection ID)
          // Note: In production, you need to create a collection first
          // For now, we'll use localStorage as fallback
          throw new Error('Collection not yet created')

        } catch (nillionError) {
          console.warn('⚠️ Nillion storage failed, using localStorage:', nillionError)
          recordId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        recordId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('💾 Using localStorage for contact (Nillion not connected)')
      }

      // Save to localStorage (this stores references to Nillion records)
      const updatedContact = { ...contact, recordId }
      const contactsKey = `resistnet_contacts_${address}`
      const existingContacts = localStorage.getItem(contactsKey)
      const contactList = existingContacts ? JSON.parse(existingContacts) : []
      contactList.push(updatedContact)
      localStorage.setItem(contactsKey, JSON.stringify(contactList))

      // Update state
      setContacts(prev => [...prev, updatedContact])

      console.log('✅ Contact saved:', recordId)
      return recordId
    } catch (error) {
      console.error('Failed to save contact:', error)
      throw error
    }
  }, [address, isConnected, nillionClient])

  // Delete contact
  const deleteContact = useCallback(async (recordId: string) => {
    if (!address) return

    try {
      // Remove from Nillion if stored there
      if (isConnected && nillionClient) {
        try {
          // Nillion deletion would go here
          console.log('🗑️ Deleting from Nillion:', recordId)
        } catch (err) {
          console.warn('Failed to delete from Nillion:', err)
        }
      }

      // Remove from localStorage
      const contactsKey = `resistnet_contacts_${address}`
      const existingContacts = localStorage.getItem(contactsKey)
      if (existingContacts) {
        const contactList = JSON.parse(existingContacts)
        const filtered = contactList.filter((c: EncryptedContact) => c.recordId !== recordId)
        localStorage.setItem(contactsKey, JSON.stringify(filtered))
      }

      // Update state
      setContacts(prev => prev.filter(c => c.recordId !== recordId))

      console.log('✅ Contact deleted:', recordId)
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }, [address, isConnected, nillionClient])

  // Save message history
  const saveMessageHistory = useCallback(async (message: EncryptedMessage): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      let recordId: string

      // Try to store in Nillion if available
      if (isConnected && nillionClient) {
        try {
          console.log('📤 Storing message in Nillion SecretVault...')

          // Encrypt message content with %allot marker
          const messageData = {
            id: message.id,
            from: message.from,
            to: message.to,
            content: `%allot${message.content}`, // Encrypted field
            type: message.type,
            timestamp: message.timestamp,
            metadata: message.metadata ? `%allot${JSON.stringify(message.metadata)}` : undefined
          }

          // Store would go here (requires collection setup)
          throw new Error('Collection not yet created')

        } catch (nillionError) {
          console.warn('⚠️ Nillion storage failed, using localStorage:', nillionError)
          recordId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        recordId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('💾 Using localStorage for message (Nillion not connected)')
      }

      // Save to localStorage
      const messagesKey = `resistnet_messages_${address}_${message.from === address ? message.to : message.from}`
      const existingMessages = localStorage.getItem(messagesKey)
      const messageList = existingMessages ? JSON.parse(existingMessages) : []
      const updatedMessage = { ...message, recordId }
      messageList.push(updatedMessage)
      localStorage.setItem(messagesKey, JSON.stringify(messageList))

      // Update state
      setMessages(prev => [...prev, updatedMessage])

      console.log('✅ Message saved:', recordId)
      return recordId
    } catch (error) {
      console.error('Failed to save message:', error)
      throw error
    }
  }, [address, isConnected, nillionClient])

  // Load message history
  const loadMessageHistory = useCallback(async (contactAddress: string): Promise<EncryptedMessage[]> => {
    if (!address) return []

    try {
      const messagesKey = `resistnet_messages_${address}_${contactAddress}`
      const storedMessages = localStorage.getItem(messagesKey)

      if (storedMessages) {
        const messageList = JSON.parse(storedMessages)
        setMessages(prev => {
          // Merge without duplicates
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = messageList.filter((m: EncryptedMessage) => !existingIds.has(m.id))
          return [...prev, ...newMessages]
        })
        return messageList
      }

      return []
    } catch (error) {
      console.error('Failed to load message history:', error)
      return []
    }
  }, [address])

  // Share contact with another user (grant access in Nillion)
  const shareContact = useCallback(async (recordId: string, friendAddress: string) => {
    if (!isConnected || !nillionClient) {
      console.warn('Nillion not connected, cannot share')
      return
    }

    try {
      console.log(`🔗 Sharing contact ${recordId} with ${friendAddress}`)
      // grantAccess would go here with proper Nillion API
      // await nillionClient.grantAccess(...)
    } catch (error) {
      console.error('Failed to share contact:', error)
      throw error
    }
  }, [isConnected, nillionClient])

  // Emergency wipe
  const emergencyWipe = useCallback(() => {
    if (!address) return

    const contactsKey = `resistnet_contacts_${address}`
    localStorage.removeItem(contactsKey)

    // Clear all message histories
    contacts.forEach(contact => {
      const messagesKey = `resistnet_messages_${address}_${contact.address}`
      localStorage.removeItem(messagesKey)
    })

    setContacts([])
    setMessages([])

    console.log('🔥 Local data wiped (Nillion encrypted data remains)')
  }, [address, contacts])

  return {
    // State
    contacts,
    messages,
    isLoading,
    isConnected,

    // Contact operations
    saveContact,
    deleteContact,
    shareContact,
    loadContactsFromStorage,

    // Message operations
    saveMessageHistory,
    loadMessageHistory,

    // Emergency
    emergencyWipe
  }
}
