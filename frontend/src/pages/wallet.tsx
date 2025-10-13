import { Header } from '@/components/layout/Header'
import { WalletView } from '@/components/WalletView'

function WalletPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <WalletView />
      </div>
    </>
  )
}

export default WalletPage
