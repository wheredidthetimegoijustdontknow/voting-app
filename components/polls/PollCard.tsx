'use client';

import { PollWithResults } from '@/lib/polls/types';
import { formatPollDate, shortenEmail } from '@/lib/polls/helpers';
import VoteButton from './VoteButton';

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
}

export default function PollCard({ poll, isSignedIn }: PollCardProps) {
  // ✅ Use snake_case properties from your existing type
  const userVotedChoice = poll.user_vote_choice;
  const hasVoted = poll.user_has_voted;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Poll Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-black">
          {poll.question_text}
        </h3>
        <div className="flex items-center gap-2 text-sm text-black">
          <span>By {shortenEmail(poll.creator_email)}</span>
          <span>•</span>
          <span>{formatPollDate(poll.created_at)}</span>
          <span>•</span>
          <span className="font-medium text-blue-600">
            {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>

      {/* User Vote Status */}
      {hasVoted && userVotedChoice && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ You voted for: <span className="font-bold">{userVotedChoice}</span>
          </p>
        </div>
      )}

      {/* Vote Buttons (only if signed in and hasn't voted) */}
      {isSignedIn && !hasVoted && (
        <div className="mb-4 flex flex-wrap gap-2">
          {poll.results.map((result) => (
            <VoteButton
              key={result.choice}
              pollId={poll.id}
              choice={result.choice}
              disabled={hasVoted}
            />
          ))}
        </div>
      )}

      {/* Not Signed In Message */}
      {!isSignedIn && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-black">
            Sign in to vote on this poll
          </p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {poll.results.map((result) => (
          <div key={result.choice}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-black">
                {result.choice}
              </span>
              <span className="text-sm text-black">
                {result.count} ({result.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  userVotedChoice === result.choice
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: result.percentage === 0 
                    ? '0%' 
                    : `${Math.max(result.percentage, 5)}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}