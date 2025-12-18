import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Poll, Vote, PollWithResults, VoteResult } from './types';
import { aggregateVotes } from './helpers';

/**
 * Fetch all polls with vote aggregation and user's voting status
 * 
 * ⚠️ BEGINNER MISTAKE: Using incorrect .select() syntax
 * .select() takes a SINGLE STRING with comma-separated columns, not separate arguments.
 * ✅ Correct: .select('id, created_at, user_id, question_text')
 * ❌ Wrong: .select(id, created_at, user_id, question_text)
 */
export async function fetchPollsWithResults(filterCreatorId?: string): Promise<PollWithResults[]> {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch polls
  let query = supabase
    .from('polls')
    .select('id, created_at, user_id, question_text, color_theme_id')
    .order('created_at', { ascending: false });

  if (filterCreatorId) {
    query = query.eq('user_id', filterCreatorId);
  }

  const { data: polls, error: pollsError } = await query;

  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
    return [];
  }

  if (!polls) return [];

  // Fetch all votes
  const { data: allVotes, error: votesError } = await supabase
    .from('votes')
    .select('id, created_at, poll_id, choice, user_id');

  if (votesError) {
    console.error('Error fetching votes:', votesError);
    return [];
  }

  // Fetch all choices
  const { data: pollChoicesData, error: choicesError } = await supabase
    .from('polls_choices')
    .select('poll_id, choice');

  if (choicesError) {
    console.error('Error fetching choices:', choicesError);
    return [];
  }

  // Fetch current user's votes
  const userVotes = user ? (allVotes?.filter((v: Vote) => v.user_id === user.id) || []) : [];

  // Transform polls with vote results
  const pollsWithResults: PollWithResults[] = polls.map((poll: Poll) => {
    const pollVotes = allVotes?.filter((v: Vote) => v.poll_id === poll.id) || [];
    const pollChoices = pollChoicesData?.filter((c: any) => c.poll_id === poll.id) || [];
    const userVoteOnThisPoll = userVotes?.find((v: Vote) => v.poll_id === poll.id);

    return {
      id: poll.id,
      created_at: poll.created_at,
      user_id: poll.user_id,
      question_text: poll.question_text,
      color_theme_id: poll.color_theme_id,
      creator_email: 'Anonymous',
      total_votes: pollVotes.length,
      results: aggregateVotes(pollVotes, pollChoices.map((c: any) => c.choice)),
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
    .select('id, created_at, user_id, question_text, color_theme_id')
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

  // Fetch choices for this poll
  const { data: pollChoicesData, error: choicesError } = await supabase
    .from('polls_choices')
    .select('choice')
    .eq('poll_id', pollId);

  if (choicesError) {
    console.error('Error fetching choices:', choicesError);
    return null;
  }

  // Check if current user voted
  const userVoteOnThisPoll = user
    ? pollVotes?.find((v: Vote) => v.poll_id === pollId && v.user_id === user.id)
    : null;

  return {
    id: poll.id,
    created_at: poll.created_at,
    user_id: poll.user_id,
    question_text: poll.question_text,
    color_theme_id: poll.color_theme_id,
    creator_email: 'Anonymous',
    total_votes: pollVotes?.length || 0,
    results: aggregateVotes(pollVotes || [], pollChoicesData?.map((c: any) => c.choice) || []),
    user_has_voted: !!userVoteOnThisPoll,
    user_vote_choice: userVoteOnThisPoll?.choice,
  };
}

/**
 * Check if current user has voted on a specific poll
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