'use client';

import type { PollWithResults } from '@/lib/polls/types';
import VoteButton from './VoteButton';
import { EditPollButton } from './EditPollButton';
import { BarChart3 } from 'lucide-react';
import PollResultsChart from '../analytics/PollResultsChart';
import { useState } from 'react';

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
  onVoteSuccess?: () => void;
  currentUserId: string | null;
}

export default function PollCard({ poll, isSignedIn, onVoteSuccess, currentUserId }: PollCardProps) {
  const isCreator = currentUserId === poll.user_id;
  const [showChart, setShowChart] = useState(false);

  return (
    <div
      className="card group transition-all duration-100 hover:ring-1"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border-default)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-sm)',
        '--tw-ring-color': 'var(--color-primary)'
      } as React.CSSProperties}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border shrink-0"
          style={{
            backgroundColor: 'var(--color-info-bg)',
            color: 'var(--color-info)',
            borderColor: 'var(--color-info-border)'
          }}
        >
          <BarChart3 size={20} />
        </div>

        <div className="flex-1 space-y-2">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="text-heading-lg group-hover:text-primary transition-colors"
                style={{
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  fontSize: 'var(--font-size-lg)',
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
            </div>

            {/* Badges/Actions */}
            <div className="flex items-center gap-2">
              <span
                className="badge badge-success"
                style={{
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  borderColor: 'var(--color-success-border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '500'
                }}
              >
                Active
              </span>
              {isCreator && (
                <EditPollButton
                  pollId={poll.id}
                  isCreator={isCreator}
                  questionText={poll.question_text}
                  onDeleteSuccess={onVoteSuccess}
                />
              )}
            </div>
          </div>

          {/* User Voted Badge */}
          {poll.user_has_voted && (
            <div
              className="badge badge-info inline-flex items-center gap-1"
              style={{
                backgroundColor: 'var(--color-info-bg)',
                borderColor: 'var(--color-info-border)',
                color: 'var(--color-info)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                borderWidth: '1px',
                borderStyle: 'solid',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              ✓ You voted: {poll.user_vote_choice}
            </div>
          )}

          {/* Visualization Toggle */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className="button button-ghost text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <BarChart3 size={16} />
              {showChart ? 'Show List' : 'Visualize Results'}
            </button>
          </div>

          {/* Content Area (Chart or List) */}
          <div className="mt-4">
            {showChart ? (
              <PollResultsChart results={poll.results} />
            ) : (
              poll.results.map((result) => {
                const isUserChoice = poll.user_vote_choice === result.choice;

                return (
                  <div key={result.choice} className="space-y-2 mb-3 last:mb-0">
                    {/* Choice Header */}
                    <div className="flex justify-between items-center text-sm">
                      <span
                        className="font-medium"
                        style={{
                          color: isUserChoice ? 'var(--color-success)' : 'var(--color-text-primary)'
                        }}
                      >
                        {result.choice} {isUserChoice && '(You)'}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {result.count} ({result.percentage.toFixed(1)}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="progress-bar relative h-2 bg-border-light rounded-full overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-border-light)',
                        height: '8px'
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: isUserChoice ? 'var(--color-success)' : 'var(--color-primary)',
                          width: `${result.percentage}%`
                        }}
                      />
                    </div>

                    {/* Vote Button */}
                    {isSignedIn && !poll.user_has_voted && (
                      <div className="pt-1">
                        <VoteButton
                          pollId={poll.id}
                          choice={result.choice}
                          isSelected={false}
                          onVoteSuccess={onVoteSuccess}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sign in prompt for non-authenticated users */}
      {!isSignedIn && !poll.user_has_voted && (
        <div
          className="text-center mt-4 p-4 rounded-lg border border-dashed"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-background)'
          }}
        >
          <p className="text-sm text-muted">
            Sign in to vote on this poll
          </p>
        </div>
      )}
    </div>
  );
}