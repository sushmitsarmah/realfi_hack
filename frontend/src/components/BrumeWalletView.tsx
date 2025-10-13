import { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { isBrumeInstalled, brumeWalletInfo } from '@/lib/brume-connector'

export function BrumeWalletView() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [brumeDetected, setBrumeDetected] = useState(false)

  useEffect(() => {
    // Check if Brume wallet is installed
    setBrumeDetected(isBrumeInstalled())
  }, [])

  const handleConnectBrume = () => {
    // Try to connect using injected connector
    const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'brume')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border-purple-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌫️</span>
              <div>
                <CardTitle className="text-gray-100">Brume Wallet Integration</CardTitle>
                <CardDescription className="text-gray-400">
                  Privacy-first Ethereum wallet with built-in Tor routing
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${brumeDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">
                {brumeDetected ? 'Brume Detected' : 'Not Installed'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      {brumeDetected && (
        <Card className="bg-gray-800/50 border-green-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">✓ Brume Wallet Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="p-4 bg-green-900/20 border border-green-700 rounded">
                <p className="text-green-400 font-semibold mb-2">Connected to Brume Wallet</p>
                <p className="text-sm text-gray-300">Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ All transactions are routed through Tor for maximum privacy
                </p>
              </div>
            ) : (
              <Button
                onClick={handleConnectBrume}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Connect Brume Wallet
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* About Brume Wallet */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">What is Brume Wallet?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            {brumeWalletInfo.description} - A perfect match for ResistNet's privacy-focused architecture.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brumeWalletInfo.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-gray-900/50 rounded">
                <span className="text-purple-400">✓</span>
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Brume + ResistNet */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Why Brume + ResistNet?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700 rounded">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="text-purple-300 font-semibold mb-1">Double Privacy Layer</h3>
                  <p className="text-sm text-gray-400">
                    Brume's Tor routing + ResistNet's Nimbus RPC ensures your transactions and activities are completely private
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700 rounded">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="text-blue-300 font-semibold mb-1">Censorship Resistance</h3>
                  <p className="text-sm text-gray-400">
                    Both Brume and ResistNet are designed to be unstoppable - combining forces for maximum resilience
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔓</span>
                <div>
                  <h3 className="text-green-300 font-semibold mb-1">Open Source Security</h3>
                  <p className="text-sm text-gray-400">
                    Both projects are fully open-source and auditable - no hidden backdoors or tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      {!brumeDetected && (
        <Card className="bg-gray-800/50 border-yellow-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">Install Brume Wallet</CardTitle>
            <CardDescription className="text-gray-400">
              Choose your platform and install Brume to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={brumeWalletInfo.downloads.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-600 rounded transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🌐</span>
                  <h3 className="text-gray-200 font-semibold">Chrome Extension</h3>
                </div>
                <p className="text-sm text-gray-500">Install from Chrome Web Store</p>
              </a>

              <a
                href={brumeWalletInfo.downloads.firefox}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-600 rounded transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🦊</span>
                  <h3 className="text-gray-200 font-semibold">Firefox Add-on</h3>
                </div>
                <p className="text-sm text-gray-500">Install from Firefox Add-ons</p>
              </a>

              <a
                href={brumeWalletInfo.downloads.android}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-600 rounded transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-gray-200 font-semibold">Android App</h3>
                </div>
                <p className="text-sm text-gray-500">Download APK or install from F-Droid</p>
              </a>

              <a
                href={brumeWalletInfo.downloads.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-purple-600 rounded transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📱</span>
                  <h3 className="text-gray-200 font-semibold">iOS App</h3>
                </div>
                <p className="text-sm text-gray-500">Install via TestFlight or AltStore</p>
              </a>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded">
              <p className="text-sm text-blue-300 mb-2">📚 Need help?</p>
              <a
                href={brumeWalletInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                View Brume Wallet documentation and guides →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 border-b border-gray-700">
              <span className="text-gray-400">Network Support</span>
              <span className="text-gray-200">Ethereum & EVM chains</span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-700">
              <span className="text-gray-400">Privacy Layer</span>
              <span className="text-gray-200">Built-in Tor routing</span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-700">
              <span className="text-gray-400">License</span>
              <span className="text-gray-200">MIT (Open Source)</span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-700">
              <span className="text-gray-400">Integration Method</span>
              <span className="text-gray-200">Standard Ethereum Provider (window.ethereum)</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-gray-400">Repository</span>
              <a
                href={brumeWalletInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                github.com/brumeproject/wallet
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
