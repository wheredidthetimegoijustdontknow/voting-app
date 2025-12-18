// app/poll/[id]/page.tsx (This is a Server Component)

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditPollButton } from '../../../components/polls/EditPollButton';
import { DeletePollButton } from '../../../components/polls/DeletePollButton';

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default async function PollPage({ params }: PollPageProps) {
  const { id: pollId } = await params;
  const supabase = await createServerSupabaseClient();

  // 1. Fetch Poll Data
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, question_text, user_id') // Ensure you select the user_id (matches schema)
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    return notFound();
  }

  // 2. Determine Current User and Check Ownership
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check: Is the logged-in user the creator?
  // Note: Schema uses 'user_id', checking against currently logged in user.
  const isCreator = user?.id === poll.user_id;

  // --- Render the UI ---

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{poll.question_text}</h1>

      {/* Existing VoteForm or other poll details go here */}
      {/* <VoteForm pollId={poll.id} choices={...} /> */}

      {/* RENDER THE BUTTON HERE! */}
      {isCreator && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-3">
            <EditPollButton
              pollId={poll.id}
              isCreator={isCreator}
              questionText={poll.question_text}
            />
            <DeletePollButton
              pollId={poll.id}
              isCreator={isCreator}
            />
          </div>
        </div>
      )}

    </div>
  );
}