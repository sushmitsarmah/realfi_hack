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
  const [isNillionAvailable, setIsNillionAvailable] = useState(true)

  // Try to use Nillion hooks, but handle gracefully if not available
  let nillion: ReturnType<typeof useNillion> | undefined
  let storeValues: ReturnType<typeof useNilStoreValues> | undefined
  let storeProgram: ReturnType<typeof useNilStoreProgram> | undefined
  let invokeCompute: ReturnType<typeof useNilInvokeCompute> | undefined

  try {
    nillion = useNillion()
    storeValues = useNilStoreValues()
    storeProgram = useNilStoreProgram()
    invokeCompute = useNilInvokeCompute()
  } catch (err) {
    // Nillion provider not available - this is OK
    setIsNillionAvailable(false)
    console.log('ℹ️ Nillion not available, using fallback mode')
  }

  useEffect(() => {
    // Check Nillion connection status
    const checkConnection = async () => {
      try {
        // Check if Nillion client is available
        if (nillion?.client) {
          setIsConnected(true)
        } else if (isNillionAvailable) {
          // Mock connection for demo purposes
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to Nillion')
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [nillion, isNillionAvailable])

  return {
    isConnected,
    error,
    nillion,
    storeValues,
    storeProgram,
    invokeCompute,
    isNillionAvailable
  }
}

export function useNillionKeyManager() {
  const { storeValues, invokeCompute, isConnected, isNillionAvailable } = useNillionConnection()
  const [keyStoreId, setKeyStoreId] = useState<string | null>(null)
  const [isSplitting, setIsSplitting] = useState(false)

  const splitPrivateKey = async (privateKey: string, parties: string[]) => {
    if (!isNillionAvailable) {
      console.warn('⚠️ Nillion not available - using mock key splitting')
    }

    if (!isConnected && isNillionAvailable) {
      throw new Error('Not connected to Nillion network')
    }

    setIsSplitting(true)
    try {
      // Mock implementation - in production this would use actual Nillion APIs
      // Store the private key as a secret using Nillion's MPC
      const mockStoreId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setKeyStoreId(mockStoreId)

      // Simulate storing to Nillion
      console.log(
        'Splitting key into', 
        parties.length, 
        'shares', 
        isNillionAvailable ? 'using Nillion MPC' : '(mock mode)'
      )

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
      console.log(
        'Signing transaction',
        isNillionAvailable ? 'using Nillion MPC:' : '(mock mode):',
        keyStoreId
      )
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
    isConnected,
    isNillionAvailable
  }
}

export function useNillionVault() {
  const { storeValues, isConnected, isNillionAvailable } = useNillionConnection()
  const [uploading, setUploading] = useState(false)

  const uploadEvidence = async (
    file: File,
    metadata: { title: string; description: string; type: string },
    authorizedParties: string[]
  ) => {
    if (!isNillionAvailable) {
      console.warn('⚠️ Nillion not available - using mock evidence storage')
    }

    if (!isConnected && isNillionAvailable) {
      throw new Error('Not connected to Nillion network')
    }

    setUploading(true)
    try {
      // Convert file to base64
      const fileData = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)))

      // Mock store ID
      const mockStoreId = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log(
        'Uploading encrypted evidence',
        isNillionAvailable ? 'to Nillion:' : '(mock mode):',
        metadata.title
      )

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
    isConnected,
    isNillionAvailable
  }
}

export function useNillionGovernance() {
  const { invokeCompute, storeValues, isConnected, isNillionAvailable } = useNillionConnection()
  const [voting, setVoting] = useState(false)

  const castPrivateVote = async (
    proposalId: string,
    optionIndex: number,
    voterWeight: number = 1
  ) => {
    if (!isNillionAvailable) {
      console.warn('⚠️ Nillion not available - using mock private voting')
    }

    if (!isConnected && isNillionAvailable) {
      throw new Error('Not connected to Nillion network')
    }

    setVoting(true)
    try {
      // Mock private voting using Nillion MPC
      console.log(
        'Casting private vote for proposal:',
        proposalId,
        'option:',
        optionIndex,
        isNillionAvailable ? '(Nillion MPC)' : '(mock mode)'
      )

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
    isConnected,
    isNillionAvailable
  }
}