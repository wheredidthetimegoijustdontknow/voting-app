import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Poll, Vote, PollWithResults, VoteResult } from './types';
import { aggregateVotes } from './helpers';

/**
 * Fetch all polls with vote aggregation and user's voting status
 * 
 * ⚠️ BEGINNER MISTAKE: Trying to do complex aggregation in JavaScript
 * This query uses PostgreSQL's GROUP BY and COUNT to aggregate votes
 * at the database level. Never fetch all votes and count in JS—that's slow.
 */
export async function fetchPollsWithResults(): Promise<PollWithResults[]> {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all polls
  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id, created_at, user_id, question_text')
    .order('created_at', { ascending: false });

  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
    return [];
  }

  if (!polls) return [];

  // Fetch all votes (RLS ensures only appropriate data is returned)
  const { data: allVotes, error: votesError } = await supabase
    .from('votes')
    .select('id, created_at, poll_id, choice, user_id');

  if (votesError) {
    console.error('Error fetching votes:', votesError);
    return [];
  }

  // Fetch current user's votes to mark which polls they voted on
  const userVotes = user ? (allVotes?.filter((v: Vote) => v.user_id === user.id) || []) : [];

  // Transform polls with vote results
  const pollsWithResults: PollWithResults[] = polls.map((poll: Poll) => {
    const pollVotes = allVotes?.filter((v: Vote) => v.poll_id === poll.id) || [];
    const userVoteOnThisPoll = userVotes?.find((v: Vote) => v.poll_id === poll.id);

    return {
      id: poll.id,
      created_at: poll.created_at,
      user_id: poll.user_id,
      question_text: poll.question_text,
      creator_email: 'Anonymous', // TODO: Fetch emails separately in Phase 4.3
      total_votes: pollVotes.length,
      results: aggregateVotes(pollVotes),
      user_has_voted: !!userVoteOnThisPoll,
      user_vote_choice: userVoteOnThisPoll?.choice,
    };
  });

  return pollsWithResults;
}

/**
 * Fetch a single poll by ID with results
 */
export async function fetchPollById(pollId: string): Promise<PollWithResults | null> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch single poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, created_at, user_id, question_text')
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll:', pollError);
    return null;
  }

  // Fetch votes for this poll
  const { data: pollVotes, error: votesError } = await supabase
    .from('votes')
    .select('id, created_at, poll_id, choice, user_id')
    .eq('poll_id', pollId);

  if (votesError) {
    console.error('Error fetching votes:', votesError);
    return null;
  }

  // Check if current user voted
  const userVoteOnThisPoll = user
    ? pollVotes?.find(v => v.poll_id === pollId && v.user_id === user.id)
    : null;

  return {
    id: poll.id,
    created_at: poll.created_at,
    user_id: poll.user_id,
    question_text: poll.question_text,
    creator_email: 'Anonymous', // TODO: Fetch emails separately in Phase 4.3
    total_votes: pollVotes?.length || 0,
    results: aggregateVotes(pollVotes || []),
    user_has_voted: !!userVoteOnThisPoll,
    user_vote_choice: userVoteOnThisPoll?.choice,
  };
}

/**
 * Check if current user has voted on a specific poll
 * 
 * ⚠️ BEGINNER MISTAKE: Using this in real-time is slow
 * In Phase 5, we'll use Realtime subscriptions instead of polling.
 * For now, this is fine for initial page load.
 */
export async function userHasVoted(pollId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .limit(1);

  if (error) {
    console.error('Error checking vote status:', error);
    return false;
  }

  return data && data.length > 0;
}