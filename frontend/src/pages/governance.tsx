import { Header } from '@/components/layout/Header'
import { GovernanceView } from '@/components/GovernanceView'

function GovernancePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <GovernanceView />
      </div>
    </>
  )
}

export default GovernancePage
