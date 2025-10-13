import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Publication {
  id: string
  title: string
  content: string
  author: string
  timestamp: number
  ipfsHash?: string
}

export function PublishingView() {
  const { address, isConnected } = useAccount()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('article')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publications, setPublications] = useState<Publication[]>([])

  const handlePublish = async () => {
    if (!title || !content || !address) return

    setIsPublishing(true)
    try {
      // Simulate publishing to IPFS + Waku
      const publication: Publication = {
        id: `pub-${Date.now()}`,
        title,
        content,
        author: address,
        timestamp: Date.now(),
        ipfsHash: `Qm${Math.random().toString(36).substring(7)}`
      }

      setPublications([publication, ...publications])
      setTitle('')
      setContent('')
    } catch (error) {
      console.error('Publishing failed:', error)
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
          <div className="flex items-center gap-3">
            <span className="text-3xl">📢</span>
            <div>
              <CardTitle className="text-gray-100">Censorship-Resistant Publishing</CardTitle>
              <CardDescription className="text-gray-400">
                Publish to IPFS + Waku P2P network
              </CardDescription>
            </div>
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
              onChange={(e) => setCategory(e.target.value)}
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
            disabled={!title || !content || isPublishing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish to Network'}
          </Button>
        </CardContent>
      </Card>

      {/* Publications List */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Publications</CardTitle>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No publications yet</p>
          ) : (
            <div className="space-y-4">
              {publications.map((pub) => (
                <div key={pub.id} className="p-4 bg-gray-900/50 rounded border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-100">{pub.title}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(pub.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{pub.content}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                      IPFS: {pub.ipfsHash?.slice(0, 8)}...
                    </span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-300">
                      View
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-300">
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
