'use client'

import Link from 'next/link'

export default function AuthError() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Authentication Failed
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Something went wrong during sign-in. Check the browser console for details.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  )
}