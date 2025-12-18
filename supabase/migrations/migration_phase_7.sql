-- Phase 7: Poll Constraints Migration

-- 1. Add new columns to the polls table
ALTER TABLE public.polls 
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'REVIEW', 'REMOVED')),
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_vote_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_premium_timer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create function to update last_vote_at
CREATE OR REPLACE FUNCTION public.update_poll_last_vote()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.polls 
    SET last_vote_at = NOW() 
    WHERE id = NEW.poll_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger for new votes
DROP TRIGGER IF EXISTS on_vote_update_last_vote ON public.votes;
CREATE TRIGGER on_vote_update_last_vote
AFTER INSERT ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.update_poll_last_vote();

-- 4. Update RLS Policies for visibility
DROP POLICY IF EXISTS "Polls are viewable by everyone" ON public.polls;
CREATE POLICY "Polls are viewable by everyone"
ON public.polls FOR SELECT
USING (status NOT IN ('REVIEW', 'REMOVED'));

-- 5. Admin Policy (Allow all access to admins)
-- Note: This assumes service_role or a specific admin check. 
-- For now, we ensure the public policy is restrictive.

-- 6. Status Automation Function
-- This function can be called by a cron job or an edge function
CREATE OR REPLACE FUNCTION public.automate_poll_statuses()
RETURNS void AS $$
BEGIN
    -- 1. Scheduled -> Active
    UPDATE public.polls 
    SET status = 'ACTIVE'
    WHERE status = 'SCHEDULED' AND starts_at <= NOW();

    -- 2. Active -> Ended
    UPDATE public.polls 
    SET status = 'ENDED'
    WHERE status IN ('ACTIVE', 'SCHEDULED') AND ends_at IS NOT NULL AND ends_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. (Optional) pg_cron setup (Requires pg_cron extension enabled)
-- SELECT cron.schedule('*/1 * * * *', 'SELECT public.automate_poll_statuses();');
