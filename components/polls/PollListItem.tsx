// components/PollListItem.tsx
'use client'; 
// Since the EditPollButton is client-side, this parent must also be client-side.

import { EditPollButton } from '@/components/polls/EditPollButton'; // This is the component from Task 3

interface Poll {
  id: string;
  question: string;
  creator_id: string; // Must be included in your fetch query!
  // ... other poll fields
}

interface PollListItemProps {
  poll: Poll;
  currentUserId: string | undefined; // The authenticated user's ID (or undefined)
}

export function PollListItem({ poll, currentUserId }: PollListItemProps) {
  
  // 1. The Ownership Check is now local to the list item
  const isCreator = currentUserId === poll.creator_id;

  return (
    <div className="border p-4 mb-4 rounded shadow">
      
      {/* Display the Poll Question and Votes */}
      <h2 className="text-xl font-semibold">{poll.question}</h2>
      {/* ... Display choices and vote counts ... */}

      {/* 2. Conditionally Render the Edit/Delete Button */}
      {isCreator && (
        <div className="mt-4 flex justify-end">
          <EditPollButton 
            pollId={poll.id} 
            isCreator={isCreator}
            questionText={poll.question}
            // We can remove isCreator if we trust the conditional rendering above, 
            // but it's kept here for clarity.
          />
        </div>
      )}
    </div>
  );
}