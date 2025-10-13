import { Header } from '@/components/layout/Header'
import { VaultView } from '@/components/VaultView'

function VaultPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <VaultView />
      </div>
    </>
  )
}

export default VaultPage
