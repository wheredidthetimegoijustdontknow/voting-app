// app/actions/vote.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod'; // Import Zod

// --- 1. Define Zod Schema for Vote Data ---

const VoteSchema = z.object({
  // poll_id must be a UUID format (or a string that looks like one)
  // Since UUID validation can be strict, we'll enforce a non-empty string 
  // and assume our database structure ensures a valid key exists.
  poll_id: z.string().uuid({ message: "Invalid Poll ID format. Must be a UUID." }),

  // choice must be a non-empty string
  choice: z.string().min(1, { message: "Choice cannot be empty." }),
  
  // Optional impersonation info
  impersonated_user_id: z.string().uuid().nullable().optional(),
});

// Define the expected return shape for the client
interface ActionResponse {
  success: boolean;
  error: string | null;
  // We can return the validated data shape for type safety if needed
  data?: z.infer<typeof VoteSchema> | null;
}


/**
 * Handles a user submitting a vote.
 * This Server Action runs securely on the server with Zod validation.
 * @param formData - The form data passed from the client form submission.
 */
export async function submitVote(formData: FormData): Promise<ActionResponse> {
  console.log('🔍 [submitVote] === SERVER ACTION STARTED ===');
  console.log('🔍 [submitVote] Raw FormData received:', {
    poll_id: formData.get('poll_id'),
    choice: formData.get('choice'),
    impersonated_user_id: formData.get('impersonated_user_id'),
    timestamp: new Date().toISOString()
  });
  
  // 2. Extract and transform FormData to a plain object
  const rawData = {
    poll_id: formData.get('poll_id'),
    choice: formData.get('choice'),
    impersonated_user_id: formData.get('impersonated_user_id'),
  };
  
  console.log('🔍 [submitVote] Extracted rawData:', rawData);

  // --- 3. Server-side Validation with Zod ---
  console.log('🔍 [submitVote] Starting Zod validation...');
  const validationResult = VoteSchema.safeParse(rawData);

  if (!validationResult.success) {
    // If validation fails, return a client-friendly error message
    const validationError = validationResult.error.issues[0].message;
    console.error('❌ [submitVote] Zod validation failed:', validationResult.error.issues);
    return {
      success: false,
      error: `Input validation failed: ${validationError}`,
      data: null
    };
  }

  // Validated data is now type-safe and ready for the database
  const validatedData = validationResult.data;
  console.log('✅ [submitVote] Zod validation passed:', validatedData);

  try {
    const supabase = await createServerSupabaseClient();
    console.log('🔍 [submitVote] Supabase client created');

    // Check if the user is authenticated (Optional, but good practice for double-check)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 [submitVote] Current authenticated user:', user?.id);
    
    if (!user) {
      console.error('❌ [submitVote] No authenticated user found');
      // RLS should catch this, but checking explicitly provides a better error message.
      return { success: false, error: 'Authentication required to submit a vote.', data: null };
    }

    // 4. Check if user has already voted on this poll
    const userIdToUse = validatedData.impersonated_user_id || user.id;
    console.log('🔍 [submitVote] Determining user ID to use:', {
      currentUserId: user.id,
      impersonatedUserId: validatedData.impersonated_user_id,
      finalUserId: userIdToUse,
      isImpersonating: !!validatedData.impersonated_user_id
    });
    
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', validatedData.poll_id)
      .eq('user_id', userIdToUse)
      .single();
      
    console.log('🔍 [submitVote] Existing vote check result:', existingVote);
      
    if (existingVote) {
      console.error('❌ [submitVote] User has already voted on this poll');
      return { success: false, error: 'You have already voted on this poll.', data: null };
    }
    
    // 5. Insert the validated vote row
    console.log('🔍 [submitVote] Inserting vote into database...', {
      poll_id: validatedData.poll_id,
      choice: validatedData.choice,
      user_id: userIdToUse
    });
    
    const { error } = await supabase.from('votes').insert([
      {
        poll_id: validatedData.poll_id,
        choice: validatedData.choice,
        user_id: userIdToUse // Use impersonated user ID if provided, otherwise current user
      },
    ]);

    if (error) {
      console.error('❌ [submitVote] Supabase vote error:', error);
      // RLS failure (e.g., trying to vote twice if RLS is configured that way) 
      // or a foreign key error will be caught here.
      return { success: false, error: `Database error: ${error.message}`, data: null };
    }

    console.log('✅ [submitVote] Vote inserted successfully!');
    
    // 5. Success and cache revalidation
    console.log('🔍 [submitVote] Revalidating path:', `/poll/${validatedData.poll_id}`);
    revalidatePath(`/poll/${validatedData.poll_id}`);
    console.log('✅ [submitVote] === SERVER ACTION COMPLETED SUCCESSFULLY ===');
    return { success: true, error: null };

  } catch (e) {
    console.error('💥 [submitVote] General Server Action error:', e);
    console.error('💥 [submitVote] Error details:', {
      name: e instanceof Error ? e.name : 'Unknown',
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    });
    return { success: false, error: 'An unexpected server error occurred.', data: null };
  }
}

// --- Retract Vote Action ---

const RetractVoteSchema = z.object({
  poll_id: z.string().uuid({ message: "Invalid Poll ID format." }),
});

export async function retractVote(pollId: string): Promise<ActionResponse> {
  const validationResult = RetractVoteSchema.safeParse({ poll_id: pollId });

  if (!validationResult.success) {
    return { success: false, error: "Invalid Poll ID.", data: null };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required.', data: null };
    }

    const { error } = await supabase
      .from('votes')
      .delete()
      .match({ poll_id: pollId, user_id: user.id });

    if (error) {
      console.error('Error retracting vote:', error);
      return { success: false, error: error.message, data: null };
    }

    revalidatePath('/'); // Revalidate home/list
    revalidatePath(`/poll/${pollId}`); // Revalidate specific poll
    return { success: true, error: null };

  } catch (e) {
    console.error('Retract vote error:', e);
    return { success: false, error: 'Server error.', data: null };
  }
}