/* eslint-disable @eslint-react/no-nested-component-definitions */
import { shorten } from '@did-network/dapp-sdk'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { NetworkSwitcher } from '@/components/SwitchNetworks'
import { WalletModal } from '@/components/WalletModal'

function Home() {
  const { address } = useAccount()

  const [show, setShow] = useState(false)

  const toggleModal = (e: boolean) => {
    setShow(e)
  }

  const Action = () => (
    <>
      <NetworkSwitcher />
      <WalletModal open={show} onOpenChange={toggleModal} close={() => setShow(false)}>
        {({ isLoading }) => (
          <Button className="mr-4 flex items-center">
            {isLoading && (
              <span className="i-line-md:loading-twotone-loop mr-1 h-4 w-4 inline-flex text-white" />
            )}
            {' '}
            {address ? shorten(address) : 'Connect Wallet'}
          </Button>
        )}
      </WalletModal>
    </>
  )

  const features = [
    {
      title: 'Private Wallet',
      icon: '🔐',
      description: 'MPC key management with social recovery',
      link: '/wallet'
    },
    {
      title: 'Brume Wallet',
      icon: '🌫️',
      description: 'Privacy wallet with built-in Tor routing',
      link: '/brume'
    },
    {
      title: 'Secure Messaging',
      icon: '💬',
      description: 'E2E encrypted P2P communication',
      link: '/messenger'
    },
    {
      title: 'Censorship-Resistant Publishing',
      icon: '📢',
      description: 'Unstoppable content distribution',
      link: '/publishing'
    },
    {
      title: 'Resilient Coordination',
      icon: '🗳️',
      description: 'Private voting and governance',
      link: '/governance'
    },
    {
      title: 'Evidence Vault',
      icon: '🔒',
      description: 'Encrypted storage with chain-of-custody',
      link: '/vault'
    },
    {
      title: 'Nillion Blind Computation',
      icon: '🔮',
      description: 'MPC, private voting, and encrypted storage',
      link: '/nillion'
    },
    {
      title: 'Identity & Verification',
      icon: '👤',
      description: 'Gitcoin Passport + Humanity Protocol',
      link: '/identity'
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'Configure privacy & security features',
      link: '/settings'
    }
  ]

  return (
    <>
      <Header
        action={<Action />}
      />
      <div className="relative m-auto max-w-6xl min-h-[calc(100vh-8rem)] flex-col-center justify-start pt-16 px-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">🛡️</span>
          <p
            className="bg-clip-text text-4xl font-bold lt-sm:text-2xl"
            style={{
              backgroundImage: 'linear-gradient(270deg, #60A5FA 0%, #A78BFA 100%)',
              display: 'inline-block',
              lineHeight: 1,
              WebkitTextFillColor: 'transparent',
            }}
          >
            ResistNet
          </p>
        </div>
        <p className="mt-3 text-center text-5xl font-bold lt-sm:text-3xl">Privacy-First Censorship-Resistant Platform</p>
        <p className="mt-3 text-center text-xl lt-sm:text-lg text-gray-400 max-w-2xl">
          Combining wallet functionality, secure messaging, evidence vaults, and resilient coordination tools.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.link}>
              <Card className="h-full hover:border-blue-500 transition-all cursor-pointer hover:scale-105 bg-gray-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <span className="text-gray-100">{feature.title}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-100">Why ResistNet?</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-300 max-w-5xl">
            <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl mb-2">🚫</span>
              <span className="font-semibold">Censorship-Resistant</span>
              <span className="text-xs text-gray-400 mt-1">Content on IPFS & Waku P2P</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl mb-2">🔒</span>
              <span className="font-semibold">Privacy-First</span>
              <span className="text-xs text-gray-400 mt-1">Traffic via Tor network</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl mb-2">🌫️</span>
              <span className="font-semibold">Brume Wallet</span>
              <span className="text-xs text-gray-400 mt-1">Tor-enabled wallet</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl mb-2">🔐</span>
              <span className="font-semibold">Secure</span>
              <span className="text-xs text-gray-400 mt-1">MPC key management</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl mb-2">🌐</span>
              <span className="font-semibold">Decentralized</span>
              <span className="text-xs text-gray-400 mt-1">No central servers</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t-1 border-gray-800 border-solid mt-16">
        <div className="mx-auto max-w-6xl py-6 text-center lt-sm:px-4 sm:px-8 text-gray-400">
          Built with ❤️ for a censorship-free internet
        </div>
      </div>
    </>
  )
}

export default Home
