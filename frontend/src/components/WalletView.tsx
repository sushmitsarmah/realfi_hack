import React from 'react'

interface WalletViewProps {
  children?: React.ReactNode
}

export default function WalletView({ children }: WalletViewProps) {
  return (
    <div className="wallet-view">
      <h2>Wallet</h2>
      {children}
    </div>
  )
}