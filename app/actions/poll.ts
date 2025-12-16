// app/actions/poll.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
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

    if (pollError || !poll) {
      console.error('Error fetching poll:', pollError);
      return { success: false, error: 'Poll not found or access denied.' };
    }

    // Check if the current user is the creator of the poll
    if (poll.user_id !== user.id) {
      return { success: false, error: 'You can only delete your own polls.' };
    }

    // Delete related votes first (foreign key constraint)
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', validatedData.pollId);

    if (votesError) {
      console.error('Error deleting votes:', votesError);
      return { success: false, error: `Failed to delete poll votes: ${votesError.message}` };
    }

    // Delete poll choices
    const { error: choicesError } = await supabase
      .from('polls_choices')
      .delete()
      .eq('poll_id', validatedData.pollId);

    if (choicesError) {
      console.error('Error deleting poll choices:', choicesError);
      return { success: false, error: `Failed to delete poll choices: ${choicesError.message}` };
    }

    // Finally, delete the poll itself
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', validatedData.pollId);

    if (deleteError) {
      console.error('Error deleting poll:', deleteError);
      return { success: false, error: `Failed to delete poll: ${deleteError.message}` };
    }

    // Revalidate relevant paths
    revalidatePath('/'); // Home page with poll list
    revalidatePath(`/poll/${validatedData.pollId}`); // Individual poll page

    return { success: true };
    
  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}