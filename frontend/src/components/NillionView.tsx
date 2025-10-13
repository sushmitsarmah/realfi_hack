import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNillionKeyManager, useNillionVault, useNillionGovernance } from '@/hooks/useNillion'

export function NillionView() {
  const { address, isConnected } = useAccount()
  const keyManager = useNillionKeyManager()
  const vault = useNillionVault()
  const governance = useNillionGovernance()

  const [activeTab, setActiveTab] = useState<'keys' | 'vault' | 'governance'>('keys')
  const [testPrivateKey, setTestPrivateKey] = useState('')
  const [splitParties, setSplitParties] = useState('3')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [evidenceTitle, setEvidenceTitle] = useState('')

  const handleKeySplit = async () => {
    if (!testPrivateKey) return

    try {
      const parties = Array.from({ length: parseInt(splitParties) }, (_, i) => `Party${i + 1}`)
      const storeId = await keyManager.splitPrivateKey(testPrivateKey, parties)
      alert(`Key successfully split into ${splitParties} shares!\nStore ID: ${storeId}`)
      setTestPrivateKey('')
    } catch (error) {
      alert('Key splitting failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleEvidenceUpload = async () => {
    if (!selectedFile || !evidenceTitle) return

    try {
      const result = await vault.uploadEvidence(
        selectedFile,
        {
          title: evidenceTitle,
          description: 'Encrypted evidence',
          type: selectedFile.type
        },
        [] // Authorized parties
      )
      alert(`Evidence uploaded successfully!\nStore ID: ${result.storeId}`)
      setSelectedFile(null)
      setEvidenceTitle('')
    } catch (error) {
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const testPrivateVote = async () => {
    try {
      await governance.castPrivateVote('test-proposal-1', 0, 1)
      alert('Vote cast successfully! Your vote is private.')
    } catch (error) {
      alert('Voting failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Nillion Blind Computation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to access Nillion features.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 border-violet-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔮</span>
              <div>
                <CardTitle className="text-gray-100">Nillion Blind Computation</CardTitle>
                <CardDescription className="text-gray-400">
                  MPC, private computation, and encrypted storage
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${keyManager.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">
                {keyManager.isConnected ? 'Connected to Nillion' : 'Disconnected'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Network Status */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-violet-900/20 border border-violet-700 rounded">
              <p className="text-sm text-gray-400 mb-1">Network</p>
              <p className="text-lg font-semibold text-violet-400">Testnet</p>
            </div>
            <div className="p-4 bg-fuchsia-900/20 border border-fuchsia-700 rounded">
              <p className="text-sm text-gray-400 mb-1">MPC Protocol</p>
              <p className="text-lg font-semibold text-fuchsia-400">Active</p>
            </div>
            <div className="p-4 bg-purple-900/20 border border-purple-700 rounded">
              <p className="text-sm text-gray-400 mb-1">Compute Nodes</p>
              <p className="text-lg font-semibold text-purple-400">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 ${
            activeTab === 'keys'
              ? 'border-b-2 border-violet-500 text-violet-400'
              : 'text-gray-400'
          }`}
        >
          🔑 MPC Key Management
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 ${
            activeTab === 'vault'
              ? 'border-b-2 border-violet-500 text-violet-400'
              : 'text-gray-400'
          }`}
        >
          🔒 Encrypted Vault
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 ${
            activeTab === 'governance'
              ? 'border-b-2 border-violet-500 text-violet-400'
              : 'text-gray-400'
          }`}
        >
          🗳️ Private Voting
        </button>
      </div>

      {/* MPC Key Management Tab */}
      {activeTab === 'keys' && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">MPC Key Management</CardTitle>
            <CardDescription className="text-gray-400">
              Split private keys using multi-party computation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Splitting Interface */}
            <div className="p-4 bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-700 rounded">
              <h3 className="text-sm font-semibold text-violet-300 mb-3">Split Private Key</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Private Key (Test Only)</label>
                  <Input
                    type="password"
                    placeholder="0x..."
                    value={testPrivateKey}
                    onChange={(e) => setTestPrivateKey(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-gray-100"
                  />
                  <p className="text-xs text-yellow-500 mt-1">⚠️ Demo only - Never use real keys in production</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Number of Parties</label>
                  <select
                    value={splitParties}
                    onChange={(e) => setSplitParties(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-100"
                  >
                    <option value="2">2 Parties (1-of-2)</option>
                    <option value="3">3 Parties (2-of-3)</option>
                    <option value="5">5 Parties (3-of-5)</option>
                  </select>
                </div>

                <Button
                  onClick={handleKeySplit}
                  disabled={!testPrivateKey || keyManager.isSplitting}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {keyManager.isSplitting ? 'Splitting Key...' : 'Split Key with MPC'}
                </Button>
              </div>
            </div>

            {/* Key Status */}
            {keyManager.keyStoreId && (
              <div className="p-4 bg-green-900/20 border border-green-700 rounded">
                <h3 className="text-sm font-semibold text-green-300 mb-2">✓ Key Successfully Split</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Store ID:</span>
                    <code className="text-green-400">{keyManager.keyStoreId.slice(0, 16)}...</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parties:</span>
                    <span className="text-green-400">{splitParties}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Never Exposed</p>
                    <p className="text-xs text-gray-500">Private key never revealed in full</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🔐</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Threshold Signing</p>
                    <p className="text-xs text-gray-500">Requires M-of-N parties to sign</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Social Recovery</p>
                    <p className="text-xs text-gray-500">Recover access with trusted parties</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Blind Computation</p>
                    <p className="text-xs text-gray-500">Sign without revealing key</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encrypted Vault Tab */}
      {activeTab === 'vault' && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">Nillion Encrypted Vault</CardTitle>
            <CardDescription className="text-gray-400">
              Store encrypted evidence with blind computation access control
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700 rounded">
              <h3 className="text-sm font-semibold text-violet-300 mb-3">Upload Encrypted Evidence</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Evidence Title</label>
                  <Input
                    placeholder="Enter evidence title..."
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">File</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                  />
                </div>

                <Button
                  onClick={handleEvidenceUpload}
                  disabled={!selectedFile || !evidenceTitle || vault.uploading}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {vault.uploading ? 'Encrypting & Uploading...' : 'Upload to Nillion'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-violet-900/20 rounded text-center">
                <p className="text-violet-400 font-semibold">End-to-End Encrypted</p>
                <p className="text-gray-500 mt-1">Data encrypted before upload</p>
              </div>
              <div className="p-3 bg-fuchsia-900/20 rounded text-center">
                <p className="text-fuchsia-400 font-semibold">Access Control</p>
                <p className="text-gray-500 mt-1">MPC-based permissions</p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded text-center">
                <p className="text-purple-400 font-semibold">Blind Computation</p>
                <p className="text-gray-500 mt-1">Compute without decryption</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Private Voting Tab */}
      {activeTab === 'governance' && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">Private Voting with Nillion</CardTitle>
            <CardDescription className="text-gray-400">
              Cast votes that remain private while results are verifiable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700 rounded">
              <h3 className="text-sm font-semibold text-violet-300 mb-3">Test Private Vote</h3>
              <p className="text-sm text-gray-400 mb-4">
                Cast a test vote using Nillion's blind computation. Your vote is never revealed, only the final tally.
              </p>
              <Button
                onClick={testPrivateVote}
                disabled={governance.voting}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {governance.voting ? 'Casting Vote...' : 'Cast Private Vote (Demo)'}
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">How It Works</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded">
                  <span className="text-lg">1️⃣</span>
                  <div>
                    <p className="text-sm text-gray-200">Encrypted Vote</p>
                    <p className="text-xs text-gray-500">Your vote is encrypted using MPC before submission</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded">
                  <span className="text-lg">2️⃣</span>
                  <div>
                    <p className="text-sm text-gray-200">Blind Computation</p>
                    <p className="text-xs text-gray-500">Nillion tallies votes without decrypting individual votes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded">
                  <span className="text-lg">3️⃣</span>
                  <div>
                    <p className="text-sm text-gray-200">Verifiable Result</p>
                    <p className="text-xs text-gray-500">Final results are public while votes remain private</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
