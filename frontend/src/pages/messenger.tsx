import { Header } from '@/components/layout/Header'
import MessengerView from '@/components/MessengerView'

function MessengerPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <MessengerView />
      </div>
    </>
  )
}

export default MessengerPage
