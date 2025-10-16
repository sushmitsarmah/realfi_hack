// lib/brume-connector.ts
import { injected } from 'wagmi/connectors'

/**
 * Create a custom Brume wallet connector
 * For Wagmi v2, we extend the injected connector
 */
export function brumeWallet() {
  return injected({
    target() {
      return {
        id: 'brume',
        name: 'Brume Wallet',
        provider(window) {
          const ethereum = window?.ethereum

          // If multiple wallets are installed, find Brume specifically
          if (ethereum?.providers?.length) {
            return (
              ethereum.providers.find((p: any) => p.isBrume || p.isBrumeWallet) ||
              ethereum.providers[0]
            )
          }

          return ethereum
        },
      }
    },
  })
}

/**
 * Check if Brume wallet is installed in the browser
 */
export function isBrumeInstalled(): boolean {
  if (typeof window === 'undefined') return false

  const ethereum = (window as any).ethereum
  if (!ethereum) return false

  // Check for Brume-specific properties
  if (ethereum.isBrume || ethereum.isBrumeWallet) return true

  // Check in providers array if multiple wallets installed
  if (ethereum.providers?.length) {
    return ethereum.providers.some(
      (p: any) => p.isBrume || p.isBrumeWallet
    )
  }

  return false
}

/**
 * Get Brume wallet download/installation info
 */
export const brumeWalletInfo = {
  name: 'Brume Wallet',
  description: 'The private Ethereum wallet with built-in Tor',
  icon: '🌫️',
  website: 'https://brume.money',
  github: 'https://github.com/brumeproject/wallet',
  features: [
    'Built-in Tor routing for privacy',
    'Open-source (MIT License)',
    'Multi-platform support',
    'No data collection',
    'Self-custody',
    'Browser extension available',
  ],
  downloads: {
    chrome: 'https://chromewebstore.google.com/detail/brume-wallet/oljgnlammonjehmmfahdjgjhjclpockd',
    firefox: 'https://addons.mozilla.org/en-US/firefox/addon/brumewallet/',
    safari: 'https://testflight.apple.com/join/7JuOKEr7',
    android: 'https://github.com/brumeproject/wallet/releases',
    ios: 'https://testflight.apple.com/join/7JuOKEr7',
  },
  documentation: 'https://github.com/brumeproject/wallet/blob/master/README.md',
}
