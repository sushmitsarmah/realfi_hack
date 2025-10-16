import { useEffect, useState } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import routes from '~react-pages'
import {
  createClient,
  NillionProvider,
  getKeplr,
} from "@nillion/client-react-hooks"
import type { VmClient } from "@nillion/client-vms"
import { TestnetOptions } from 'node_modules/@nillion/client-react-hooks/dist/create-client'
import type { Keplr } from "@keplr-wallet/types"

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to)
  }, [navigate, to])
  return null
}

function App() {
  const [client, setClient] = useState<VmClient | null>(null)
  const [keplr, setKeplr] = useState<Keplr | null>(null)
  const [isNillionAvailable, setIsNillionAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toasts } = useToast()

  const initKeplrClient = async () => {
    console.log('🔑 Initializing Nillion with Keplr...')
    if (!keplr) return
    
    try {
      const opts: TestnetOptions = {
        network: "testnet",
        seed: "foobarbaz",
        keplr,
        config: {
          bootnodeUrl: "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz",
          chainUrl: "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz",
          chainId: "nillion-chain-testnet-1",
        }
      }
      const client = await createClient(opts)
      setClient(client)
      setIsNillionAvailable(true)
      console.log('✅ Nillion connected with Keplr')
    } catch (error) {
      console.warn('❌ Failed to initialize Nillion:', error)
      setIsNillionAvailable(false)
    }
  }

  const checkKeplrWallet = async () => {
    try {
      const keplr = await getKeplr()
      if (keplr) {
        setKeplr(keplr)
        console.log('✅ Keplr wallet detected')
      } else {
        console.log('ℹ️ Keplr not installed - app will work without Nillion features')
        setIsNillionAvailable(false)
      }
    } catch (error) {
      console.warn('ℹ️ Keplr check failed:', error)
      setIsNillionAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // checkKeplrWallet()
  }, [])

  useEffect(() => {
    if (keplr) {
      initKeplrClient()
    } else {
      setIsLoading(false)
    }
  }, [keplr])

  // Don't block app loading - render immediately
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p>Initializing app...</p>
  //       </div>
  //     </div>
  //   )
  // }

  const appContent = (
    <>
      {useRoutes([...routes, { path: '*', element: <Redirect to="/" /> }])}
      <ToastProvider duration={2000}>
        {toasts.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </>
  )

  // Conditionally wrap with NillionProvider only if available
  // if (isNillionAvailable && client) {
    // return appContent
      // <NillionProvider client={client}>
        // {appContent}
      // </NillionProvider>
    // )
  // }

  // Render without Nillion if not available
  return appContent
}

export default App