import { Header } from '@/components/layout/Header'
import { IdentityView } from '@/components/IdentityView'

function IdentityPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <IdentityView />
      </div>
    </>
  )
}

export default IdentityPage
