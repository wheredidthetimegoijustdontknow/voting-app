'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthButton() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [clientReady, setClientReady] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
        setClientReady(true)
        console.log('Supabase client ready. Current user:', user?.email || 'none')
      } catch (err) {
        console.error('Error checking user:', err)
        setClientReady(false)
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSignInWithGoogle = async () => {
    console.log('Sign in button clicked')
    console.log('Client ready:', clientReady)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!clientReady) {
      console.error('Supabase client not ready')
      return
    }

    setLoading(true)

    try {
      console.log('Calling signInWithOAuth...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('OAuth response:', { data, error })

      if (error) {
        console.error('OAuth error:', error)
      }
    } catch (err) {
      console.error('Exception during OAuth:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  if (loading) {
    return <button disabled className="px-4 py-2 bg-gray-400 text-white rounded">Loading...</button>
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Signed in as: <strong>{user.email || user.id}</strong>
        </span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignInWithGoogle}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Sign in with Google
    </button>
  )
}