'use client';

import { useRealtimeVotes } from '@/hooks/useRealtimeVotes';
import PollCard from './PollCard';
import UpdateIndicator from '../UpdateIndicator';
import type { PollWithResults } from '@/lib/polls/types';

interface PollingPollListProps {
  initialPolls: PollWithResults[];
  userId: string | null;
}

export default function PollingPollList({ initialPolls, userId }: PollingPollListProps) {
  const { polls, isConnected, connectionError, refresh } = useRealtimeVotes({
    initialPolls,
    userId
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          All Polls ({polls.length})
        </h2>
        
        <UpdateIndicator
          isUpdating={!isConnected}
          lastUpdate={new Date()}
          onRefresh={refresh}
          error={connectionError}
        />
      </div>

      {/* Connection Error Display */}
      {connectionError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-800">
              Real-time updates temporarily unavailable: {connectionError}
            </span>
            <button
              onClick={refresh}
              className="text-xs text-yellow-600 underline hover:text-yellow-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {isConnected ? (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800">
              Live updates active
            </span>
          </div>
        </div>
      ) : !connectionError && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-800">
              Connecting to real-time updates...
            </span>
          </div>
        </div>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-black">
            No polls yet. Create the first one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              isSignedIn={!!userId}
              onVoteSuccess={refresh}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}