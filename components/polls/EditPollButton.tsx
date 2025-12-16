// app/poll/[id]/EditPollButton.tsx
'use client';

import { deletePoll } from '@/app/actions/poll'; // New Server Action for deletion

interface EditPollButtonProps {
  pollId: string;
  // This prop determines if the current logged-in user is the creator.
  // This check MUST be re-validated on the server.
  isCreator: boolean;
  // Optional callback to refresh the parent component after successful deletion
  onDeleteSuccess?: () => void;
}

export function EditPollButton({ pollId, isCreator, onDeleteSuccess }: EditPollButtonProps) {
  if (!isCreator) {
    return null; // Don't show the button if the client knows they aren't the creator.
  }

  // NOTE: We rely on the Server Action and RLS for ultimate security. 
  // The client-side 'isCreator' check is only for UX/UI.

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this poll? This cannot be undone.")) {
      return;
    }

    // Call the new secure Server Action
    const result = await deletePoll(pollId);

    if (result.success) {
      alert('Poll deleted successfully!');
      // Call the success callback if provided to refresh the parent component
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      // Navigate to the dashboard or home page after deletion
      // router.push('/dashboard');
    } else {
      alert(`Error deleting poll: ${result.error}`);
    }
  };

  return (
    <div className="flex space-x-3 mt-4">
      {/* Edit Button - More prominent blue styling with glow animation */}
      <button
        className="edit-button inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border-2 border-blue-400 hover:border-blue-500"
        disabled
        title="Edit functionality coming soon!"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Poll
        <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">Soon</span>
      </button>

      {/* Delete Button - More prominent red styling with danger animation */}
      <button
        onClick={handleDelete}
        className="delete-button inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border-2 border-red-400 hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
        title="Delete this poll permanently"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Poll
        <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
      </button>
    </div>
  );
}