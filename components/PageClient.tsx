'use client';

import { useState } from 'react';
import AuthButton from './auth/AuthButton';
import CreatePollForm from './polls/CreatePollForm';
import PollingPollList from './polls/PollsContainer';
import OnlineUsersBanner from './OnlineUsersBanner';
import ProfileChecker from './ProfileChecker';
import { ThemeToggle } from './ui/ThemeToggle';
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-10 border-b"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 
            className="text-heading-xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Real-time Voting App
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
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