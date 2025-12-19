// Phase 8: Extended Profile interface for user identity and expression

export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  aura_color: string;
  spirit_emoji: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  last_vote_at?: string;
}

// Archetype calculation types
export type ArchetypeTitle = 
  | "The Early Bird" 
  | "The Night Owl" 
  | "The Contrarian" 
  | "The Trendsetter" 
  | "The Specialist";

export interface ArchetypeStats {
  averageVoteDelayMinutes: number;
  minorityVotePercentage: number;
  topCategoryPercentage: number;
  mostActiveHour: number;
}

// Admin impersonation types
export interface AdminImpersonation {
  isImpersonating: boolean;
  impersonatedUserId?: string;
  originalUserId?: string;
}

// Poll override types for admin actions
export interface PollOverride {
  pollId: string;
  status?: string;
  end_time?: string;
  accent_color?: string;
}

// Profile update types
export interface ProfileUpdate {
  bio?: string;
  aura_color?: string;
  spirit_emoji?: string;
}