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
  // 2. Extract and transform FormData to a plain object
  const rawData = {
    poll_id: formData.get('poll_id'),
    choice: formData.get('choice'),
  };

  // --- 3. Server-side Validation with Zod ---
  const validationResult = VoteSchema.safeParse(rawData);

  if (!validationResult.success) {
    // If validation fails, return a client-friendly error message
    const validationError = validationResult.error.issues[0].message;
    console.error('Zod validation failed:', validationResult.error.issues);
    return { 
      success: false, 
      error: `Input validation failed: ${validationError}`, 
      data: null 
    };
  }

  // Validated data is now type-safe and ready for the database
  const validatedData = validationResult.data;

  try {
    const supabase = await createServerSupabaseClient();
    
    // Check if the user is authenticated (Optional, but good practice for double-check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // RLS should catch this, but checking explicitly provides a better error message.
        return { success: false, error: 'Authentication required to submit a vote.', data: null };
    }
    
    // 4. Insert the validated vote row
    const { error } = await supabase.from('votes').insert([
      { 
        poll_id: validatedData.poll_id, 
        choice: validatedData.choice 
      },
    ]);

    if (error) {
      console.error('Supabase vote error:', error);
      // RLS failure (e.g., trying to vote twice if RLS is configured that way) 
      // or a foreign key error will be caught here.
      return { success: false, error: `Database error: ${error.message}`, data: null };
    }

    // 5. Success and cache revalidation
    revalidatePath(`/poll/${validatedData.poll_id}`);
    return { success: true, error: null };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.', data: null };
  }
}