import { Header } from '@/components/layout/Header'
import { PublishingView } from '@/components/PublishingView'

function PublishingPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PublishingView />
      </div>
    </>
  )
}

export default PublishingPage
