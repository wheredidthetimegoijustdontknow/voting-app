-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table schema
create table public.profiles (
  id uuid not null default auth.uid (),
  username text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  email text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username)
) TABLESPACE pg_default;

create unique INDEX IF not exists profiles_username_idx on public.profiles using btree (username) TABLESPACE pg_default;

-- Polls table
create table public.polls (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  user_id uuid not null,
  question_text text not null,
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  status VARCHAR DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'REVIEW', 'REMOVED')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  last_vote_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium_timer BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  constraint polls_pkey primary key (id),
  constraint polls_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_polls_user_id on public.polls using btree (user_id) TABLESPACE pg_default;

-- Poll choices table
CREATE TABLE IF NOT EXISTS polls_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    choice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    choice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- RLS Policies for polls
CREATE POLICY "Polls are viewable by everyone"
ON polls FOR SELECT
USING (status NOT IN ('REVIEW', 'REMOVED'));

CREATE POLICY "Authenticated users can create polls"
ON polls FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own polls"
ON polls FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for polls_choices
CREATE POLICY "Poll choices are viewable by everyone"
ON polls_choices FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create poll choices"
ON polls_choices FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by everyone"
ON votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert votes"
ON votes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own votes"
ON votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON votes FOR DELETE
USING (auth.uid() = user_id);

-- Enable Real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE polls_choices;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_choices_poll_id ON polls_choices(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update last_vote_at on a poll
CREATE OR REPLACE FUNCTION public.update_poll_last_vote()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.polls 
    SET last_vote_at = NOW() 
    WHERE id = NEW.poll_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new votes to track activity
DROP TRIGGER IF EXISTS on_vote_update_last_vote ON public.votes;
CREATE TRIGGER on_vote_update_last_vote
    AFTER INSERT ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.update_poll_last_vote();
