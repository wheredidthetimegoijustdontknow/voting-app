'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { PollWithResults } from '@/lib/polls/types';
import { aggregateVotes } from '@/lib/polls/helpers';

interface UseRealtimeVotesOptions {
  initialPolls: PollWithResults[];
  userId: string | null;
}

interface Vote {
  id: string;
  poll_id: string;
  user_id: string;
  choice: string;
  created_at: string;
}

interface Choice {
  id: string;
  poll_id: string;
  choice: string;
  created_at: string;
}

interface PollData {
  id: string;
  created_at: string;
  user_id: string;
  question_text: string;
  color_theme_id: number;
  status: string;
  starts_at: string;
  ends_at: string | null;
  last_vote_at: string;
  is_premium_timer: boolean;
  deleted_at: string | null;
}

export function useRealtimeVotes({ initialPolls, userId }: UseRealtimeVotesOptions) {
  const [polls, setPolls] = useState<PollWithResults[]>(initialPolls);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // Fix: Ensure supabase client is stable across renders
  const [supabase] = useState(() => createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitialized = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Enhanced poll update with better error handling
  const updatePollWithVotes = useCallback(async (pollId: string) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Poll update timeout')), 5000);
      });

      const updatePromise = (async () => {
        // Fetch specific poll
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single();

        if (pollError || !pollData) {
          throw new Error(`Poll fetch error: ${pollError?.message}`);
        }

        // Fetch votes for this poll only
        const { data: pollVotes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', pollId);

        if (votesError) {
          throw new Error(`Votes fetch error: ${votesError.message}`);
        }

        // Fetch choices for this poll
        const { data: pollChoices, error: choicesError } = await supabase
          .from('polls_choices')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at', { ascending: true });

        if (choicesError) {
          throw new Error(`Choices fetch error: ${choicesError.message}`);
        }

        const choiceTexts = (pollChoices || []).map((c: Choice) => c.choice);
        const aggregated = aggregateVotes(pollVotes || [], choiceTexts);
        const userVote = userId ? (pollVotes || []).find((v) => v.user_id === userId) : null;

        const updatedPoll: PollWithResults = {
          id: pollData.id,
          created_at: pollData.created_at,
          user_id: pollData.user_id,
          question_text: pollData.question_text,
          color_theme_id: pollData.color_theme_id,
          status: pollData.status,
          starts_at: pollData.starts_at,
          ends_at: pollData.ends_at,
          last_vote_at: pollData.last_vote_at,
          is_premium_timer: pollData.is_premium_timer,
          deleted_at: pollData.deleted_at,
          creator_email: 'Anonymous',
          total_votes: (pollVotes || []).length,
          results: aggregated,
          user_has_voted: !!userVote,
          user_vote_choice: userVote?.choice,
        };

        // Update the specific poll in state
        setPolls(currentPolls =>
          currentPolls.map(poll =>
            poll.id === pollId ? updatedPoll : poll
          )
        );

        console.log(`✅ Updated poll ${pollId} with ${(pollVotes || []).length} votes`);
      })();

      await Promise.race([updatePromise, timeoutPromise]);
    } catch (error) {
      console.error('Error updating poll:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [supabase, userId]);

  // Enhanced initial fetch with better error handling
  const fetchInitialPolls = useCallback(async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initial fetch timeout')), 10000);
      });

      const fetchPromise = (async () => {
        // Fetch all polls
        const { data: pollsData, error: pollsError } = await supabase
          .from('polls')
          .select('*')
          .order('created_at', { ascending: false });

        if (pollsError || !pollsData) {
          throw new Error(`Initial polls fetch error: ${pollsError?.message}`);
        }

        // For initial load, batch fetch all data for efficiency
        const { data: allVotes, error: votesError } = await supabase
          .from('votes')
          .select('*');

        const { data: allChoices, error: choicesError } = await supabase
          .from('polls_choices')
          .select('*')
          .order('created_at', { ascending: true });

        if (votesError || choicesError) {
          throw new Error(`Initial data fetch error: ${votesError?.message || choicesError?.message}`);
        }

        // Group data for efficient processing
        const votesByPoll = (allVotes || []).reduce((acc, vote) => {
          if (!acc[vote.poll_id]) acc[vote.poll_id] = [];
          acc[vote.poll_id].push(vote);
          return acc;
        }, {} as Record<string, Vote[]>);

        const choicesByPoll = (allChoices || []).reduce((acc, choice) => {
          if (!acc[choice.poll_id]) acc[choice.poll_id] = [];
          acc[choice.poll_id].push(choice);
          return acc;
        }, {} as Record<string, Choice[]>);

        // Build polls with results
        const pollsWithResults: PollWithResults[] = (pollsData as PollData[]).map((poll) => {
          const votes = votesByPoll[poll.id] || [];
          const choices = choicesByPoll[poll.id] || [];
          const choiceTexts = choices.map((c: Choice) => c.choice);

          const aggregated = aggregateVotes(votes, choiceTexts);
          const userVote = userId ? votes.find((v: Vote) => v.user_id === userId) : null;

          return {
            id: poll.id,
            created_at: poll.created_at,
            user_id: poll.user_id,
            question_text: poll.question_text,
            color_theme_id: poll.color_theme_id,
            status: poll.status,
            starts_at: poll.starts_at,
            ends_at: poll.ends_at,
            last_vote_at: poll.last_vote_at,
            is_premium_timer: poll.is_premium_timer,
            deleted_at: poll.deleted_at,
            creator_email: 'Anonymous',
            total_votes: votes.length,
            results: aggregated,
            user_has_voted: !!userVote,
            user_vote_choice: userVote?.choice,
          };
        });

        setPolls(pollsWithResults);
        console.log(`✅ Initial load: ${pollsWithResults.length} polls loaded`);
      })();

      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error in initial fetch:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [supabase, userId]);

  // Sync local state with initialPolls when they change (e.g. via router.refresh())
  useEffect(() => {
    // Sync with fresh data from props
    if (initialPolls) {
      setPolls(initialPolls);
    }
  }, [initialPolls]);

  // Enhanced subscription setup with reconnection logic
  const setupSubscription = useCallback(() => {
    if (isConnectingRef.current || !userId) return;
    isConnectingRef.current = true;
    setConnectionError(null);

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `votes_realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    });

    channelRef.current = channel;

    // Subscribe to vote changes AND poll updates with enhanced error handling
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('🗳️ New vote detected:', payload.new);
          setConnectionError(null); // Clear any previous errors
          const pollId = payload.new?.poll_id;
          if (pollId) updatePollWithVotes(pollId);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('🗳️ Vote deleted:', payload.old);
          setConnectionError(null);
          const pollId = payload.old?.poll_id;
          if (pollId) updatePollWithVotes(pollId);
        }
      )
      // Listen for Poll Updates (e.g. Question change)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        (payload) => {
          console.log('📝 Poll updated:', payload.new);
          const pollId = payload.new?.id;
          if (pollId) {
            updatePollWithVotes(pollId);
          }
        }
      )
      // Listen for Poll Deletions
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'polls' },
        (payload) => {
          console.log('🗑️ Poll deleted in real-time:', payload.old);
          const pollId = payload.old?.id;
          if (pollId) {
            setPolls(currentPolls => currentPolls.filter(p => p.id !== pollId));
          }
        }
      )
      .subscribe(async (status, err) => {
        isConnectingRef.current = false;

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to vote changes');
          setIsConnected(true);
          setConnectionError(null);

          // Fetch initial data once
          await fetchInitialPolls();
        } else if (status === 'CHANNEL_ERROR') {
          const errorMsg = err?.message || 'Unknown channel error';
          console.error('❌ Error subscribing to vote changes:', errorMsg);
          setIsConnected(false);
          setConnectionError('Failed to connect to real-time updates');

          // Attempt reconnection after delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            setupSubscription();
          }, 5000);
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Timeout subscribing to vote changes');
          setIsConnected(false);
          setConnectionError('Connection timed out');

          // Attempt reconnection
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect after timeout...');
            setupSubscription();
          }, 10000);
        }
      });
  }, [supabase, updatePollWithVotes, fetchInitialPolls, userId]);

  // Set up real-time subscription for vote changes
  useEffect(() => {
    if (!userId) {
      console.log('useRealtimeVotes: No userId provided, skipping subscription');
      return;
    }

    setupSubscription();

    // Cleanup function with enhanced error handling
    return () => {
      console.log('Cleaning up vote changes subscription');

      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setIsConnected(false);
      isConnectingRef.current = false;
      setConnectionError(null);
    };
  }, [userId, setupSubscription]);

  // Enhanced manual refresh function
  const refresh = useCallback(async () => {
    console.log('Manual refresh triggered');
    setConnectionError(null);

    // Reset initialization to force fresh data fetch
    isInitialized.current = false;
    await fetchInitialPolls();
  }, [fetchInitialPolls]);

  return {
    polls,
    isConnected,
    connectionError,
    refresh
  };
}