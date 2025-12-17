# Supabase Permissions & RLS Policies

This document serves as a reference for the Row Level Security (RLS) policies and custom functions established in the Supabase database.

## Auth Functions

### `auth.role()`
Returns the role of the current user from the JWT.
```sql
CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$
```

### `auth.uid()`
Returns the UID of the current user from the JWT.
```sql
CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$
```

## RLS Status (Enabled)

The following tables have Row Level Security enabled:

- `auth.users`
- `public.polls`
- `public.polls_choices`
- `public.profiles`
- `public.votes`
- `storage.buckets`
- ... (and others in auth, realtime, storage)

## Public Schema Policies

### `public.polls`
- **View**: Anyone can view all polls.
- **Insert**: Authenticated users can create polls.
- **Update/Delete**: Only the poll creator can update or delete their polls.

### `public.profiles`
- **View**: Public profiles are viewable by everyone.
- **Insert/Update**: Users can only insert or update their own profile record.

### `public.votes`
- **View**: Votes are viewable by everyone.
- **Insert**: Authenticated users can insert votes (one per poll per user).
- **Update/Delete**: Users can only update or delete their own votes.

---

## Bot Simulation Compatibility (God Mode)

The bot simulation system operates in what we refer to as **"God Mode"**.

### Administrative Access
Unlike regular users who are restricted by Row Level Security (RLS) policies, the bot simulation system uses the **Supabase Service Role Key**. This key is used server-side in `lib/admin/bot-manager.ts` and `lib/actions/admin.ts`.

### Why "God Mode"?
- **RLS Bypass**: Actions performed with the Service Role Key completely bypass RLS. This is necessary because bots cannot "log in" via standard client-side authentication during a server-side simulation.
- **Data Management**: God Mode allows the `clearBotVotes` function to delete records across all "bot" user accounts without the database requiring an `auth.uid() = user_id` match.
- **Simulation Speed**: It allows the `simulateVoting` function to insert votes for multiple different bot accounts in a single execution loop without session switching.

> [!CAUTION]
> The Service Role Key should **NEVER** be exposed to the client-side. It is strictly for administrative use in secure server environments.
