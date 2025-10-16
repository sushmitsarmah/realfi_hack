import { createConfig, http } from 'wagmi'
import { bsc, bscTestnet, goerli, mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { brumeWallet } from './lib/brume-connector'
// import { keplrWallet } from './lib/keplr-connector'

// Use local Nimbus RPC if available, otherwise fallback to public RPC
const nimbusRpcUrl = import.meta.env.VITE_NIMBUS_RPC_URL

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, goerli, mainnet, sepolia],
  transports: {
    [mainnet.id]: http(nimbusRpcUrl),
    [sepolia.id]: http(nimbusRpcUrl),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [goerli.id]: http(),
  },
  connectors: [
    brumeWallet(),
    injected({ target: 'metaMask' }),
    // keplrWallet(),
    walletConnect({
      projectId: 'f18c88f1b8f4a066d3b705c6b13b71a8',
    }),
  ],
})
