// Phase 8: Admin Server Actions
// Core logic for administrative overrides using Service Role Key

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server"; // Standard client
import { createAdminSupabaseClient } from "@/lib/supabase/admin"; // Service Role client
import { revalidatePath } from "next/cache";

/**
 * Update a user's role (Admin Only)
 */
export async function updateUserRole(userId: string, newRole: 'USER' | 'MODERATOR' | 'ADMIN') {
  const supabase = createAdminSupabaseClient(); // Bypasses RLS
  
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard");
}

/**
 * Override Poll Configuration
 * Allows changing end dates or forcing status changes for any poll
 */
export async function adminUpdatePoll(pollId: string, updates: { 
  status?: string, 
  end_time?: string,
  accent_color?: string 
}) {
  const supabase = createAdminSupabaseClient();
  
  const { error } = await supabase
    .from("polls")
    .update(updates)
    .eq("id", pollId);

  if (error) throw new Error(error.message);
  revalidatePath("/"); // Update home feed
  revalidatePath(`/poll/${pollId}`);
}

/**
 * Content Moderation: Reset User Identity
 * Resets Aura, Emoji, or Bio if flagged as inappropriate
 */
export async function resetUserIdentity(userId: string) {
  const supabase = createAdminSupabaseClient();
  
  const { error } = await supabase
    .from("profiles")
    .update({
      bio: "Identity reset by moderator.",
      aura_color: "#8A2BE2",
      spirit_emoji: "👤"
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/dashboard");
}

/**
 * Get all profiles for admin dashboard
 */
export async function getAllProfiles() {
  const supabase = createAdminSupabaseClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, bio, aura_color, spirit_emoji, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Impersonate user (Admin Only) - Sets session for local simulation
 */
export async function setImpersonatedUser(userId: string) {
  // This would typically set a session variable or cookie
  // For now, we'll return the user data that can be used by the frontend
  const supabase = createAdminSupabaseClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, bio, aura_color, spirit_emoji, role")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}



/**
 * Clear impersonation
 */
export async function clearImpersonation() {
  // Clear session variables/cookies
  revalidatePath("/"); // Refresh all pages
  revalidatePath("/admin/dashboard");
}

/**
 * Bot Management Functions
 * Wrappers around bot-manager.ts functions for server actions
 */

import { createBots, deleteBots, simulateSingleStep, clearBotVotes, getBotStats, listBots } from '@/lib/admin/bot-manager';

/**
 * Create new bots (Admin Only)
 */
export async function createNewBots(formData: FormData) {
  const count = parseInt(formData.get('count') as string) || 5;
  
  try {
    const result = await createBots(count);
    
    if (result.errors.length > 0) {
      console.error('Bot creation errors:', result.errors);
    }
    
    revalidatePath("/"); // Refresh all pages
    revalidatePath("/admin/dashboard");
    
    return {
      success: true,
      created: result.created,
      error: result.errors.length > 0 ? 'Some bots failed to create' : null
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

/**
 * Remove bots (Admin Only)
 */
export async function removeBots(formData: FormData) {
  const count = parseInt(formData.get('count') as string) || 5;
  
  try {
    const result = await deleteBots(count);
    
    if (result.errors.length > 0) {
      console.error('Bot deletion errors:', result.errors);
    }
    
    revalidatePath("/"); // Refresh all pages
    revalidatePath("/admin/dashboard");
    
    return {
      success: true,
      deleted: result.deleted,
      error: result.errors.length > 0 ? 'Some bots failed to delete' : null
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

/**
 * Run simulation step (Admin Only)
 */
export async function runSimulationStep() {
  try {
    const result = await simulateSingleStep();
    
    revalidatePath("/"); // Refresh all pages
    revalidatePath("/admin/dashboard");
    
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

/**
 * Clear all bot votes (Admin Only)
 */
export async function clearAllBotVotes() {
  try {
    const result = await clearBotVotes();
    
    if (result.errors.length > 0) {
      console.error('Vote clearing errors:', result.errors);
    }
    
    revalidatePath("/"); // Refresh all pages
    revalidatePath("/admin/dashboard");
    
    return {
      success: true,
      deleted: result.deleted,
      error: result.errors.length > 0 ? 'Some votes failed to clear' : null
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

/**
 * Updated fetchBotStats to use bot-manager
 */
export async function fetchBotStats() {
  try {
    const stats = await getBotStats();
    return stats;
  } catch (error: any) {
    console.error('Error fetching bot stats:', error);
    return { totalBots: 0, totalBotVotes: 0 };
  }
}

/**
 * Fetch all bots for admin dashboard
 */
export async function fetchBots() {
  try {
    const bots = await listBots();
    return bots;
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    return [];
  }
}
