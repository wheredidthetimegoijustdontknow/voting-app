'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PollWithResults } from '@/lib/polls/types';
import { aggregateVotes } from '@/lib/polls/helpers';

interface UsePollingPollsOptions {
  initialPolls: PollWithResults[];
  userId: string | null;
  pollingInterval?: number;
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
}

export function usePollingPolls({ 
  initialPolls, 
  userId,
  pollingInterval = 3000
}: UsePollingPollsOptions) {
  const [polls, setPolls] = useState<PollWithResults[]>(initialPolls);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const supabase = createClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTabVisibleRef = useRef(true);

  // Fetch fresh poll data
  const fetchPolls = useCallback(async () => {
    if (!isTabVisibleRef.current) return;
    
    setIsUpdating(true);
    
    try {
      // Fetch all polls (simplified query without problematic joins)
      console.log('Fetching polls...');
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) {
        console.error('Polls query error:', pollsError);
        throw new Error(`Polls query failed: ${pollsError.message}`);
      }
      if (!pollsData) {
        console.warn('No polls data returned');
        return;
      }
      console.log(`Successfully fetched ${pollsData.length} polls`);

      // Fetch all votes
      console.log('Fetching votes...');
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('*');

      if (votesError) {
        console.error('Votes query error:', votesError);
        throw new Error(`Votes query failed: ${votesError.message}`);
      }
      console.log(`Successfully fetched ${allVotes?.length || 0} votes`);

      // Fetch all choices
      console.log('Fetching choices...');
      const { data: allChoices, error: choicesError } = await supabase
        .from('polls_choices')
        .select('*')
        .order('created_at', { ascending: true });

      if (choicesError) {
        console.error('Choices query error:', choicesError);
        throw new Error(`Choices query failed: ${choicesError.message}`);
      }
      console.log(`Successfully fetched ${allChoices?.length || 0} choices`);

      if (!allVotes || !allChoices) {
        console.warn('Missing votes or choices data');
        return;
      }

      // Group votes by poll_id
      const votesByPoll = (allVotes as Vote[]).reduce((acc, vote) => {
        if (!acc[vote.poll_id]) acc[vote.poll_id] = [];
        acc[vote.poll_id].push(vote);
        return acc;
      }, {} as Record<string, Vote[]>);

      // Group choices by poll_id
      const choicesByPoll = (allChoices as Choice[]).reduce((acc, choice) => {
        if (!acc[choice.poll_id]) acc[choice.poll_id] = [];
        acc[choice.poll_id].push(choice);
        return acc;
      }, {} as Record<string, Choice[]>);

      // Build polls with results
      const pollsWithResults: PollWithResults[] = pollsData.map((poll: any) => {
        const votes = votesByPoll[poll.id] || [];
        const choices = choicesByPoll[poll.id] || [];
        const choiceTexts = choices.map((c) => c.choice);
        
        const aggregated = aggregateVotes(votes, choiceTexts);
        const userVote = userId ? votes.find((v) => v.user_id === userId) : null;

        return {
          ...poll, // Spread all original poll fields
          creator_email: 'Anonymous', // Simplified to avoid join issues
          total_votes: votes.length,
          results: aggregated,
          user_has_voted: !!userVote,
          user_vote_choice: userVote?.choice,
        };
      });

      console.log(`Processed ${pollsWithResults.length} polls with results`);
      setPolls(pollsWithResults);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching polls:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Non-Error object thrown:', typeof error, error);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [supabase, userId]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      
      if (!document.hidden) {
        // Tab became visible, fetch immediately
        fetchPolls();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPolls]);

  // Set up polling interval
  useEffect(() => {
    // Start polling
    intervalRef.current = setInterval(() => {
      fetchPolls();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPolls, pollingInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchPolls();
  }, [fetchPolls]);

  return { 
    polls, 
    isUpdating, 
    lastUpdate,
    refresh 
  };
}