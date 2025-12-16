'use client';

import { usePollingPolls } from '@/hooks/usePollingPolls';
import PollCard from './PollCard';
import UpdateIndicator from '../UpdateIndicator';
import type { PollWithResults } from '@/lib/polls/types';

interface PollingPollListProps {
  initialPolls: PollWithResults[];
  userId: string | null;
}

export default function PollingPollList({ initialPolls, userId }: PollingPollListProps) {
  const { polls, isUpdating, lastUpdate, refresh } = usePollingPolls({ 
    initialPolls, 
    userId,
    pollingInterval: 3000 // 3 seconds
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          All Polls ({polls.length})
        </h2>
        
        <UpdateIndicator 
          isUpdating={isUpdating}
          lastUpdate={lastUpdate}
          onRefresh={refresh}
        />
      </div>

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