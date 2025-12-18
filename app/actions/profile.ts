// app/actions/profile.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the expected return shape for the client
export interface ActionResponse {
  success: boolean;
  error?: string;
  data?: {
    username: string;
    userId: string;
    role?: string;
  };
}

// --- 1. Define Zod Schema for Profile Creation Data ---
const CreateProfileSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username must be no more than 20 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." })
    .transform(username => username.toLowerCase()), // Convert to lowercase for consistency
});

/**
 * Creates a user profile for authenticated users who don't have one yet.
 * This Server Action runs securely on the server with Zod validation.
 * Handles user sign-up/onboarding process.
 * @param username - The desired username for the profile
 */
export async function createProfile(username: string): Promise<ActionResponse> {
  // --- 2. Server-side Validation with Zod ---
  const validationResult = CreateProfileSchema.safeParse({ username });

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
      return { success: false, error: 'Authentication required to create a profile.' };
    }

    // Check if user already has a profile
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new users
      console.error('Error checking existing profile:', profileCheckError);
      return { success: false, error: 'Failed to check existing profile.' };
    }

    if (existingProfile) {
      return {
        success: false,
        error: 'You already have a profile. Profile can only be created once.'
      };
    }

    // Check if username is already taken
    const { data: usernameCheck, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedData.username)
      .single();

    if (usernameCheck) {
      return {
        success: false,
        error: 'This username is already taken. Please choose a different one.'
      };
    }

    if (usernameError && usernameError.code !== 'PGRST116') {
      console.error('Error checking username availability:', usernameError);
      return { success: false, error: 'Failed to check username availability.' };
    }

    // Create the profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id, // Use the authenticated user's ID
        username: validatedData.username,
      })
      .select('username, id')
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return { success: false, error: `Failed to create profile: ${createError.message}` };
    }

    // Revalidate relevant paths
    revalidatePath('/'); // Home page
    revalidatePath('/profile'); // Profile page if it exists

    return {
      success: true,
      data: {
        username: newProfile.username,
        userId: newProfile.id,
      }
    };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Updates a user's profile username.
 * @param newUsername - The new desired username
 */
export async function updateProfileUsername(newUsername: string): Promise<ActionResponse> {
  // --- 2. Server-side Validation with Zod ---
  const validationResult = CreateProfileSchema.safeParse({ username: newUsername });

  if (!validationResult.success) {
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
      return { success: false, error: 'Authentication required to update profile.' };
    }

    // Check if username is already taken by someone else
    const { data: usernameCheck, error: usernameError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', validatedData.username)
      .neq('id', user.id) // Exclude current user's own profile
      .single();

    if (usernameCheck) {
      return {
        success: false,
        error: 'This username is already taken. Please choose a different one.'
      };
    }

    if (usernameError && usernameError.code !== 'PGRST116') {
      console.error('Error checking username availability:', usernameError);
      return { success: false, error: 'Failed to check username availability.' };
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ username: validatedData.username })
      .eq('id', user.id)
      .select('username, id')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: `Failed to update profile: ${updateError.message}` };
    }

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/profile');

    return {
      success: true,
      data: {
        username: updatedProfile.username,
        userId: updatedProfile.id,
      }
    };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Gets the current user's profile information.
 */
export async function getCurrentProfile(): Promise<ActionResponse & { data?: { username: string; userId: string; role: string } }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Authentication required to get profile.' };
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist
        return { success: true, data: undefined };
      }

      // Fallback: If role column is missing (e.g. migration not run), try fetching without it
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from('profiles')
        .select('username, id')
        .eq('id', user.id)
        .single();

      if (!fallbackError && fallbackProfile) {
        return {
          success: true,
          data: {
            username: fallbackProfile.username,
            userId: fallbackProfile.id,
            role: 'user', // Default to user if column missing
          }
        };
      }

      console.error('Error fetching profile:', profileError);
      return { success: false, error: 'Failed to fetch profile.' };
    }

    return {
      success: true,
      data: {
        username: profile.username,
        userId: profile.id,
        role: profile.role || 'user',
      }
    };

  } catch (e) {
    console.error('General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}