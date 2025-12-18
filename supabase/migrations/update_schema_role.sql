-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Update existing users if needed (usually default is enough)
UPDATE public.profiles SET role = 'admin' WHERE username = 'admin'; -- Optional: set a default admin if you know one
