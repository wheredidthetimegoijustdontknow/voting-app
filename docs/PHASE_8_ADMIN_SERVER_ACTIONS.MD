# ADMIN SERVER ACTIONS: lib/actions/admin.ts

This file contains the core logic for administrative overrides, using the Service Role Key to bypass standard RLS constraints where necessary.

-- TS START --
"use server";

import { createClient } from "@/lib/supabase/server"; // Standard client
import { createAdminClient } from "@/lib/supabase/admin"; // Service Role client
import { revalidatePath } from "next/cache";

/**
 * Update a user's role (Admin Only)
 */
export async function updateUserRole(userId: string, newRole: 'USER' | 'MODERATOR' | 'ADMIN') {
  const supabase = createAdminClient(); // Bypasses RLS
  
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
  const supabase = createAdminClient();
  
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
  const supabase = createAdminClient();
  
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
-- TS END --