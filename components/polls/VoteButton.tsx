'use client';

import { useState } from 'react';

interface VoteButtonProps {
  pollId: string;
  choice: string;
  isSelected: boolean;
  onVoteSuccess?: () => void;
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

      // Trigger immediate refresh after successful vote
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
        style={{
          width: '100%',
          padding: '8px 16px',
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success-border)',
          borderRadius: '6px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          fontFamily: 'var(--font-family-sans)',
          cursor: 'not-allowed',
          opacity: 0.8,
          boxShadow: 'none',
          transition: 'all 0.15s ease',
        }}
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
        style={{
          width: '100%',
          padding: '8px 16px',
          backgroundColor: isVoting ? 'var(--color-primary-hover)' : 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-primary)',
          borderRadius: '6px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          fontFamily: 'var(--font-family-sans)',
          cursor: isVoting ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: 'none',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          if (!isVoting) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.filter = 'brightness(0.95)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isVoting) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.filter = 'brightness(1)';
          }
        }}
        onFocus={(e) => {
          if (!isVoting) {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isVoting ? 'Voting...' : 'Vote'}
      </button>
      
      {error && (
        <p 
          className="text-body-sm"
          style={{ 
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            margin: 0
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}