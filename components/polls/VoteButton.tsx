'use client';

import { useState } from 'react';

interface VoteButtonProps {
  pollId: string;
  choice: string;
  isSelected: boolean;
  onVoteSuccess?: () => void; // NEW: Add this prop
}

export default function VoteButton({ 
  pollId, 
  choice, 
  isSelected,
  onVoteSuccess 
}: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: pollId, choice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      // NEW: Trigger immediate refresh after successful vote
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  if (isSelected) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium cursor-not-allowed"
      >
        ✓ Your Vote
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleVote}
        disabled={isVoting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isVoting ? 'Voting...' : 'Vote'}
      </button>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}