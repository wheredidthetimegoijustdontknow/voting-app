'use client';

import { useEnhancedRealtimePresence } from '@/hooks/useEnhancedRealtimePresence';

interface OnlineUsersBannerProps {
  userId: string | null;
  currentUsername?: string;
}

export default function OnlineUsersBanner({ userId, currentUsername }: OnlineUsersBannerProps) {
  const { users, isConnected, onlineCount, connectionError, refreshUsernames } = useEnhancedRealtimePresence({
    userId: userId || 'anonymous_viewer',
    username: currentUsername || 'Anonymous Viewer',
  });

  // Show banner even if not signed in to display simulation users
  if (!userId && onlineCount === 0 && !isConnected) {
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-max">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500' : isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium text-gray-900">{onlineCount}</span>
            <span className="text-gray-600">{onlineCount === 1 ? 'user' : 'users'}</span>
            <span className="text-gray-600">online</span>
          </div>
          
          {/* Connection Status */}
          {connectionError && (
            <span className="text-xs text-red-500">
              Connection issue
            </span>
          )}
          
          {/* Online Users List on Hover */}
          {users.length > 0 && (
            <div className="group relative ml-2">
              <button
                className="text-blue-600 hover:text-blue-800 underline text-xs"
                onClick={refreshUsernames}
                title="Click to refresh usernames"
              >
                View
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-max z-10">
                <p className="text-xs font-medium text-gray-700 mb-2">Currently online:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {freshUsers.map((user, index) => (
                    <div
                      key={`${user.id}-${index}`}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>{user.username || 'Anonymous User'}</span>
                    </div>
                  ))}
                  {cachedUsers.map((user, index) => (
                    <div
                      key={`${user.id}-cached-${index}`}
                      className="text-sm text-gray-400 flex items-center gap-2"
                      title="Recently disconnected (cached)"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{user.username || 'Anonymous User'}</span>
                      <span className="text-xs">(away)</span>
                    </div>
                  ))}
                </div>
                {connectionError && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-red-500">
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