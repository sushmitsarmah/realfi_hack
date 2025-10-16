import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CensorshipResistantPublisher, type Publication } from '@/lib/censorship-resistant-publisher'
import { humanPassportService } from '@/lib/human-passport'

export function PublishingView() {
  const { address, isConnected } = useAccount()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Publication['category']>('article')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publications, setPublications] = useState<Publication[]>([])
  const [publisher, setPublisher] = useState<CensorshipResistantPublisher | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [publisherReady, setPublisherReady] = useState(false)
  const [hasIPFS, setHasIPFS] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [networkPublications, setNetworkPublications] = useState<Publication[]>([])
  const [subscribeAddress, setSubscribeAddress] = useState('')
  const [activeView, setActiveView] = useState<'my' | 'network'>('my')
  const [authorScores, setAuthorScores] = useState<Record<string, number>>({})
  const [minScore, setMinScore] = useState<number>(0)
  const [passportManager] = useState(() => new humanPassportService())

  useEffect(() => {
    // Load publications from localStorage
    const stored = localStorage.getItem('publications')
    if (stored) {
      setPublications(JSON.parse(stored))
    }
  }, [])

  const initializePublisher = async () => {
    if (publisher) return

    setIsInitializing(true)
    try {
      const ipfsUrl = import.meta.env.VITE_IPFS_API_URL || 'http://localhost:5001'
      const onionAddress = import.meta.env.VITE_ONION_ADDRESS
      const nimbusRpcUrl = import.meta.env.VITE_NIMBUS_RPC_URL

      const pub = new CensorshipResistantPublisher(ipfsUrl, onionAddress, nimbusRpcUrl)
      await pub.initialize()
      setPublisher(pub)
      setPublisherReady(pub.isReady())
      setHasIPFS(pub.hasIPFS())
    } catch (error) {
      console.error('Failed to initialize publisher:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const fetchAuthorScore = async (authorAddress: string) => {
    if (authorScores[authorAddress] !== undefined) return

    try {
      const scoreData = await passportManager.getScore(authorAddress)
      setAuthorScores(prev => ({
        ...prev,
        [authorAddress]: scoreData.score
      }))
    } catch (error) {
      console.error(`Failed to fetch score for ${authorAddress}:`, error)
      setAuthorScores(prev => ({
        ...prev,
        [authorAddress]: 0
      }))
    }
  }

  const subscribeToFeed = async () => {
    if (!publisher) return

    try {
      const success = await publisher.subscribeToPublications((pub) => {
        setNetworkPublications(prev => {
          // Avoid duplicates
          if (prev.some(p => p.id === pub.id)) return prev
          return [pub, ...prev]
        })
        // Fetch author's Passport score
        fetchAuthorScore(pub.author)
      })

      if (success) {
        setIsSubscribed(true)
        console.log('✅ Subscribed to publication feed')

        // Also load historical publications
        const history = await publisher.getPublications(20)
        setNetworkPublications(history)

        // Fetch scores for all authors
        history.forEach(pub => fetchAuthorScore(pub.author))
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  const subscribeToAddress = async () => {
    if (!publisher || !subscribeAddress) return

    try {
      const success = await publisher.subscribeToAuthor(subscribeAddress, (pub) => {
        setNetworkPublications(prev => {
          if (prev.some(p => p.id === pub.id)) return prev
          return [pub, ...prev]
        })
        // Fetch author's Passport score
        fetchAuthorScore(pub.author)
      })

      if (success) {
        setIsSubscribed(true)
        console.log(`✅ Subscribed to ${subscribeAddress}`)
        // Fetch score for this specific author
        fetchAuthorScore(subscribeAddress)
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  // Filter publications by minimum score
  const filteredPublications = (activeView === 'my' ? publications : networkPublications)
    .filter(pub => {
      if (activeView === 'my') return true // Don't filter own publications
      const score = authorScores[pub.author] ?? 0
      return score >= minScore
    })

  const handlePublish = async () => {
    if (!title || !content || !address || !publisher) return

    setIsPublishing(true)
    try {
      console.log('🚀 Starting publication...')
      const publication = await publisher.publish(
        title,
        content,
        category,
        address
      )

      const updatedPubs = [publication, ...publications]
      setPublications(updatedPubs)
      localStorage.setItem('publications', JSON.stringify(updatedPubs))

      setTitle('')
      setContent('')

      console.log('✅ Publication complete!')
    } catch (error) {
      console.error('❌ Publishing failed:', error)
      alert('Publishing failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsPublishing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Censorship-Resistant Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to publish content.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📢</span>
              <div>
                <CardTitle className="text-gray-100">Censorship-Resistant Publishing</CardTitle>
                <CardDescription className="text-gray-400">
                  Publish to IPFS + Waku P2P network
                </CardDescription>
              </div>
            </div>
            {!publisherReady ? (
              <Button
                onClick={initializePublisher}
                disabled={isInitializing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isInitializing ? 'Connecting...' : 'Connect Publisher'}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Ready</span>
                {hasIPFS && <span className="text-blue-400 ml-2">• IPFS Connected</span>}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Publish Form */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Create Publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Title</label>
            <Input
              placeholder="Enter title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Publication['category'])}
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-100"
            >
              <option value="article">Article</option>
              <option value="evidence">Evidence</option>
              <option value="report">Report</option>
              <option value="investigation">Investigation</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Content</label>
            <textarea
              placeholder="Write your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-gray-100 resize-none"
            />
          </div>

          <div className="flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              IPFS Storage
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              Waku Distribution
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full" />
              Tor Routing
            </span>
          </div>

          <Button
            onClick={handlePublish}
            disabled={!title || !content || isPublishing || !publisherReady}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isPublishing ? 'Publishing...' : publisherReady ? 'Publish to Network' : 'Connect Publisher First'}
          </Button>
        </CardContent>
      </Card>

      {/* Subscribe to Network */}
      {publisherReady && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100">Subscribe to Publications</CardTitle>
            <CardDescription className="text-gray-400">
              Listen for publications from the Waku network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={subscribeToFeed}
                disabled={isSubscribed}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubscribed ? '✓ Subscribed to All' : 'Subscribe to All Publications'}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="0x... (author address)"
                value={subscribeAddress}
                onChange={(e) => setSubscribeAddress(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
              <Button
                onClick={subscribeToAddress}
                disabled={!subscribeAddress}
                className="bg-blue-600 hover:bg-blue-700 px-2 w-60"
              >
                Subscribe to Author
              </Button>
            </div>

            {isSubscribed && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Listening for publications...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publications List */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-gray-100">Publications</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeView === 'my' ? 'default' : 'ghost'}
                onClick={() => setActiveView('my')}
                className={activeView === 'my' ? 'bg-purple-600' : ''}
              >
                My Publications ({publications.length})
              </Button>
              <Button
                size="sm"
                variant={activeView === 'network' ? 'default' : 'ghost'}
                onClick={() => setActiveView('network')}
                className={activeView === 'network' ? 'bg-purple-600' : ''}
              >
                Network Feed ({networkPublications.length})
              </Button>
            </div>
          </div>

          {/* Score Filter - Only show for Network Feed */}
          {activeView === 'network' && networkPublications.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                Min Passport Score:
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-24 bg-gray-900 border-gray-600 text-gray-100"
              />
              <span className="text-xs text-gray-400">
                ({filteredPublications.length} of {networkPublications.length} shown)
              </span>
              {minScore > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMinScore(0)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredPublications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              {activeView === 'my'
                ? 'No publications yet'
                : minScore > 0
                  ? `No publications found with score >= ${minScore}. Try lowering the filter.`
                  : 'No publications received yet. Subscribe to the feed above!'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPublications.map((pub) => {
                const authorScore = authorScores[pub.author]
                const isLoadingScore = activeView === 'network' && authorScore === undefined

                return (
                  <div key={pub.id} className="p-4 bg-gray-900/50 rounded border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100">{pub.title}</h3>
                        {activeView === 'network' && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Author: {pub.author.slice(0, 6)}...{pub.author.slice(-4)}
                            </span>
                            {isLoadingScore ? (
                              <span className="text-xs text-gray-400 italic">Loading score...</span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                authorScore >= 20 ? 'bg-green-600/20 text-green-400' :
                                authorScore >= 10 ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-gray-600/20 text-gray-400'
                              }`}>
                                Passport Score: {authorScore.toFixed(1)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(pub.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{pub.content}</p>
                    <div className="flex gap-2 text-xs items-center">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                        IPFS: {pub.ipfsHash?.slice(0, 8)}...
                      </span>
                    {pub.ipfsHash?.startsWith('Qm') || pub.ipfsHash?.startsWith('bafy') ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-300"
                          onClick={() => window.open(`https://ipfs.io/ipfs/${pub.ipfsHash}`, '_blank')}
                        >
                          View on IPFS
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-300"
                          onClick={() => window.open(`http://localhost:8080/ipfs/${pub.ipfsHash}`, '_blank')}
                        >
                          View Local
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">(Waku only)</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-gray-300"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://ipfs.io/ipfs/${pub.ipfsHash}`)
                        alert('IPFS link copied!')
                      }}
                    >
                      Copy Link
                    </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
