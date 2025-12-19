# PHASE 8 IMPLEMENTATION: User Identity & Refinement

This document serves as the technical blueprint for Phase 8 development. It follows an operational order: Backend -> Routing -> Features -> Admin Tools -> Refinement.

## 1. SQL Migration: Database Extension
Objective: Update the profiles table to support identity and roles.

-- SQL START --
-- Create Role Enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'MODERATOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Extend Profiles Table with customization fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS aura_color VARCHAR(7) DEFAULT '#8A2BE2',
ADD COLUMN IF NOT EXISTS spirit_emoji VARCHAR(10) DEFAULT '👤',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'USER';

-- Update RLS to allow users to manage their own identity
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
-- SQL END --

## 2. Structural UI: Routing & Layout
Objective: Establish the home for user expression.
* New Route: Create `app/profile/[username]/page.tsx` as a dynamic server component.
* Sidebar Integration: Update the global Sidebar to link the "Profiles" icon to the active user's profile.
* Page Layout: Use a header with the aura_color as a background gradient, followed by a bio section directly above the stats grid.

## 3. Identity Features: The Aura System
Objective: Bind user choices to the global UI.
* Aura Colors: Apply aura_color to the user's name in the ActivityFeed and profile header.
* Spirit Emoji: Replace static avatars with the spirit_emoji in the OnlineUsersBanner and Feed.
* Voter Archetypes: Implement logic to display titles like "The Early Bird" (votes within 5m of creation) or "The Contrarian" (votes for minority options). (Refer to Phase_8_Archetype _Calculation_Engine.MD)

## 4. Admin & Debug Tools
Objective: Enable local simulation and elevated control.
* Impersonation Mode: Add an admin-only toggle to "View as User" using the Service Role Key to bypass RLS for local simulation.
* Poll Overrides: Allow admins to manually change dates, time limits, or status for any poll.
* Customization Overrides: Admins can reset or change any user's color, emoji, or bio if flagged.

## 5. Refinements & Bug Fixes
* Activity Feed Fix: Ensure accentcolor highlights only the user's choice, not the entire row.
* Emoji Persistence: Incorporate the poll's specific emoji into every activity feed event.
* Transition Controls: Allow creators to move their polls from DRAFT/PENDING to ACTIVE manually.

## 6. Updated TypeScript Interfaces
Update your types/index.ts to ensure consistency.

-- TS START --
export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  aura_color: string;
  spirit_emoji: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  last_vote_at?: string; 
}
-- TS END --