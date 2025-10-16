import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IdentityManager } from '@/lib/identity-manager'

interface IdentityProfile {
  address: string
  humanPPScore: number
  humanityScore?: number
  combinedScore: number
  isVerifiedHuman?: boolean
  reputation: number
  permissions: {
    canPublish: boolean
    canVote: boolean
    canUploadEvidence: boolean
    canReportAbuse: boolean
    canGrantAccess: boolean
  }
  badges: string[]
  lastVerified: number
}

export function IdentityView() {
  const { address, isConnected } = useAccount()
  const [profile, setProfile] = useState<IdentityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [identityManager, setIdentityManager] = useState<IdentityManager | null>(null)

  useEffect(() => {
    // Initialize IdentityManager - now uses backend API
    // API keys are no longer needed in frontend
    const manager = new IdentityManager('', '')
    setIdentityManager(manager)
  }, [])

  // Auto-load identity when wallet connects
  useEffect(() => {
    if (isConnected && address && identityManager && !profile) {
      loadIdentity()
    }
  }, [isConnected, address, identityManager])

  const loadIdentity = async () => {
    if (!address || !identityManager) return

    setIsLoading(true)
    try {
      const identityProfile = await identityManager.getIdentityProfile(address)
      setProfile(identityProfile)

      const verificationSuggestions = await identityManager.getVerificationSuggestions(address)
      setSuggestions(verificationSuggestions)
    } catch (error) {
      console.error('Failed to load identity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyHumanity = async () => {
    if (!address || !identityManager) return

    setIsLoading(true)
    try {
      // In real implementation, this would redirect to Humanity Protocol verification
      // const isHuman = await identityManager.verifyNotBot(address)
      // alert(isHuman ? 'You are verified as human!' : 'Verification needed')
      await loadIdentity()
    } catch (error) {
      console.error('Humanity verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Identity & Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to view your identity.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👤</span>
              <div>
                <CardTitle className="text-gray-100">Identity & Verification</CardTitle>
                <CardDescription className="text-gray-400">
                  Proof of personhood via humanPP + Humanity Protocol
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={loadIdentity}
              disabled={isLoading || !identityManager}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Loading...' : 'Refresh Identity'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!profile ? (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <span className="text-4xl">🔍</span>
              <p className="text-gray-300">Load your identity profile to get started</p>
              <Button onClick={loadIdentity} className="bg-blue-600 hover:bg-blue-700">
                Load Identity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Combined Score Overview */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-100">Identity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700">
                  <p className="text-sm text-gray-400 mb-1">Passport Score</p>
                  <p className="text-3xl font-bold text-green-400">{profile.humanPPScore.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.humanPPScore >= 20 ? '✓ Passing' : `Need ${(20 - profile.humanPPScore).toFixed(2)} more`}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700">
                  <p className="text-sm text-gray-400 mb-1">Combined Score</p>
                  <p className="text-3xl font-bold text-blue-400">{profile.combinedScore.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Overall reputation</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700">
                  <p className="text-sm text-gray-400 mb-1">Stamps Collected</p>
                  <p className="text-3xl font-bold text-purple-400">{profile.badges.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Verification badges</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className={`px-4 py-2 rounded-full ${
                  profile.isVerifiedHuman
                    ? 'bg-green-600/20 text-green-400 border border-green-600'
                    : 'bg-red-600/20 text-red-400 border border-red-600'
                }`}>
                  {profile.isVerifiedHuman ? '✓ Verified Human' : '✗ Not Verified'}
                </div>
                <span className="text-sm text-gray-500">
                  Last verified: {new Date(profile.lastVerified).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-100">Permissions</CardTitle>
              <CardDescription className="text-gray-400">
                Actions you can perform based on your identity score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(profile.permissions).map(([key, allowed]) => (
                  <div
                    key={key}
                    className={`p-3 rounded flex items-center justify-between ${
                      allowed
                        ? 'bg-green-900/20 border border-green-700'
                        : 'bg-gray-900/50 border border-gray-700'
                    }`}
                  >
                    <span className="text-sm text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^can /, '')}
                    </span>
                    <span className={allowed ? 'text-green-400' : 'text-gray-500'}>
                      {allowed ? '✓ Allowed' : '✗ Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-gray-100">Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-700 rounded-full text-sm text-yellow-400"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Actions */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-100">Verification Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-200">Human Passport</p>
                      <p className="text-xs text-gray-500">Add stamps to increase score</p>
                    </div>
                    <span className="text-2xl">🎫</span>
                  </div>
                  <Button
                    onClick={() => window.open('https://passport.xyz/', '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Open Passport
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded">
                  <p className="text-sm font-medium text-blue-400 mb-2">💡 Suggestions to improve your score:</p>
                  <ul className="space-y-1">
                    {suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
