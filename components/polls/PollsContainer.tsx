'use client';

import { useRealtimeVotes } from '@/hooks/useRealtimeVotes';
import PollCard from './PollCard';
import UpdateIndicator from '../UpdateIndicator';
import type { PollWithResults } from '@/lib/polls/types';

interface PollingPollListProps {
  initialPolls: PollWithResults[];
  userId: string | null;
  userRole?: string;
}

export default function PollingPollList({ initialPolls, userId, userRole }: PollingPollListProps) {
  const { polls, isConnected, connectionError, refresh } = useRealtimeVotes({
    initialPolls,
    userId
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2
          className="text-heading-lg"
          style={{
            color: 'var(--color-text-primary)',
            margin: 0,
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600'
          }}
        >
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
        <div
          className="badge badge-warning"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning-border)',
            color: 'var(--color-warning)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--spacing-md)',
            display: 'block'
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-warning)',
                borderRadius: 'var(--radius-full)'
              }}
            />
            <span>
              Real-time updates temporarily unavailable: {connectionError}
            </span>
            <button
              onClick={refresh}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-warning)',
                textDecoration: 'underline',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}


      {polls.length === 0 ? (
        <div
          className="text-center"
          style={{
            padding: '48px 24px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <p
            className="text-body"
            style={{
              color: 'var(--color-text-primary)',
              margin: 0
            }}
          >
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
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}