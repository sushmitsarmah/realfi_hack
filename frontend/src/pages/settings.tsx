import { Header } from '@/components/layout/Header'
import { SettingsView } from '@/components/SettingsView'

function SettingsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <SettingsView />
      </div>
    </>
  )
}

export default SettingsPage
