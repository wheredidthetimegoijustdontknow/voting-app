'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
  pollId: string;
  choice: string;
  disabled: boolean;
  isUserChoice?: boolean;
}

export default function VoteButton({ 
  pollId, 
  choice, 
  disabled,
  isUserChoice = false 
}: VoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVote = async () => {
    // Clear any previous errors
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poll_id: pollId,
          choice: choice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      // Success! Refresh the page to show updated results
      router.refresh();
    } catch (err) {
      console.error('Vote submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to vote');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleVote}
        disabled={disabled || isLoading}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          ${disabled 
            ? 'bg-gray-300 text-black cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${isUserChoice ? 'ring-2 ring-green-500 ring-offset-2' : ''}
        `}
      >
        {isLoading ? 'Voting...' : choice}
      </button>
      
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}