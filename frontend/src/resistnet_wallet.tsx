import React, { useState } from 'react';
import { 
  Wallet, Send, MessageSquare, Shield, Users, Settings, 
  FileText, Vote, AlertTriangle, Lock, Eye, EyeOff,
  Upload, Download, CheckCircle, XCircle, Clock,
  Globe, Radio, Database, Key, Award, Bell
} from 'lucide-react';

const ResistNetWallet = () => {
  const [activeTab, setActiveTab] = useState('wallet');
  const [balance, setBalance] = useState('1.2345');
  const [address] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  
  // Identity data
  const [identity] = useState({
    gitcoinScore: 28,
    humanityScore: 85,
    combinedScore: 63,
    isVerifiedHuman: true,
    badges: ['Verified Human', 'Trusted Contributor', 'Developer']
  });
  
  // Network status
  const [networkStatus] = useState({
    tor: 'connected',
    waku: 'connected',
    nimbus: 'connected',
    nillion: 'connected',
    ipfs: 'connected'
  });
  
  // Sample data
  const [publications] = useState([
    { 
      id: 1, 
      title: 'Investigative Report: Corruption Evidence', 
      author: '0x1234...5678',
      score: 42,
      category: 'evidence',
      witnesses: 5,
      timestamp: '2h ago'
    },
    { 
      id: 2, 
      title: 'Emergency Alert: Network Shutdown Imminent', 
      author: '0x8765...4321',
      score: 38,
      category: 'alert',
      witnesses: 12,
      timestamp: '5h ago'
    }
  ]);
  
  const [proposals] = useState([
    {
      id: 1,
      title: 'Allocate funds for journalist protection',
      votes: 156,
      deadline: '2 days',
      status: 'active'
    },
    {
      id: 2,
      title: 'Establish emergency communication protocol',
      votes: 203,
      deadline: '5 days',
      status: 'active'
    }
  ]);
  
  const [evidenceVault] = useState([
    {
      id: 1,
      title: 'Photo Evidence - Protest Documentation',
      type: 'photo',
      size: '4.2 MB',
      witnesses: 3,
      encrypted: true,
      timestamp: '1d ago'
    },
    {
      id: 2,
      title: 'Video - Interview with Whistleblower',
      type: 'video',
      size: '128 MB',
      witnesses: 7,
      encrypted: true,
      timestamp: '3d ago'
    }
  ]);

  const StatusIndicator = ({ status, label, icon: Icon }) => (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-green-500' : 
        status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
        'bg-red-500'
      }`} />
      <Icon className="w-3 h-3 text-gray-400" />
      <span className="text-gray-400">{label}</span>
    </div>
  );

  const WalletTab = () => (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">Identity Score</span>
              {identity.isVerifiedHuman && (
                <CheckCircle className="w-4 h-4 text-green-300" />
              )}
            </div>
            <p className="text-4xl font-bold">{identity.combinedScore}</p>
            <div className="flex gap-3 mt-2 text-xs">
              <span>Gitcoin: {identity.gitcoinScore}</span>
              <span>Humanity: {identity.humanityScore}</span>
            </div>
          </div>
          <Award className="w-8 h-8 opacity-80" />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {identity.badges.map((badge, idx) => (
            <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-xs">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-400">Private Balance</p>
            <p className="text-3xl font-bold mt-2">{balance} ETH</p>
            <p className="text-sm text-gray-400 mt-1">≈ $4,105.89 USD</p>
          </div>
          <Eye className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white" />
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3 mt-4">
          <p className="text-xs text-gray-400 mb-1">Your Address</p>
          <div className="flex justify-between items-center">
            <p className="font-mono text-xs">{address}</p>
            <button className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 text-center">
          <Send className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Send Private</p>
        </button>
        <button className="bg-green-600 hover:bg-green-700 rounded-xl p-4 text-center">
          <Upload className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Upload Evidence</p>
        </button>
      </div>
    </div>
  );

  const PublishingTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Censorship-Resistant Publishing</h2>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Publish
        </button>
      </div>

      {publications.map(pub => (
        <div key={pub.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{pub.title}</h3>
                {pub.category === 'alert' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {pub.witnesses} witnesses
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Score: {pub.score}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pub.timestamp}
                </span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              pub.category === 'evidence' ? 'bg-red-500/20 text-red-400' :
              pub.category === 'alert' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {pub.category}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Globe className="w-3 h-3" />
            <span>Available via: Waku P2P, IPFS, Tor</span>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
              Read Full
            </button>
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
              Witness
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const GovernanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resilient Coordination</h2>
        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Vote className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      {proposals.map(prop => (
        <div key={prop.id} className="bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold mb-2">{prop.title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Vote className="w-3 h-3" />
                  {prop.votes} votes
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Ends in {prop.deadline}
                </span>
              </div>
            </div>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
              {prop.status}
            </span>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Voting Progress</span>
              <span className="text-green-400">68% For</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Vote For
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-sm flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              Vote Against
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Private voting via Nillion MPC - your vote is encrypted
          </p>
        </div>
      ))}
    </div>
  );

  const VaultTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Secure Evidence Vault</h2>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Evidence
        </button>
      </div>

      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">
              Whistleblower Protection Active
            </p>
            <p className="text-xs text-gray-300">
              All evidence is encrypted with Nillion MPC. Only authorized viewers can access.
              Your identity is protected via Tor routing.
            </p>
          </div>
        </div>
      </div>

      {evidenceVault.map(evidence => (
        <div key={evidence.id} className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              {evidence.type === 'photo' ? (
                <FileText className="w-5 h-5 text-red-400" />
              ) : (
                <Database className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{evidence.title}</h3>
                {evidence.encrypted && (
                  <Lock className="w-3 h-3 text-green-400" />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{evidence.size}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {evidence.witnesses} witnesses
                </span>
                <span>{evidence.timestamp}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-2 mb-3 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Chain of Custody: Verified</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View
            </button>
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm flex items-center justify-center gap-2">
              <Key className="w-4 h-4" />
              Grant Access
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Network & Privacy Settings</h2>
      
      {/* Network Status */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4" />
          Network Status
        </h3>
        <div className="space-y-3">
          <StatusIndicator status={networkStatus.tor} label="Tor (Arti)" icon={Globe} />
          <StatusIndicator status={networkStatus.waku} label="Waku P2P" icon={MessageSquare} />
          <StatusIndicator status={networkStatus.nimbus} label="Nimbus RPC" icon={Database} />
          <StatusIndicator status={networkStatus.nillion} label="Nillion MPC" icon={Lock} />
          <StatusIndicator status={networkStatus.ipfs} label="IPFS Storage" icon={FileText} />
        </div>
      </div>

      {/* Identity Verification */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Identity & Reputation</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Gitcoin Passport</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400">{identity.gitcoinScore}</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Humanity Protocol</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400">{identity.humanityScore}</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm mt-2">
            Improve Your Score
          </button>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Privacy Controls</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Always use Tor routing</span>
            <input type="checkbox" checked className="w-4 h-4" readOnly />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">E2E encrypted messaging</span>
            <input type="checkbox" checked className="w-4 h-4" readOnly />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">MPC key management</span>
            <input type="checkbox" checked className="w-4 h-4" readOnly />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Anonymous voting</span>
            <input type="checkbox" checked className="w-4 h-4" readOnly />
          </label>
        </div>
      </div>

      {/* Emergency Mode */}
      <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-300">
          <AlertTriangle className="w-4 h-4" />
          Emergency Mode
        </h3>
        <p className="text-xs text-gray-300 mb-3">
          Activate during network restrictions or censorship
        </p>
        <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm font-semibold">
          Activate Emergency Protocols
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ResistNet</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-gray-400">All systems operational</p>
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'publishing' && <PublishingTab />}
        {activeTab === 'governance' && <GovernanceTab />}
        {activeTab === 'vault' && <VaultTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {[
              { id: 'wallet', icon: Wallet, label: 'Wallet' },
              { id: 'publishing', icon: FileText, label: 'Publish' },
              { id: 'governance', icon: Vote, label: 'Govern' },
              { id: 'vault', icon: Lock, label: 'Vault' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'text-purple-400 bg-purple-500/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResistNetWallet;
