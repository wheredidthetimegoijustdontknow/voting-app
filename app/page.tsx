import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchPollsWithResults } from '@/lib/polls/queries';
import { getCurrentProfile } from '@/app/actions/profile';
import PageClient from '@/components/PageClient';

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const polls = await fetchPollsWithResults();
  const currentUserId = user?.id;
  
  // Fetch current user's profile to get their username
  let currentUsername: string | undefined;
  if (user?.id) {
    try {
      const profileResult = await getCurrentProfile();
      if (profileResult.success && profileResult.data) {
        currentUsername = profileResult.data.username;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Continue without username if profile fetch fails
    }
  }

  return (
    <PageClient 
      polls={polls}
      userId={currentUserId || null}
      initialUsername={currentUsername}
    />
  );
}