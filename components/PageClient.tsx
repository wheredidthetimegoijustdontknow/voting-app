'use client';

import { useState } from 'react';
import AuthButton from './auth/AuthButton';
import CreatePollForm from './polls/CreatePollForm';
import PollingPollList from './polls/PollsContainer';
import OnlineUsersBanner from './OnlineUsersBanner';
import ProfileChecker from './ProfileChecker';
import type { PollWithResults } from '@/lib/polls/types';

interface PageClientProps {
  polls: PollWithResults[];
  userId: string | null;
  initialUsername?: string;
}

export default function PageClient({ polls, userId, initialUsername }: PageClientProps) {
  const [currentUsername, setCurrentUsername] = useState(initialUsername);

  const handleUsernameUpdate = (username: string) => {
    setCurrentUsername(username);
  };

  const pageContent = (
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
        <PollingPollList
          initialPolls={polls}
          userId={userId}
        />
      </main>

      {/* Global Online Users Banner */}
      <OnlineUsersBanner 
        userId={userId}
        currentUsername={currentUsername}
      />
    </div>
  );

  // Only wrap with ProfileChecker if user is signed in
  if (userId) {
    return (
      <ProfileChecker
        userId={userId}
        currentUsername={currentUsername}
        onUsernameUpdate={handleUsernameUpdate}
      >
        {pageContent}
      </ProfileChecker>
    );
  }

  return pageContent;
}