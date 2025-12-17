'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setClientReady(true);
        console.log('Supabase client ready. Current user:', user?.email || 'none');
      } catch (err) {
        console.error('Error checking user:', err);
        setClientReady(false);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleSignInWithGoogle = async () => {
    console.log('Sign in button clicked');
    console.log('Client ready:', clientReady);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (!clientReady) {
      console.error('Supabase client not ready');
      return;
    }

    setLoading(true);

    try {
      console.log('Calling signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('OAuth error:', error);
      }
    } catch (err) {
      console.error('Exception during OAuth:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <button 
        disabled 
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--color-text-muted)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-text-muted)',
          borderRadius: '6px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          fontFamily: 'var(--font-family-sans)',
          cursor: 'not-allowed',
          opacity: 0.5,
          boxShadow: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span 
          className="text-body-sm"
          style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}
        >
          Signed in as: <strong>{user.email || user.id}</strong>
        </span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-error)',
            color: 'var(--color-text-inverse)',
            border: '1px solid var(--color-error)',
            borderRadius: '6px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            fontFamily: 'var(--font-family-sans)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'none',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.filter = 'brightness(0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignInWithGoogle}
      style={{
        padding: '8px 16px',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-primary)',
        borderRadius: '6px',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '500',
        fontFamily: 'var(--font-family-sans)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: 'none',
        transform: 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.filter = 'brightness(0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Sign in with Google
    </button>
  );
}