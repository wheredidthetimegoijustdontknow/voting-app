'use client';

import type { PollWithResults } from '@/lib/polls/types';
import VoteButton from './VoteButton';
import { EditPollButton } from './EditPollButton';
import { DeletePollButton } from './DeletePollButton';
import { BarChart3 } from 'lucide-react';
import PollResultsChart from '../analytics/PollResultsChart';
import { useState, useEffect, useRef } from 'react';

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
  onVoteSuccess?: () => void;
  currentUserId: string | null;
}

export default function PollCard({ poll, isSignedIn, onVoteSuccess, currentUserId }: PollCardProps) {
  const isCreator = currentUserId === poll.user_id;
  const [showChart, setShowChart] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const prevVotesRef = useRef(poll.total_votes);

  useEffect(() => {
    if (poll.total_votes > prevVotesRef.current) {
      // Use setTimeout to avoid synchronous setState inside useEffect warning
      const glowTimer = setTimeout(() => setIsGlowing(true), 0);
      const resetTimer = setTimeout(() => setIsGlowing(false), 1500);
      prevVotesRef.current = poll.total_votes;
      return () => {
        clearTimeout(glowTimer);
        clearTimeout(resetTimer);
      };
    }
    prevVotesRef.current = poll.total_votes;
  }, [poll.total_votes]);

  return (
    <div
      className={`card card-poll group p-0 flex items-stretch overflow-hidden transition-all duration-300 ${isGlowing ? 'animate-vote-glow' : ''}`}
      style={{
        '--poll-color': `var(--color-poll-${poll.color_theme_id || 1})`,
        '--poll-soft': `var(--color-poll-${poll.color_theme_id || 1}-soft)`,
        '--poll-glow': `var(--color-poll-${poll.color_theme_id || 1}-glow)`,
        borderColor: isGlowing ? 'var(--poll-color)' : undefined,
      } as React.CSSProperties}
    >
      {/* Accent Column */}
      <div
        className="w-16 shrink-0 flex flex-col items-center justify-between py-6 border-r transition-colors duration-300"
        style={{
          backgroundColor: 'var(--poll-soft)',
          borderColor: 'var(--poll-soft)'
        }}
      >
        {/* Poll Icon at Top */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--poll-color)',
            borderColor: 'var(--poll-color)'
          }}
        >
          <BarChart3 size={20} />
        </div>

        {/* Edit/Delete Buttons at Bottom (only for creators) */}
        {isCreator && (
          <div className="flex flex-col gap-2">
            <EditPollButton
              pollId={poll.id}
              isCreator={isCreator}
              questionText={poll.question_text}
              onEditSuccess={onVoteSuccess}
            />
            <DeletePollButton
              pollId={poll.id}
              isCreator={isCreator}
              onDeleteSuccess={onVoteSuccess}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-4">
        {/* Header Row */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3
              className="text-heading-lg transition-colors duration-300"
              style={{
                color: 'var(--color-text-primary)',
                margin: 0,
                fontSize: 'var(--font-size-lg)',
                fontWeight: '700',
                lineHeight: '1.4'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--poll-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            >
              {poll.question_text}
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              <span>Created by {poll.creator_email}</span>
              <span className="w-1 h-1 rounded-full bg-border-strong"></span>
              <span style={{ color: 'var(--poll-color)' }}>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
            </div>
          </div>

          {/* Badges/Actions */}
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--poll-soft)',
                color: 'var(--poll-color)',
                borderColor: 'var(--poll-color)',
                borderWidth: '1px',
                borderStyle: 'solid',
                padding: '2px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Active
            </span>
          </div>
        </div>

        {/* User Voted Badge */}
        {poll.user_has_voted && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-success-bg)',
              borderColor: 'var(--color-success-border)',
              color: 'var(--color-success)',
            }}
          >
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-success text-white text-[10px]">✓</span>
            <span>You voted: <span className="font-bold">"{poll.user_vote_choice}"</span></span>
          </div>
        )}

        {/* Content Area (Chart or List) */}
        <div className="mt-4 space-y-4">
          {showChart ? (
            <PollResultsChart results={poll.results} color="var(--poll-color)" />
          ) : (
            poll.results.map((result) => {
              const isUserChoice = poll.user_vote_choice === result.choice;

              return (
                <div key={result.choice} className="group/item relative">
                  <div className="flex justify-between items-center text-sm mb-1.5 font-medium">
                    <span
                      style={{
                        color: isUserChoice ? 'var(--color-success)' : 'var(--color-text-primary)'
                      }}
                    >
                      {result.choice} {isUserChoice && <span className="text-[10px] ml-1 opacity-70">(Your Pick)</span>}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {result.percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          backgroundColor: isUserChoice ? 'var(--color-success)' : 'var(--poll-color)',
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
                </div>
              );
            })
          )}
        </div>

        {/* Visualization Toggle */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className="text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            style={{
              color: 'var(--color-text-muted)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--poll-color)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <BarChart3 size={14} />
            {showChart ? 'View List' : 'Visual Analytics'}
          </button>
        </div>
      </div>

      {/* Sign in prompt for non-authenticated users */}
      {!isSignedIn && !poll.user_has_voted && (
        <div
          className="absolute bottom-0 left-16 right-0 p-2 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t text-center text-[10px] font-bold uppercase tracking-widest"
          style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-muted)' }}
        >
          Sign in to participate
        </div>
      )}
    </div>
  );
}