-- Add icon column to polls table
ALTER TABLE public.polls 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📊';

-- Update existing polls to have the default icon if they don't have one
UPDATE public.polls SET icon = '📊' WHERE icon IS NULL;
