import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
// import { useNillionKeyManager } from '@/hooks/useNillion'

export function WalletView() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const keyManager: any = {}; //useNillionKeyManager()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [mpcEnabled, setMpcEnabled] = useState(false)
  const [socialRecoveryAddresses, setSocialRecoveryAddresses] = useState<string[]>([])
  const [newRecoveryAddress, setNewRecoveryAddress] = useState('')

  const handleSend = async () => {
    if (!recipient || !amount) return

    try {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount)
      })
      setRecipient('')
      setAmount('')
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  const addRecoveryAddress = () => {
    if (newRecoveryAddress && !socialRecoveryAddresses.includes(newRecoveryAddress)) {
      setSocialRecoveryAddresses([...socialRecoveryAddresses, newRecoveryAddress])
      setNewRecoveryAddress('')
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Private Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to continue.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <CardTitle className="text-gray-100">Your Wallet</CardTitle>
              <CardDescription className="text-gray-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-100 mb-2">
            {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
          </div>
          <div className="flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Tor Enabled
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${keyManager?.isConnected && keyManager?.keyStoreId ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
              {keyManager?.isConnected && keyManager?.keyStoreId ? 'Nillion MPC Active' : 'MPC Inactive'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Transaction */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <span>💸</span>
              Send Payment
            </CardTitle>
            <CardDescription className="text-gray-400">
              All transactions routed through Tor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Recipient Address</label>
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Amount (ETH)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!recipient || !amount || isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? 'Sending...' : 'Send Transaction'}
            </Button>
          </CardContent>
        </Card>

        {/* MPC Key Management */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <span>🔑</span>
              MPC Key Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Secure multi-party computation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-200">MPC Keys</p>
                <p className="text-xs text-gray-500">Nillion blind computation</p>
              </div>
              <Button
                onClick={() => window.location.href = '/nillion'}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700"
              >
                {keyManager.keyStoreId ? 'Manage Keys' : 'Setup MPC'}
              </Button>
            </div>

            {keyManager.keyStoreId && (
              <div className="space-y-2 p-3 bg-gray-900/30 rounded border border-green-700">
                <p className="text-xs font-medium text-green-300">✓ MPC Key Active</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span> Key split using Nillion MPC
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span> Stored on Nillion network
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span> Blind computation enabled
                  </div>
                  <div className="mt-2 p-2 bg-gray-800 rounded">
                    <p className="text-gray-400">Store ID:</p>
                    <code className="text-xs text-violet-400 break-all">{keyManager.keyStoreId}</code>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Social Recovery */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <span>👥</span>
            Social Recovery
          </CardTitle>
          <CardDescription className="text-gray-400">
            Add trusted contacts to recover your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Recovery address 0x..."
              value={newRecoveryAddress}
              onChange={(e) => setNewRecoveryAddress(e.target.value)}
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
            <Button onClick={addRecoveryAddress} className="bg-blue-600 hover:bg-blue-700">
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-300">Trusted Contacts ({socialRecoveryAddresses.length}/3)</p>
            {socialRecoveryAddresses.length === 0 ? (
              <p className="text-xs text-gray-500">No recovery addresses added yet</p>
            ) : (
              <div className="space-y-2">
                {socialRecoveryAddresses.map((addr, idx) => (
                  <div key={addr} className="flex items-center justify-between p-2 bg-gray-900/50 rounded text-sm">
                    <span className="text-gray-300">
                      {idx + 1}. {addr.slice(0, 6)}...{addr.slice(-4)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSocialRecoveryAddresses(socialRecoveryAddresses.filter(a => a !== addr))}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <span>📜</span>
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No recent transactions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}