// app/actions/users.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the expected return shape for the client
export interface ActionResponse {
  success: boolean;
  error?: string;
  data?: any;
}

// --- 1. Define Zod Schemas for User Actions ---

const DMUserSchema = z.object({
  targetUsername: z.string()
    .min(1, { message: "Target username is required." })
    .max(20, { message: "Username must be no more than 20 characters." }),
  message: z.string()
    .min(1, { message: "Message cannot be empty." })
    .max(500, { message: "Message must be no more than 500 characters." }),
});

const WaveUserSchema = z.object({
  targetUsername: z.string()
    .min(1, { message: "Target username is required." })
    .max(20, { message: "Username must be no more than 20 characters." }),
});

const ReportUserSchema = z.object({
  targetUsername: z.string()
    .min(1, { message: "Target username is required." })
    .max(20, { message: "Username must be no more than 20 characters." }),
  reason: z.string()
    .min(1, { message: "Report reason is required." })
    .max(200, { message: "Report reason must be no more than 200 characters." }),
  category: z.enum(['spam', 'harassment', 'inappropriate_content', 'other']),
});

/**
 * Send a direct message to another user
 * For now, this creates a notification record - can be enhanced to full messaging later
 */
export async function sendDirectMessage(formData: FormData): Promise<ActionResponse> {
  console.log('🔍 [sendDirectMessage] === SERVER ACTION STARTED ===');
  
  const rawData = {
    targetUsername: formData.get('targetUsername'),
    message: formData.get('message'),
  };
  
  console.log('🔍 [sendDirectMessage] Raw data:', rawData);

  // --- Server-side Validation with Zod ---
  const validationResult = DMUserSchema.safeParse(rawData);

  if (!validationResult.success) {
    const validationError = validationResult.error.issues[0].message;
    console.error('❌ [sendDirectMessage] Zod validation failed:', validationResult.error.issues);
    return {
      success: false,
      error: `Input validation failed: ${validationError}`
    };
  }

  const validatedData = validationResult.data;
  console.log('✅ [sendDirectMessage] Validation passed:', validatedData);

  try {
    const supabase = await createServerSupabaseClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ [sendDirectMessage] No authenticated user found');
      return { success: false, error: 'Authentication required to send messages.' };
    }

    // Find the target user
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', validatedData.targetUsername)
      .single();

    if (targetError || !targetUser) {
      console.error('❌ [sendDirectMessage] Target user not found:', targetError);
      return { success: false, error: 'Target user not found.' };
    }

    // Prevent self-messaging
    if (targetUser.id === user.id) {
      return { success: false, error: 'You cannot send a message to yourself.' };
    }

    // For now, we'll create a notification record
    // In a full implementation, this could create a message in a messages table
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: targetUser.id,
          type: 'dm_request',
          title: 'New Direct Message',
          message: `You have a new message request from @${(await getCurrentUsername(user.id)).username}`,
          data: {
            from_user_id: user.id,
            from_username: (await getCurrentUsername(user.id)).username,
            message: validatedData.message,
            message_type: 'dm_request'
          },
          read: false
        }
      ]);

    if (notificationError) {
      console.error('❌ [sendDirectMessage] Failed to create notification:', notificationError);
      return { success: false, error: 'Failed to send message. Please try again.' };
    }

    console.log('✅ [sendDirectMessage] Message notification created successfully');
    
    // Revalidate relevant paths
    revalidatePath('/users');
    
    return {
      success: true,
      data: {
        message: `Message sent to @${targetUser.username}`,
        targetUsername: targetUser.username
      }
    };

  } catch (e) {
    console.error('💥 [sendDirectMessage] General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Wave at another user - a friendly greeting feature
 */
export async function waveAtUser(formData: FormData): Promise<ActionResponse> {
  console.log('🔍 [waveAtUser] === SERVER ACTION STARTED ===');
  
  const rawData = {
    targetUsername: formData.get('targetUsername'),
  };
  
  console.log('🔍 [waveAtUser] Raw data:', rawData);

  // --- Server-side Validation with Zod ---
  const validationResult = WaveUserSchema.safeParse(rawData);

  if (!validationResult.success) {
    const validationError = validationResult.error.issues[0].message;
    console.error('❌ [waveAtUser] Zod validation failed:', validationResult.error.issues);
    return {
      success: false,
      error: `Input validation failed: ${validationError}`
    };
  }

  const validatedData = validationResult.data;
  console.log('✅ [waveAtUser] Validation passed:', validatedData);

  try {
    const supabase = await createServerSupabaseClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ [waveAtUser] No authenticated user found');
      return { success: false, error: 'Authentication required to wave at users.' };
    }

    // Find the target user
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', validatedData.targetUsername)
      .single();

    if (targetError || !targetUser) {
      console.error('❌ [waveAtUser] Target user not found:', targetError);
      return { success: false, error: 'Target user not found.' };
    }

    // Prevent waving at self
    if (targetUser.id === user.id) {
      return { success: false, error: 'You cannot wave at yourself.' };
    }

    // Create a wave notification
    const currentUsername = await getCurrentUsername(user.id);
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: targetUser.id,
          type: 'wave',
          title: '👋 Someone waved at you!',
          message: `@${currentUsername.username} waved at you!`,
          data: {
            from_user_id: user.id,
            from_username: currentUsername.username,
            wave_type: 'greeting'
          },
          read: false
        }
      ]);

    if (notificationError) {
      console.error('❌ [waveAtUser] Failed to create wave notification:', notificationError);
      return { success: false, error: 'Failed to send wave. Please try again.' };
    }

    console.log('✅ [waveAtUser] Wave notification created successfully');
    
    // Revalidate relevant paths
    revalidatePath('/users');
    
    return {
      success: true,
      data: {
        message: `You waved at @${targetUser.username}! 👋`,
        targetUsername: targetUser.username
      }
    };

  } catch (e) {
    console.error('💥 [waveAtUser] General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Report a user for inappropriate behavior
 */
export async function reportUser(formData: FormData): Promise<ActionResponse> {
  console.log('🔍 [reportUser] === SERVER ACTION STARTED ===');
  
  const rawData = {
    targetUsername: formData.get('targetUsername'),
    reason: formData.get('reason'),
    category: formData.get('category'),
  };
  
  console.log('🔍 [reportUser] Raw data:', rawData);

  // --- Server-side Validation with Zod ---
  const validationResult = ReportUserSchema.safeParse(rawData);

  if (!validationResult.success) {
    const validationError = validationResult.error.issues[0].message;
    console.error('❌ [reportUser] Zod validation failed:', validationResult.error.issues);
    return {
      success: false,
      error: `Input validation failed: ${validationError}`
    };
  }

  const validatedData = validationResult.data;
  console.log('✅ [reportUser] Validation passed:', validatedData);

  try {
    const supabase = await createServerSupabaseClient();

    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ [reportUser] No authenticated user found');
      return { success: false, error: 'Authentication required to report users.' };
    }

    // Find the target user
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', validatedData.targetUsername)
      .single();

    if (targetError || !targetUser) {
      console.error('❌ [reportUser] Target user not found:', targetError);
      return { success: false, error: 'Target user not found.' };
    }

    // Prevent self-reporting
    if (targetUser.id === user.id) {
      return { success: false, error: 'You cannot report yourself.' };
    }

    // Create a report record
    const currentUsername = await getCurrentUsername(user.id);
    
    const { error: reportError } = await supabase
      .from('user_reports')
      .insert([
        {
          reported_user_id: targetUser.id,
          reporting_user_id: user.id,
          category: validatedData.category,
          reason: validatedData.reason,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);

    if (reportError) {
      console.error('❌ [reportUser] Failed to create report:', reportError);
      return { success: false, error: 'Failed to submit report. Please try again.' };
    }

    // Notify moderators/admins about the report
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: user.id, // Send confirmation to the reporter
          type: 'report_submitted',
          title: 'Report Submitted',
          message: `Your report against @${targetUser.username} has been submitted for review.`,
          data: {
            reported_user_id: targetUser.id,
            reported_username: targetUser.username,
            category: validatedData.category,
            report_id: Date.now() // Simple ID generation - could be improved
          },
          read: false
        }
      ]);

    if (notificationError) {
      console.error('❌ [reportUser] Failed to create confirmation notification:', notificationError);
      // Don't fail the whole operation for this
    }

    console.log('✅ [reportUser] Report submitted successfully');
    
    // Revalidate relevant paths
    revalidatePath('/users');
    
    return {
      success: true,
      data: {
        message: `Report submitted against @${targetUser.username}. Our moderation team will review it.`,
        targetUsername: targetUser.username,
        category: validatedData.category
      }
    };

  } catch (e) {
    console.error('💥 [reportUser] General Server Action error:', e);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Helper function to get current user's username
 */
async function getCurrentUsername(userId: string): Promise<{ username: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();
    
  return { username: profile?.username || 'Unknown User' };
}