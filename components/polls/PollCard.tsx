'use client';

import type { PollWithResults } from '@/lib/polls/types';
import VoteButton from './VoteButton';
import { EditPollButton } from './EditPollButton';
import { DeletePollButton } from './DeletePollButton';
import { BarChart3, ChevronLeft, ChevronRight, RefreshCcw, Lock, Flag } from 'lucide-react';
import { retractVote } from '@/app/actions/vote';
import { flagPoll } from '@/app/actions/poll';
import { useRouter } from 'next/navigation';
import PollResultsChart from '../analytics/PollResultsChart';
import { useState, useEffect, useRef, useMemo } from 'react';
import RetractVoteModal from './RetractVoteModal';
import { PollCardBadge } from './PollCardBadge';
import { CountdownTimer } from './CountdownTimer';
import EmojiPicker from '../ui/EmojiPicker';
import { updatePoll } from '@/app/actions/poll';
import { useToast } from '../ui/ToastContext';

interface PollCardProps {
  poll: PollWithResults;
  isSignedIn: boolean;
  onVoteSuccess?: () => void;
  currentUserId: string | null;
  userRole?: string;
}

export default function PollCard({ poll, isSignedIn, onVoteSuccess, currentUserId, userRole }: PollCardProps) {
  const isCreator = currentUserId === poll.user_id;
  const isAdmin = userRole === 'admin';
  const canEditIcon = isCreator || isAdmin;

  const [showChart, setShowChart] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const prevVotesRef = useRef(poll.total_votes);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Retract Modal State
  const [isRetractModalOpen, setIsRetractModalOpen] = useState(false);

  // Emoji Picker State
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isUpdatingIcon, setIsUpdatingIcon] = useState(false);

  const isActive = poll.status === 'ACTIVE' || !poll.status;
  const isScheduled = poll.status === 'SCHEDULED';
  const isEnded = poll.status === 'ENDED';
  const isCapped = poll.status === 'REVIEW' || poll.status === 'REMOVED' || poll.status === 'ENDED';

  const canVote = isActive && isSignedIn && !poll.user_has_voted;
  const canChangeVote = isActive && poll.user_has_voted;

  const handleRetractVote = () => {
    setIsRetractModalOpen(true);
  };

  const handleRetractSuccess = () => {
    router.refresh();
    if (onVoteSuccess) onVoteSuccess();
  };

  const handleIconSelect = async (emoji: string) => {
    if (isUpdatingIcon) return;

    setIsUpdatingIcon(true);
    try {
      const res = await updatePoll(poll.id, { icon: emoji });
      if (res.success) {
        toast('Poll icon updated!', { type: 'success' });
        router.refresh();
        if (onVoteSuccess) onVoteSuccess();
      } else {
        toast(res.error || 'Failed to update icon', { type: 'error' });
      }
    } catch (error) {
      toast('An unexpected error occurred', { type: 'error' });
    } finally {
      setIsUpdatingIcon(false);
    }
  };

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
    <>
      <div
        className={`card card-poll group p-0 relative transition-all duration-300 ${isGlowing ? 'animate-vote-glow' : ''} ${isCollapsed ? 'w-[69px]' : 'w-full'} ${isCapped ? 'grayscale-[0.5] opacity-80' : ''}`}
        style={{
          '--poll-color': isCapped ? 'var(--color-text-muted)' : `var(--color-poll-${poll.color_theme_id || 1})`,
          '--poll-soft': isCapped ? 'var(--color-bg-secondary)' : `var(--color-poll-${poll.color_theme_id || 1}-soft)`,
          '--poll-glow': isCapped ? 'transparent' : `var(--color-poll-${poll.color_theme_id || 1}-glow)`,
          borderColor: 'var(--poll-color)',
          borderWidth: '1.5px',
        } as React.CSSProperties}
      >
        <div className="flex-1 flex items-stretch overflow-hidden rounded-[calc(var(--radius-lg)-1px)]">
          {/* Accent Column */}
          <div
            className="w-16 shrink-0 flex flex-col items-center border-r transition-colors duration-300 relative z-20 min-h-[240px]"
            style={{
              backgroundColor: 'var(--poll-soft)',
              borderColor: 'var(--poll-soft)'
            }}
          >
            {/* Brand Logo at Top - Redesigned sectioned-off tile */}
            <button
              onClick={() => canEditIcon && setIsEmojiPickerOpen(true)}
              disabled={!canEditIcon || isUpdatingIcon}
              className={`w-10 h-10 shrink-0 flex items-center justify-center text-xl mt-3 mb-5 transition-all duration-300 ${canEditIcon ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)', // Conforming more closely to internal elements
                opacity: isUpdatingIcon ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (canEditIcon) {
                  e.currentTarget.style.border = '2px solid transparent';
                }
              }}
              onMouseLeave={(e) => {
                if (canEditIcon) {
                  e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.4)';
                }
              }}
              title={canEditIcon ? "Change Poll Icon" : undefined}
            >
              {isUpdatingIcon ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="drop-shadow-sm">{poll.icon || '📊'}</span>
              )}
            </button>

            {/* Action Buttons at Bottom */}
            <div className="flex flex-col gap-2 mt-auto pb-6">
              {/* Analytics Toggle - Always visible */}
              <button
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false); // Auto-expand if clicking analytics
                  setShowChart(!showChart);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-white hover:bg-zinc-500/50 relative group/tooltip"
              >
                <BarChart3 size={16} />

                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Poll Analytics
                </span>
              </button>

              {/* Flag Button */}
              <button
                onClick={async () => {
                  if (window.confirm('Flag this poll for moderation review? It will be hidden from the main feed.')) {
                    const res = await flagPoll(poll.id);
                    if (res.success) {
                      if (onVoteSuccess) onVoteSuccess();
                    }
                  }
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-white hover:bg-red-500/20 relative group/flag-tooltip"
              >
                <Flag size={14} />
                <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/flag-tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Flag for Review
                </span>
              </button>

              {isCreator && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Divider Toggle Column (Clickable Strip) */}
          <div
            className="w-[3px] shrink-0 border-r flex flex-col items-center justify-center relative cursor-pointer bg-zinc-900 dark:bg-zinc-400 hover:bg-zinc-700 dark:hover:bg-zinc-300 group/divider transition-colors z-30"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ borderColor: 'var(--color-border-default)' }}
            title={isCollapsed ? "Expand Details" : "Collapse Details"}
          />

          {!isCollapsed && (
            <div className="flex-1 p-6 space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3
                    className="text-heading-lg transition-colors duration-300"
                    style={{
                      color: 'var(--poll-color)',
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
                <div className="flex flex-col items-end gap-2">
                  <PollCardBadge
                    status={poll.status}
                    created_at={poll.created_at}
                    last_vote_at={poll.last_vote_at}
                    ends_at={poll.ends_at}
                  />

                  {isActive && poll.ends_at && (
                    <CountdownTimer targetDate={poll.ends_at} label="Ends In:" />
                  )}

                  {isScheduled && (
                    <CountdownTimer targetDate={poll.starts_at} label="Starts In:" />
                  )}
                </div>
              </div>

              {/* User Voted Badge */}
              {poll.user_has_voted && (
                <div className="flex items-center gap-2">
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

                  <button
                    onClick={handleRetractVote}
                    disabled={!canChangeVote}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!canChangeVote ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    style={{
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border-default)'
                    }}
                    title={canChangeVote ? "Change your vote" : "Voting is closed"}
                  >
                    {canChangeVote ? <RefreshCcw size={12} /> : <Lock size={12} />}
                    {canChangeVote ? 'Change Vote' : 'Voting Locked'}
                  </button>
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
                            className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full overflow-hidden"
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
                          {canVote && (
                            <VoteButton
                              pollId={poll.id}
                              choice={result.choice}
                              isSelected={false}
                              onVoteSuccess={onVoteSuccess}
                            />
                          )}

                          {!isActive && !poll.user_has_voted && (
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Toggle Button (Outside overflow-hidden) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute left-[66px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-12 rounded-full flex items-center justify-center border shadow-xl transition-all duration-300 hover:scale-110 z-50 group-hover:border-primary"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: isCollapsed ? 'var(--poll-color)' : 'var(--color-border-strong)',
            color: 'var(--poll-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          title={isCollapsed ? "Expand Details" : "Collapse Details"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Sign in prompt for non-authenticated users */}
        {!isSignedIn && !poll.user_has_voted && !isCollapsed && (
          <div
            className="absolute bottom-0 left-16 right-0 p-2 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t text-center text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-muted)' }}
          >
            Sign in to participate
          </div>
        )}
      </div>

      <RetractVoteModal
        isOpen={isRetractModalOpen}
        onClose={() => setIsRetractModalOpen(false)}
        pollId={poll.id}
        onSuccess={handleRetractSuccess}
      />

      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelect={handleIconSelect}
        title="Change Poll Icon"
      />
    </>
  );
}