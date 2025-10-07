import React from 'react'

interface LoadingScreenProps {
  children?: React.ReactNode
}

export default function LoadingScreen({ children }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">Loading...</div>
      {children}
    </div>
  )
}