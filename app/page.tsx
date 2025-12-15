'use client'

import AuthButton from '@/components/auth/AuthButton'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Real-time Voting App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sign in to create and vote on polls
          </p>
          <AuthButton />
        </div>
      </div>
    </main>
  )
}