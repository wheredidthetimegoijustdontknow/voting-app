'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton({ collapsed = false }: { collapsed?: boolean }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const router = useRouter();
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
      router.refresh();
    }
    setLoading(false);
  };

  if (loading) {
    if (collapsed) {
      return (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      );
    }
    return (
      <button
        disabled
        className="w-full px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        style={{
          backgroundColor: 'var(--color-text-muted)',
          color: '#FFFFFF',
        }}
      >
        Loading...
      </button>
    );
  }

  if (user) {
    if (collapsed) {
      return (
        <button
          onClick={handleSignOut}
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all hover:bg-red-500/10"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
          }}
          title={`Sign out (${user.email || user.id})`}
          aria-label="Sign out"
        >
          {(user.email?.[0] || 'U').toUpperCase()}
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div
          className="text-xs truncate px-2 py-1 rounded-md"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-background)',
          }}
          title={user.email || user.id}
        >
          <div className="font-semibold truncate">{user.email || user.id}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-95"
          style={{
            backgroundColor: 'var(--color-error)',
            color: '#FFFFFF',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (collapsed) {
    return (
      <button
        onClick={handleSignInWithGoogle}
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:brightness-95"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
        }}
        title="Sign in with Google"
        aria-label="Sign in"
      >
        G
      </button>
    );
  }

  return (
    <button
      onClick={handleSignInWithGoogle}
      className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-95"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
      }}
    >
      Sign in with Google
    </button>
  );
}