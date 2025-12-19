// app/actions/poll.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { PollWithResults } from '@/lib/polls/types';

// Define the expected return shape for the client
export interface ActionResponse {
  success: boolean;
  error?: string;
}

// --- 1. Define Zod Schema for Poll Deletion Data ---
const DeletePollSchema = z.object({
  pollId: z.string().uuid({ message: "Invalid Poll ID format. Must be a UUID." }),
  permanent: z.boolean().optional().default(false),
});

/**
 * Handles secure deletion of a poll by ID.
 * This Server Action runs securely on the server with Zod validation.
 * Ensures only the poll creator can delete their poll.
 * @param pollId - The ID of the poll to delete
 */
export async function deletePoll(pollId: string): Promise<ActionResponse> {
  // --- 2. Server-side Validation with Zod ---
  const validationResult = DeletePollSchema.safeParse({ pollId });

  if (!validationResult.success) {
    // If validation fails, return a client-friendly error message
    const validationError = validationResult.error.issues[0].message;
    console.error('Zod validation failed:', validationResult.error.issues);
    return {
      success: false,
      error: `Input validation failed: ${validationError}`
    };
  }

  const validatedData = validationResult.data;

  try {
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Authentication required to delete a poll.' };
    }

    // First, verify the user is the creator of the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', validatedData.pollId)
      .single();

    console.log('[deletePoll] Ownership check:', {
      pollId: validatedData.pollId,
      found: !!poll,
      pollCreator: poll?.user_id,
      currentUser: user.id
    });

    if (pollError || !poll) {
      console.error('[deletePoll] Error fetching poll or not found:', pollError);
      return { success: false, error: 'Poll not found or access denied.' };
    }

    // Check if the current user is the creator of the poll
    if (poll.user_id !== user.id) {
      console.warn('[deletePoll] Unauthorized attempt by user:', user.id);
      return { success: false, error: 'You can only delete your own polls.' };
    }

    // SOFT DELETE logic based on spec
    console.log('[deletePoll] Performing soft delete...');
    const { error: softDeleteError } = await adminSupabase
      .from('polls')
      .update({
        status: 'REMOVED',
        deleted_at: new Date().toISOString()
      })
      .eq('id', validatedData.pollId);

    if (softDeleteError) {
      console.error('[deletePoll] Soft delete error:', softDeleteError);
      return { success: false, error: `Failed to remove poll: ${softDeleteError.message}` };
    }

    console.log('[deletePoll] Successfully soft-deleted poll:', validatedData.pollId);

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath(`/poll/${validatedData.pollId}`);

    return { success: true };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Flags a poll for review (Admin/System action).
 */
export async function flagPoll(pollId: string, reason?: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminSupabaseClient();

    const { error } = await adminSupabase
      .from('polls')
      .update({
        status: 'REVIEW',
        // We can store the reason in a new column or just log it for now
      })
      .eq('id', pollId);

    if (error) {
      console.error('[flagPoll] Error:', error);
      return { success: false, error: 'Failed to flag poll.' };
    }

    revalidatePath('/');
    revalidatePath(`/poll/${pollId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Unexpected error flagging poll.' };
  }
}

/**
 * Fetches polls that are in REVIEW or REMOVED status (Admin only).
 * Includes full results and choices for live preview.
 */
export async function fetchModerationPolls(): Promise<{ success: boolean; polls?: PollWithResults[]; error?: string }> {
  try {
    const adminSupabase = createAdminSupabaseClient();

    // 1. Fetch target polls
    const { data: polls, error: pollsError } = await adminSupabase
      .from('polls')
      .select('id, created_at, user_id, question_text, color_theme_id, status, starts_at, ends_at, last_vote_at, is_premium_timer, deleted_at, icon')
      .in('status', ['REVIEW', 'REMOVED'])
      .order('created_at', { ascending: false });

    if (pollsError) throw pollsError;
    if (!polls) return { success: true, polls: [] };

    const pollIds = polls.map(p => p.id);

    // 2. Fetch votes for these polls
    const { data: votes, error: votesError } = await adminSupabase
      .from('votes')
      .select('id, created_at, poll_id, choice, user_id')
      .in('poll_id', pollIds);

    if (votesError) throw votesError;

    // 3. Fetch choices for these polls
    const { data: choices, error: choicesError } = await adminSupabase
      .from('polls_choices')
      .select('poll_id, choice')
      .in('poll_id', pollIds);

    if (choicesError) throw choicesError;

    // 4. Aggregate results (borrowed logic from queries.ts)
    const pollsWithResults = polls.map(poll => {
      const pollVotes = votes?.filter(v => v.poll_id === poll.id) || [];
      const pollChoices = choices?.filter(c => c.poll_id === poll.id) || [];

      const counts: Record<string, number> = {};
      pollChoices.forEach(c => counts[c.choice] = 0);
      pollVotes.forEach(v => {
        if (counts[v.choice] !== undefined) counts[v.choice]++;
      });

      const total = pollVotes.length;
      const results = pollChoices.map(c => ({
        choice: c.choice,
        count: counts[c.choice],
        percentage: total > 0 ? (counts[c.choice] / total) * 100 : 0
      }));

      return {
        ...poll,
        creator_email: 'Anonymous',
        total_votes: total,
        results,
        user_has_voted: false, // Not relevant for admin view
        user_vote_choice: undefined,
        icon: poll.icon
      } as PollWithResults;
    });

    return { success: true, polls: pollsWithResults };
  } catch (e) {
    console.error('[fetchModerationPolls] Error:', e);
    return { success: false, error: 'Failed to fetch moderation queue.' };
  }
}

/**
 * Restores a removed or flagged poll to ACTIVE status.
 */
export async function restorePoll(pollId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
      .from('polls')
      .update({
        status: 'ACTIVE',
        deleted_at: null,
        // Optional: clear any review notes/reasons if we had them
      })
      .eq('id', pollId);

    if (error) throw error;
    revalidatePath('/');
    revalidatePath(`/poll/${pollId}`);
    return { success: true };
  } catch (e) {
    console.error('[restorePoll] Error:', e);
    return { success: false, error: 'Failed to restore poll.' };
  }
}

/**
 * Alias for restorePoll specific to clearing flags.
 */
export async function unflagPoll(pollId: string): Promise<ActionResponse> {
  return restorePoll(pollId);
}

/**
 * Permanently deletes a poll and all associated data from the database.
 * This is an IRREVERSIBLE admin action.
 */
export async function permanentlyDeletePoll(pollId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminSupabaseClient();

    // Deleting from 'polls' will cascade to 'polls_choices' and 'votes' 
    // IF the foreign key constraints are set to ON DELETE CASCADE.
    // Based on previous schema checks, they usually are.
    const { error } = await adminSupabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) {
      console.error('[permanentlyDeletePoll] Error:', error);
      return { success: false, error: `Permanent deletion failed: ${error.message}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('[permanentlyDeletePoll] Unexpected error:', e);
    return { success: false, error: 'Unexpected error during permanent deletion.' };
  }
}

// --- 3. Define Zod Schema for Poll Update Data ---
const UpdatePollSchema = z.object({
  pollId: z.string().uuid({ message: "Invalid Poll ID format." }),
  question_text: z.string().min(5, { message: "Question must be at least 5 characters long." }).max(200, { message: "Question must be less than 200 characters." }).optional(),
  color_theme_id: z.number().int().min(1).max(25).optional(), // Extended range for new colors
  icon: z.string().max(10).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ENDED', 'SCHEDULED']).optional(),
}).refine(data => data.question_text || data.color_theme_id || data.icon || data.status, {
  message: "At least one field (question, color, icon, or status) must be provided."
});

/**
 * Handles secure update of a poll.
 * Can update question text, color theme, and icon.
 */
export async function updatePoll(pollId: string, updates: { question_text?: string, color_theme_id?: number, icon?: string, status?: string }): Promise<ActionResponse> {
  const validationResult = UpdatePollSchema.safeParse({ pollId, ...updates });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message
    };
  }

  const validatedData = validationResult.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    // Check ownership first for better error message
    const { data: poll } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', validatedData.pollId)
      .single();

    if (!poll) {
      return { success: false, error: 'Poll not found.' };
    }

    // Check ownership or admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (poll.user_id !== user.id && !isAdmin) {
      return { success: false, error: 'You do not have permission to edit this poll.' };
    }

    // Dynamic update object
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (validatedData.question_text) updatePayload.question_text = validatedData.question_text;
    if (validatedData.color_theme_id) updatePayload.color_theme_id = validatedData.color_theme_id;
    if (validatedData.icon) updatePayload.icon = validatedData.icon;
    if (validatedData.status) updatePayload.status = validatedData.status;

    const { error } = await supabase
      .from('polls')
      .update(updatePayload)
      .eq('id', validatedData.pollId);

    if (error) {
      console.error('Error updating poll:', error);
      return { success: false, error: 'Failed to update poll.' };
    }

    revalidatePath(`/poll/${validatedData.pollId}`);
    revalidatePath('/');

    return { success: true };

  } catch (e) {
    console.error('Unexpected error in updatePoll:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// --- 4. Define Zod Schema for Poll Creation Data ---
const CreatePollSchema = z.object({
  question_text: z.string().min(5, { message: "Question must be at least 5 characters long." }).max(200, { message: "Question must be less than 200 characters." }),
  choices: z.array(z.string().min(1, { message: "Choice cannot be empty." })).min(2, { message: "At least 2 choices are required." }),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().nullable().optional(),
  is_premium_timer: z.boolean().optional().default(false),
});

/**
 * Handles secure creation of a new poll.
 */
export async function createPoll(formData: {
  question_text: string;
  choices: string[];
  starts_at?: string;
  ends_at?: string | null;
  is_premium_timer?: boolean;
}): Promise<ActionResponse> {
  const validationResult = CreatePollSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message
    };
  }

  const { question_text, choices, starts_at, ends_at, is_premium_timer } = validationResult.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    // Determine initial status
    const now = new Date();
    const startTime = starts_at ? new Date(starts_at) : now;
    let initialStatus = 'ACTIVE';

    if (startTime > now) {
      initialStatus = 'SCHEDULED';
    }

    // 1. Insert Poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question_text,
        user_id: user.id,
        status: initialStatus,
        starts_at: startTime.toISOString(),
        ends_at: ends_at || null,
        is_premium_timer: is_premium_timer || false,
        color_theme_id: Math.floor(Math.random() * 5) + 1,
      })
      .select('id')
      .single();

    if (pollError || !poll) {
      console.error('Error creating poll:', pollError);
      return { success: false, error: 'Failed to create poll.' };
    }

    // 2. Insert Choices
    const choicesPayload = choices.map((choice) => ({
      poll_id: poll.id,
      choice: choice.trim(),
    }));

    const { error: choicesError } = await supabase
      .from('polls_choices')
      .insert(choicesPayload);

    if (choicesError) {
      console.error('Error creating choices:', choicesError);
      // Ideally we would rollback the poll creation here, but for now we'll just error out.
      // A Supabase RPC function would be better for atomicity.
      return { success: false, error: `Failed to create choices: ${choicesError.message}` };
    }

    revalidatePath('/');
    return { success: true };

  } catch (e) {
    console.error('Unexpected error in createPoll:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}