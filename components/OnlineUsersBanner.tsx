'use client';

import { useEffect, useState } from 'react';
import { useEnhancedRealtimePresence } from '@/hooks/useEnhancedRealtimePresence';
import { fetchBotStats } from '@/lib/actions/admin';

interface OnlineUsersBannerProps {
  userId: string | null;
  currentUsername?: string;
}

export default function OnlineUsersBanner({ userId, currentUsername }: OnlineUsersBannerProps) {
  const [botCount, setBotCount] = useState(0);
  const { users, isConnected, onlineCount, connectionError, refreshUsernames } = useEnhancedRealtimePresence({
    userId: userId || 'anonymous_viewer',
    username: currentUsername || 'Anonymous Viewer',
  });

  useEffect(() => {
    const getBots = async () => {
      const stats = await fetchBotStats();
      setBotCount(stats.totalBots);
    };
    getBots();
  }, []);

  const totalOnline = onlineCount + botCount;

  // Show banner even if not signed in to display simulation users
  if (!userId && totalOnline === 0 && !isConnected) {
    return null;
  }

  // Calculate how many users are "fresh" (seen in last 10 seconds)
  const now = Date.now();
  const freshUsers = users.filter(user => {
    const timeSinceLastSeen = now - (user.last_seen || 0);
    return timeSinceLastSeen < 10000; // Less than 10 seconds
  });
  const cachedUsers = users.filter(user => {
    const timeSinceLastSeen = now - (user.last_seen || 0);
    return timeSinceLastSeen >= 10000; // 10+ seconds (cached)
  });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="border rounded-lg shadow-lg p-3 min-w-max transition-colors duration-300"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-default)',
        }}
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500' : isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{totalOnline}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{totalOnline === 1 ? 'user' : 'users'}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>online</span>
          </div>

          {/* Connection Status */}
          {connectionError && (
            <span className="text-xs" style={{ color: 'var(--color-error)' }}>
              Connection issue
            </span>
          )}

          {/* Online Users List on Hover */}
          {users.length > 0 && (
            <div className="group relative ml-2">
              <button
                className="hover:underline text-xs"
                style={{ color: 'var(--color-primary)' }}
                onClick={refreshUsernames}
                title="Click to refresh usernames"
              >
                View
              </button>
              <div
                className="absolute bottom-full right-0 mb-2 hidden group-hover:block border rounded-lg shadow-lg p-3 min-w-max z-10"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border-default)',
                }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Currently online:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {freshUsers.map((user, index) => (
                    <div
                      key={`${user.id}-${index}`}
                      className="text-sm flex items-center gap-2"
                      style={{ color: user.aura_color || 'var(--color-text-primary)' }}
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>{user.spirit_emoji || '👤'}</span>
                      <span>{user.username || 'Anonymous User'}</span>
                    </div>
                  ))}
                  {cachedUsers.map((user, index) => (
                    <div
                      key={`${user.id}-cached-${index}`}
                      className="text-sm flex items-center gap-2"
                      style={{ color: user.aura_color ? `${user.aura_color}80` : 'var(--color-text-muted)' }}
                      title="Recently disconnected (cached)"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{user.spirit_emoji || '👤'}</span>
                      <span>{user.username || 'Anonymous User'}</span>
                      <span className="text-xs">(away)</span>
                    </div>
                  ))}
                </div>
                {connectionError && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      Real-time sync error
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}