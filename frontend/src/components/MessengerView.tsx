import React from 'react'

interface MessengerViewProps {
  children?: React.ReactNode
}

export default function MessengerView({ children }: MessengerViewProps) {
  return (
    <div className="messenger-view">
      <h2>Messenger</h2>
      {children}
    </div>
  )
}