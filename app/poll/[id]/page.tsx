// app/poll/[id]/page.tsx (This is a Server Component)

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditPollButton } from '../../../components/polls/EditPollButton'; // Import the client component

interface PollPageProps {
  params: { id: string };
}

export default async function PollPage({ params }: PollPageProps) {
  const { id: pollId } = params;
  const supabase = await createServerSupabaseClient();
  
  // 1. Fetch Poll Data
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, question, creator_id') // Ensure you select the creator_id
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    return notFound();
  }

  // 2. Determine Current User and Check Ownership
  const { data: { user } } = await supabase.auth.getUser();
  
  // Security Check: Is the logged-in user the creator?
  const isCreator = user?.id === poll.creator_id; 

  // --- Render the UI ---

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{poll.question}</h1>
      
      {/* Existing VoteForm or other poll details go here */}
      {/* <VoteForm pollId={poll.id} choices={...} /> */}

      {/* RENDER THE BUTTON HERE! */}
      {isCreator && (
        <div className="mt-6 border-t pt-4">
            {/* The client component handles the delete action */}
            <EditPollButton 
                pollId={poll.id} 
                isCreator={isCreator} 
            />
        </div>
      )}
      
    </div>
  );
}