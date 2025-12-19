-- Phase 8: Profile Identity & Expression Migration
-- Adds columns for user identity and expression features

-- Create Role Enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'MODERATOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Extend Profiles Table with identity and customization fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS aura_color VARCHAR(7) DEFAULT '#8A2BE2',
ADD COLUMN IF NOT EXISTS spirit_emoji VARCHAR(10) DEFAULT '👤',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'USER';

-- Update RLS to allow users to manage their own identity
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policy that allows updating bio, aura_color, spirit_emoji
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- Update the handle_new_user function to include default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, bio, aura_color, spirit_emoji, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        NEW.email,
        NULL, -- bio starts as null
        '#8A2BE2', -- default aura color
        '👤', -- default spirit emoji
        'USER' -- default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users with default values
UPDATE public.profiles 
SET 
    aura_color = COALESCE(aura_color, '#8A2BE2'),
    spirit_emoji = COALESCE(spirit_emoji, '👤'),
    role = COALESCE(role, 'USER')
WHERE aura_color IS NULL OR spirit_emoji IS NULL OR role IS NULL;