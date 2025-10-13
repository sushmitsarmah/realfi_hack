import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Header({ action }: { action?: ReactNode }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/wallet', label: 'Wallet', icon: '🔐' },
    { path: '/brume', label: 'Brume', icon: '🌫️' },
    { path: '/messenger', label: 'Messenger', icon: '💬' },
    { path: '/publishing', label: 'Publish', icon: '📢' },
    { path: '/governance', label: 'Governance', icon: '🗳️' },
    { path: '/vault', label: 'Vault', icon: '🔒' },
    { path: '/nillion', label: 'Nillion', icon: '🔮' },
    { path: '/identity', label: 'Identity', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="sticky top-0 z-10 box-border border-b-1 border-gray-700 border-solid bg-gray-900/95 backdrop-blur">
      <div className="m-auto h-full max-w-7xl flex items-center justify-between lt-sm:px-4 sm:px-8 py-3">
        <Link to="/" className="flex cursor-pointer items-center font-bold gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl text-gray-100">ResistNet</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded transition-all flex items-center gap-2 text-sm ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {action}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700">
        <nav className="flex overflow-x-auto gap-1 px-4 py-2">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded transition-all flex items-center gap-2 text-xs whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
