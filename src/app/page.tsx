import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Portflyo</h1>
        <p className="text-gray-600 mb-8">Your professional portfolio platform</p>
        <Link 
          href="/templates/template1"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
        >
          View Teacher Portfolio Template
        </Link>
      </div>
    </div>
  )
} 