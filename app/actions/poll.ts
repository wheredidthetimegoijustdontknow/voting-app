// app/actions/poll.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the expected return shape for the client
export interface ActionResponse {
  success: boolean;
  error?: string;
}

// --- 1. Define Zod Schema for Poll Deletion Data ---
const DeletePollSchema = z.object({
  pollId: z.string().uuid({ message: "Invalid Poll ID format. Must be a UUID." }),
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

    // Use ADMIN client to perform the deletion
    console.log('[deletePoll] Proceeding with Admin deletion...');

    // 1. Delete associated choices and votes via admin client
    const { error: votesError } = await adminSupabase.from('votes').delete().eq('poll_id', validatedData.pollId);
    if (votesError) console.error('[deletePoll] Admin votes delete error:', votesError);

    const { error: choicesError } = await adminSupabase.from('polls_choices').delete().eq('poll_id', validatedData.pollId);
    if (choicesError) console.error('[deletePoll] Admin choices delete error:', choicesError);

    // 2. Finally, delete the poll itself
    const { error: deleteError } = await adminSupabase
      .from('polls')
      .delete()
      .eq('id', validatedData.pollId);

    if (deleteError) {
      console.error('[deletePoll] Admin poll delete error:', deleteError);
      return { success: false, error: `Failed to delete poll: ${deleteError.message}` };
    }

    console.log('[deletePoll] Successfully deleted poll:', validatedData.pollId);

    // Revalidate relevant paths
    revalidatePath('/'); // Home page with poll list
    revalidatePath(`/poll/${validatedData.pollId}`); // Individual poll page

    return { success: true };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

// --- 3. Define Zod Schema for Poll Update Data ---
const UpdatePollSchema = z.object({
  pollId: z.string().uuid({ message: "Invalid Poll ID format." }),
  question_text: z.string().min(5, { message: "Question must be at least 5 characters long." }).max(200, { message: "Question must be less than 200 characters." }),
});

/**
 * Handles secure update of a poll.
 * Only the question text can be updated to protect integrity of existing votes.
 */
export async function updatePoll(pollId: string, question_text: string): Promise<ActionResponse> {
  const validationResult = UpdatePollSchema.safeParse({ pollId, question_text });

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

    // Attempt update. RLS policies "Users can update their own polls" should handle permission.
    // However, Supabase RLS failure usually results in 0 rows affected or error, 
    // but explicit check is friendlier.

    // Check ownership first for better error message
    const { data: poll } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', validatedData.pollId)
      .single();

    if (!poll) {
      return { success: false, error: 'Poll not found.' };
    }

    if (poll.user_id !== user.id) {
      return { success: false, error: 'You do not have permission to edit this poll.' };
    }

    const { error } = await supabase
      .from('polls')
      .update({ question_text: validatedData.question_text, updated_at: new Date().toISOString() })
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
});

/**
 * Handles secure creation of a new poll.
 */
export async function createPoll(formData: { question_text: string; choices: string[] }): Promise<ActionResponse> {
  const validationResult = CreatePollSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message
    };
  }

  const { question_text, choices } = validationResult.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    // 1. Insert Poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question_text,
        user_id: user.id,
        color_theme_id: Math.floor(Math.random() * 5) + 1, // Random theme 1-5
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