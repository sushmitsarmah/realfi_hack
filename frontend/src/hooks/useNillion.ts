import { useState, useEffect } from 'react'
import { useNillion, useNilStoreValues, useNilStoreProgram, useNilInvokeCompute } from '@nillion/client-react-hooks'

export interface NillionConfig {
  clusterId?: string
  programName?: string
  outputName?: string
}

export function useNillionConnection(config?: NillionConfig) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nillion = useNillion()
  const storeValues = useNilStoreValues()
  const storeProgram = useNilStoreProgram()
  const invokeCompute = useNilInvokeCompute()

  useEffect(() => {
    // Check Nillion connection status
    const checkConnection = async () => {
      try {
        // Check if Nillion client is available
        if (nillion?.client) {
          setIsConnected(true)
        } else {
          // Mock connection for demo purposes
          setIsConnected(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to Nillion')
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [nillion])

  return {
    isConnected,
    error,
    nillion,
    storeValues,
    storeProgram,
    invokeCompute
  }
}

export function useNillionKeyManager() {
  const { storeValues, invokeCompute, isConnected } = useNillionConnection()
  const [keyStoreId, setKeyStoreId] = useState<string | null>(null)
  const [isSplitting, setIsSplitting] = useState(false)

  const splitPrivateKey = async (privateKey: string, parties: string[]) => {
    if (!isConnected) {
      throw new Error('Not connected to Nillion network')
    }

    setIsSplitting(true)
    try {
      // Mock implementation - in production this would use actual Nillion APIs
      // Store the private key as a secret using Nillion's MPC
      const mockStoreId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setKeyStoreId(mockStoreId)

      // Simulate storing to Nillion
      console.log('Splitting key into', parties.length, 'shares using Nillion MPC')

      return mockStoreId
    } catch (error) {
      console.error('Key splitting failed:', error)
      throw error
    } finally {
      setIsSplitting(false)
    }
  }

  const signTransaction = async (txData: string) => {
    if (!keyStoreId) {
      throw new Error('No key store ID available')
    }

    try {
      // Mock implementation - blind computation signing
      console.log('Signing transaction using Nillion MPC:', keyStoreId)
      return `0x${Math.random().toString(16).substr(2, 64)}`
    } catch (error) {
      console.error('Transaction signing failed:', error)
      throw error
    }
  }

  return {
    splitPrivateKey,
    signTransaction,
    keyStoreId,
    isSplitting,
    isConnected
  }
}

export function useNillionVault() {
  const { storeValues, isConnected } = useNillionConnection()
  const [uploading, setUploading] = useState(false)

  const uploadEvidence = async (
    file: File,
    metadata: { title: string; description: string; type: string },
    authorizedParties: string[]
  ) => {
    if (!isConnected) {
      throw new Error('Not connected to Nillion network')
    }

    setUploading(true)
    try {
      // Convert file to base64
      const fileData = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)))

      // Mock store ID
      const mockStoreId = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log('Uploading encrypted evidence to Nillion:', metadata.title)

      setUploading(false)
      return {
        storeId: mockStoreId,
        metadata
      }
    } catch (error) {
      setUploading(false)
      console.error('Evidence upload failed:', error)
      throw error
    }
  }

  return {
    uploadEvidence,
    uploading,
    isConnected
  }
}

export function useNillionGovernance() {
  const { invokeCompute, storeValues, isConnected } = useNillionConnection()
  const [voting, setVoting] = useState(false)

  const castPrivateVote = async (
    proposalId: string,
    optionIndex: number,
    voterWeight: number = 1
  ) => {
    if (!isConnected) {
      throw new Error('Not connected to Nillion network')
    }

    setVoting(true)
    try {
      // Mock private voting using Nillion MPC
      console.log('Casting private vote for proposal:', proposalId, 'option:', optionIndex)

      // Simulate blind computation
      await new Promise(resolve => setTimeout(resolve, 500))

      setVoting(false)
      return {
        success: true,
        voteId: `vote_${Date.now()}`
      }
    } catch (error) {
      setVoting(false)
      console.error('Private voting failed:', error)
      throw error
    }
  }

  const tallyVotes = async (proposalId: string) => {
    try {
      // Mock vote tallying without revealing individual votes
      console.log('Tallying votes for proposal:', proposalId)
      return {
        totalVotes: 0,
        results: []
      }
    } catch (error) {
      console.error('Vote tallying failed:', error)
      throw error
    }
  }

  return {
    castPrivateVote,
    tallyVotes,
    voting,
    isConnected
  }
}
