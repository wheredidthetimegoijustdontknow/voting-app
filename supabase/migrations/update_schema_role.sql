-- Add role column to profiles
-- Role column already added in phase_8_profile_identity.sql migration
-- This file is deprecated, using enum from phase_8 instead

-- Update existing users if needed (usually default is enough)
UPDATE public.profiles SET role = 'admin' WHERE username = 'admin'; -- Optional: set a default admin if you know one
