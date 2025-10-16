import { createConfig, http } from 'wagmi'
import { bsc, bscTestnet, goerli, mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { brumeWallet } from './lib/brume-connector'

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, goerli, mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [goerli.id]: http(),
  },
  connectors: [
    brumeWallet(),
    injected({ target: 'metaMask' }),
    injected({
      target: 'keplr',
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: 'f18c88f1b8f4a066d3b705c6b13b71a8',
    }),
  ],
})
