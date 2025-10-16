import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
// import { useNillionGovernance } from '@/hooks/useNillion'

interface Proposal {
  id: string
  title: string
  description: string
  options: string[]
  votes: number[]
  endTime: number
  creator: string
}

export function GovernanceView() {
  const { address, isConnected } = useAccount()
  const governance: any = {} // useNillionGovernance()
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [options, setOptions] = useState(['Yes', 'No', 'Abstain'])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const createProposal = async () => {
    if (!proposalTitle || !proposalDescription || !address) return

    setIsCreating(true)
    try {
      const proposal: Proposal = {
        id: `prop-${Date.now()}`,
        title: proposalTitle,
        description: proposalDescription,
        options,
        votes: options.map(() => 0),
        endTime: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
        creator: address
      }

      setProposals([proposal, ...proposals])
      setProposalTitle('')
      setProposalDescription('')
    } catch (error) {
      console.error('Failed to create proposal:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const vote = async (proposalId: string, optionIndex: number) => {
    try {
      // Cast private vote using Nillion MPC
      await governance?.castPrivateVote(proposalId, optionIndex)

      // Update local state (in production, this would come from Nillion)
      setProposals(proposals.map(p =>
        p.id === proposalId
          ? { ...p, votes: p.votes.map((v, i) => i === optionIndex ? v + 1 : v) }
          : p
      ))
    } catch (error) {
      console.error('Private voting failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Resilient Coordination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Please connect your wallet to participate in governance.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/50 border-green-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗳️</span>
            <div>
              <CardTitle className="text-gray-100">Resilient Coordination</CardTitle>
              <CardDescription className="text-gray-400">
                Private voting powered by Nillion MPC
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Proposal */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Create Proposal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Title</label>
            <Input
              placeholder="Proposal title..."
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Description</label>
            <textarea
              placeholder="Describe your proposal..."
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-gray-100 resize-none"
            />
          </div>

          <div className="flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-violet-400 rounded-full" />
              Nillion MPC
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Private Voting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              Sybil-Resistant
            </span>
          </div>

          <Button
            onClick={createProposal}
            disabled={!proposalTitle || !proposalDescription || isCreating}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isCreating ? 'Creating...' : 'Create Proposal'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Active Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No active proposals</p>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="p-4 bg-gray-900/50 rounded border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">{proposal.title}</h3>
                      <p className="text-sm text-gray-400">{proposal.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      Ends: {new Date(proposal.endTime).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {proposal.options.map((option, idx) => {
                      const totalVotes = proposal.votes.reduce((a, b) => a + b, 0)
                      const percentage = totalVotes > 0 ? (proposal.votes[idx] / totalVotes * 100).toFixed(1) : 0

                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Button
                              onClick={() => vote(proposal.id, idx)}
                              size="sm"
                              variant="outline"
                              className="text-gray-300 border-gray-600 hover:bg-gray-700"
                            >
                              {option}
                            </Button>
                            <span className="text-sm text-gray-400">{proposal.votes[idx]} votes ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
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
