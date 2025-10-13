import { Header } from '@/components/layout/Header'
import { BrumeWalletView } from '@/components/BrumeWalletView'

function BrumePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <BrumeWalletView />
      </div>
    </>
  )
}

export default BrumePage
