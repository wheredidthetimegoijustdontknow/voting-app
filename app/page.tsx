import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchPollsWithResults } from '@/lib/polls/queries';
import AuthButton from '@/components/auth/AuthButton';
import CreatePollForm from '@/components/polls/CreatePollForm';
import PollingPollList from '@/components/polls/PollsContainer';  

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const polls = await fetchPollsWithResults();
  const currentUserId = user?.id;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Real-time Voting App
          </h1>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Poll Form */}
        <div className="mb-8">
          <CreatePollForm />
        </div>

        {/* Polls List with Polling */}
        <PollingPollList initialPolls={polls} userId={user?.id || null} />
      </main>
    </div>
  );
}