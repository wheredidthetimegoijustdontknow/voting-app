'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitVote } from '@/app/actions/vote';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

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
  const { isImpersonating, impersonatedUser } = useAdminImpersonation();
  const router = useRouter();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticVoted, setOptimisticVoted] = useState(false);

  const handleVote = async () => {
    // Prevent double voting
    if (isVoting || optimisticVoted || isSelected) return;
    
    setIsVoting(true);
    setError(null);
    setOptimisticVoted(true); // Immediately show voted state

    try {
      // Create FormData to send to the Server Action
      const formData = new FormData();
      formData.append('poll_id', pollId);
      formData.append('choice', choice);
      
      // If impersonating, include the impersonated user's ID
      if (isImpersonating && impersonatedUser) {
        formData.append('impersonated_user_id', impersonatedUser.id);
      }

      // Call the Server Action directly
      const result = await submitVote(formData);

      if (!result.success) {
        // Revert optimistic update on error
        setOptimisticVoted(false);
        throw new Error(result.error || 'Failed to vote');
      }

      // Trigger refresh to sync with server state
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
      // Refresh router to ensure data consistency
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
      setOptimisticVoted(false); // Revert on error
    } finally {
      setIsVoting(false);
    }
  };

  // Show voted state if either selected or optimistic vote
  if (isSelected || optimisticVoted) {
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
        {optimisticVoted ? 'Voting...' : '✓ Your Vote'}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleVote}
        disabled={isVoting || optimisticVoted || isSelected}
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
        {isVoting ? 'Voting...' : isImpersonating ? `Vote as @${impersonatedUser?.username}` : 'Vote'}
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