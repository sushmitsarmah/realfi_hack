import { Header } from '@/components/layout/Header'
import { NillionView } from '@/components/NillionView'

function NillionPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <NillionView />
      </div>
    </>
  )
}

export default NillionPage
