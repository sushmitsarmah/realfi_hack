// Custom Keplr connector for wagmi
import { ChainNotConfiguredError, createConnector } from 'wagmi'
import type { CreateConnectorFn, Connector } from 'wagmi'

declare global {
  interface Window {
    keplr?: any
  }
}

export function keplrWallet(): CreateConnectorFn {
  return createConnector((config) => ({
    id: 'keplr',
    name: 'Keplr',
    type: 'injected' as const,

    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider()
        if (!provider) {
          throw new Error('Keplr extension not found')
        }

        // Check if Keplr has Ethereum support
        if (!provider.request) {
          throw new Error('Keplr Ethereum support not available')
        }

        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        })

        let currentChainId = await this.getChainId()
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain({ chainId })
          currentChainId = chain.id
        }

        return {
          accounts: accounts as `0x${string}`[],
          chainId: currentChainId,
        }
      } catch (error) {
        console.error('Keplr connection error:', error)
        throw error
      }
    },

    async disconnect() {
      // Keplr doesn't have a disconnect method, just clear the state
      return
    },

    async getAccounts() {
      const provider = await this.getProvider()
      if (!provider) return []

      const accounts = await provider.request({
        method: 'eth_accounts',
      })
      return accounts as `0x${string}`[]
    },

    async getChainId() {
      const provider = await this.getProvider()
      if (!provider) throw new Error('Keplr not found')

      const chainId = await provider.request({
        method: 'eth_chainId',
      })
      return Number(chainId)
    },

    async getProvider() {
      if (typeof window === 'undefined') return undefined

      // Keplr injects into window.keplr
      return window.keplr?.ethereum || window.keplr
    },

    async isAuthorized() {
      try {
        const accounts = await this.getAccounts()
        return !!accounts.length
      } catch {
        return false
      }
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider()
      if (!provider) throw new Error('Keplr not found')

      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) throw new ChainNotConfiguredError()

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
        return chain
      } catch (error: any) {
        // Chain not added, try to add it
        if (error.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.default.http[0]],
                blockExplorerUrls: chain.blockExplorers
                  ? [chain.blockExplorers.default.url]
                  : undefined,
              },
            ],
          })
          return chain
        }
        throw error
      }
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect')
      } else {
        config.emitter.emit('change', {
          accounts: accounts as `0x${string}`[],
        })
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain)
      config.emitter.emit('change', { chainId })
    },

    onDisconnect() {
      config.emitter.emit('disconnect')
    },

    async setup() {
      const provider = await this.getProvider()
      if (!provider) return

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect)
      }
    },
  }))
}
