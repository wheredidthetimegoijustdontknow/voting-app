import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('=== Auth Callback ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Error:', error)

  if (error) {
    console.error('OAuth error from Google:', { error, errorDescription })
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  if (!code) {
    console.error('No code received in callback')
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  try {
    const supabase = await createServerSupabaseClient()
    console.log('Attempting to exchange code for session...')

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Failed to exchange code:', exchangeError)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    console.log('✅ Session exchanged successfully')
    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error('Exception in callback:', err)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}