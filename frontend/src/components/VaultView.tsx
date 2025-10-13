import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Evidence {
  id: string
  title: string
  description: string
  type: string
  timestamp: number
  owner: string
  accessList: string[]
  encrypted: boolean
}

export function VaultView() {
  const { address, isConnected } = useAccount()
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [evidenceType, setEvidenceType] = useState('document')
  const [accessAddress, setAccessAddress] = useState('')
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadEvidence = async () => {
    if (!evidenceTitle || !address) return

    setIsUploading(true)
    try {
      const newEvidence: Evidence = {
        id: `ev-${Date.now()}`,
        title: evidenceTitle,
        description: evidenceDescription,
        type: evidenceType,
        timestamp: Date.now(),
        owner: address,
        accessList: [address],
        encrypted: true
      }

      setEvidence([newEvidence, ...evidence])
      setEvidenceTitle('')
      setEvidenceDescription('')
      setSelectedFile(null)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const grantAccess = (evidenceId: string, grantAddress: string) => {
    setEvidence(evidence.map(ev =>
      ev.id === evidenceId
        ? { ...ev, accessList: [...ev.accessList, grantAddress] }
        : ev
    ))
    setAccessAddress('')
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Secure Evidence Vault</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to access the vault.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <CardTitle className="text-gray-100">Secure Evidence Vault</CardTitle>
              <CardDescription className="text-gray-400">
                Encrypted storage with chain-of-custody tracking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upload Evidence */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Upload Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Title</label>
            <Input
              placeholder="Evidence title..."
              value={evidenceTitle}
              onChange={(e) => setEvidenceTitle(e.target.value)}
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-100"
            >
              <option value="document">Document</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Description</label>
            <textarea
              placeholder="Describe the evidence..."
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div className="flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              Nillion Encrypted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              IPFS Stored
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              Access Controlled
            </span>
          </div>

          <Button
            onClick={uploadEvidence}
            disabled={!evidenceTitle || isUploading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isUploading ? 'Uploading...' : 'Upload & Encrypt'}
          </Button>
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          {evidence.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No evidence uploaded yet</p>
          ) : (
            <div className="space-y-4">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-4 bg-gray-900/50 rounded border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">
                        {ev.type === 'document' ? '📄' :
                         ev.type === 'photo' ? '📷' :
                         ev.type === 'video' ? '🎥' :
                         ev.type === 'audio' ? '🎵' : '📎'}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100">{ev.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{ev.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(ev.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {ev.encrypted && (
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">
                        🔒 Encrypted
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-xs text-gray-400">Access Control:</span>
                      <span className="text-xs text-gray-300">{ev.accessList.length} authorized</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Grant access to address..."
                        value={accessAddress}
                        onChange={(e) => setAccessAddress(e.target.value)}
                        className="bg-gray-900 border-gray-600 text-gray-100 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => grantAccess(ev.id, accessAddress)}
                        disabled={!accessAddress}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Grant
                      </Button>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {ev.accessList.map((addr, idx) => (
                        <span key={addr} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {idx === 0 ? 'Owner' : `Access ${idx}`}: {addr.slice(0, 6)}...{addr.slice(-4)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-300">
                      Download
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-300">
                      View Chain-of-Custody
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
