import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SettingsView() {
  const { address, isConnected } = useAccount()
  const [torEnabled, setTorEnabled] = useState(true)
  const [mpcEnabled, setMpcEnabled] = useState(true)
  const [privateVoting, setPrivateVoting] = useState(true)
  const [evidenceVault, setEvidenceVault] = useState(true)
  const [debugMode, setDebugMode] = useState(false)
  const [gitcoinScore, setGitcoinScore] = useState(0)
  const [humanityVerified, setHumanityVerified] = useState(false)

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to access settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <CardTitle className="text-gray-100">Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure privacy and security features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-200">Tor Routing</p>
              <p className="text-xs text-gray-500">Route all traffic through Tor network</p>
            </div>
            <Button
              onClick={() => setTorEnabled(!torEnabled)}
              size="sm"
              className={torEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {torEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-200">MPC Key Management</p>
              <p className="text-xs text-gray-500">Use Nillion for secure key splitting</p>
            </div>
            <Button
              onClick={() => setMpcEnabled(!mpcEnabled)}
              size="sm"
              className={mpcEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {mpcEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-200">Private Voting</p>
              <p className="text-xs text-gray-500">Enable privacy-preserving governance</p>
            </div>
            <Button
              onClick={() => setPrivateVoting(!privateVoting)}
              size="sm"
              className={privateVoting ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {privateVoting ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-200">Evidence Vault</p>
              <p className="text-xs text-gray-500">Encrypted evidence storage</p>
            </div>
            <Button
              onClick={() => setEvidenceVault(!evidenceVault)}
              size="sm"
              className={evidenceVault ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {evidenceVault ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Identity Settings */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Identity & Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-900/50 rounded">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-200">Identity & Verification</p>
                <p className="text-xs text-gray-500">Gitcoin Passport + Humanity Protocol</p>
              </div>
              <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded">
                Combined Score
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => window.location.href = '/identity'}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              View Identity Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Settings */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-gray-300">Tor Proxy</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-gray-300">Waku P2P</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">3 Peers</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-gray-300">IPFS</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-gray-300">Nillion Network</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Testnet</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Settings */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Developer Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-200">Debug Mode</p>
              <p className="text-xs text-gray-500">Show detailed console logs</p>
            </div>
            <Button
              onClick={() => setDebugMode(!debugMode)}
              size="sm"
              className={debugMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {debugMode ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="p-3 bg-gray-900/30 rounded border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Your Address:</p>
            <code className="text-xs text-gray-300 break-all">{address}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
