import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchPollsWithResults } from '@/lib/polls/queries';
import PageClient from '@/components/PageClient';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const polls = await fetchPollsWithResults();

  return (
    <PageClient
      polls={polls}
      userId={user?.id || null}
    />
  );
}