'use client';

import type { PollWithResults } from '@/lib/polls/types';
import VoteButton from './VoteButton';
import { EditPollButton } from './EditPollButton'; // Import the EditPollButton

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
  onVoteSuccess?: () => void;
  // --- NEW PROP ---
  currentUserId: string | null; // The ID of the currently logged-in user
}

export default function PollCard({ poll, isSignedIn, onVoteSuccess, currentUserId }: PollCardProps) {
  
  const isCreator = currentUserId === poll.user_id; // Assumes poll.user_id exists on PollWithResults

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Poll Question */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {poll.question_text}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          By {poll.creator_email} • {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
        </p>
      
      {isCreator && (
          <EditPollButton 
            pollId={poll.id} 
            isCreator={isCreator}
            // The button likely needs the 'refresh' function from PollingPollList
            // to update the list immediately after a successful delete.
            // If the delete action redirects, this may not be needed, but it's good practice.
            onDeleteSuccess={onVoteSuccess} 
          />
           )}
      </div>
      
      {poll.user_has_voted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 font-medium text-sm">
            ✓ You voted for: {poll.user_vote_choice}
          </p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {poll.results.map((result) => {
          const isUserChoice = poll.user_vote_choice === result.choice;
          
          return (
            <div key={result.choice} className="space-y-2">
              {/* Choice Header */}
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isUserChoice ? 'text-green-700' : 'text-gray-700'}`}>
                  {result.choice} {isUserChoice && '←'}
                </span>
                <span className="text-sm text-gray-600">
                  {result.count} ({result.percentage.toFixed(1)}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    isUserChoice ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>

              {/* Vote Button */}
              {isSignedIn && !poll.user_has_voted && (
                <VoteButton
                  pollId={poll.id}
                  choice={result.choice}
                  isSelected={false}
                  onVoteSuccess={onVoteSuccess} // NEW: Pass callback
                />
              )}
            </div>
          );
        })}
      </div>
      
      

      {/* Sign in prompt for non-authenticated users */}
      {!isSignedIn && !poll.user_has_voted && (
        <div className="text-center py-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Sign in to vote on this poll
          </p>
        </div>
      )}
    </div>
  );
}