'use client';

import type { PollWithResults } from '@/lib/polls/types';
import VoteButton from './VoteButton';
import { EditPollButton } from './EditPollButton';

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
  onVoteSuccess?: () => void;
  currentUserId: string | null;
}

export default function PollCard({ poll, isSignedIn, onVoteSuccess, currentUserId }: PollCardProps) {
  const isCreator = currentUserId === poll.user_id;

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border-default)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Poll Question */}
      <div className="space-y-2">
        <h3
          className="text-heading-lg"
          style={{
            color: 'var(--color-text-primary)',
            margin: 0,
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            lineHeight: '1.5'
          }}
        >
          {poll.question_text}
        </h3>
        <p
          className="text-body-sm"
          style={{
            color: 'var(--color-text-secondary)',
            margin: 0
          }}
        >
          By {poll.creator_email} • {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
        </p>

        {isCreator && (
          <EditPollButton
            pollId={poll.id}
            isCreator={isCreator}
            questionText={poll.question_text}
            onDeleteSuccess={onVoteSuccess}
          />
        )}
      </div>

      {poll.user_has_voted && (
        <div
          className="badge badge-success"
          style={{
            backgroundColor: 'var(--color-success-bg)',
            borderColor: 'var(--color-success-border)',
            color: 'var(--color-success)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--spacing-md)',
            display: 'inline-block'
          }}
        >
          ✓ You voted for: {poll.user_vote_choice}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3" style={{ marginTop: 'var(--spacing-md)' }}>
        {poll.results.map((result) => {
          const isUserChoice = poll.user_vote_choice === result.choice;

          return (
            <div key={result.choice} className="space-y-2">
              {/* Choice Header */}
              <div className="flex justify-between items-center">
                <span
                  className="font-medium"
                  style={{
                    color: isUserChoice ? 'var(--color-success)' : 'var(--color-text-primary)',
                    fontWeight: '500'
                  }}
                >
                  {result.choice} {isUserChoice && '←'}
                </span>
                <span
                  className="text-body-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {result.count} ({result.percentage.toFixed(1)}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="progress-bar"
                style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'var(--color-border-light)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  className="progress-bar-fill"
                  style={{
                    height: '100%',
                    transition: 'width 0.5s ease',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isUserChoice ? 'var(--color-success)' : 'var(--color-primary)',
                    width: `${result.percentage}%`
                  }}
                />
              </div>

              {/* Vote Button */}
              {isSignedIn && !poll.user_has_voted && (
                <VoteButton
                  pollId={poll.id}
                  choice={result.choice}
                  isSelected={false}
                  onVoteSuccess={onVoteSuccess}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Sign in prompt for non-authenticated users */}
      {!isSignedIn && !poll.user_has_voted && (
        <div
          className="text-center"
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-interactive-hover)',
            borderRadius: 'var(--radius-md)',
            borderColor: 'var(--color-border-default)',
            borderWidth: '1px',
            borderStyle: 'solid',
            marginTop: 'var(--spacing-md)'
          }}
        >
          <p
            className="text-body-sm"
            style={{
              color: 'var(--color-text-secondary)',
              margin: 0
            }}
          >
            Sign in to vote on this poll
          </p>
        </div>
      )}
    </div>
  );
}