'use client';

import { useState } from 'react';
import { createProfile } from '@/app/actions/profile';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (username: string) => void;
}

export default function ProfileSetupModal({ isOpen, onClose, onProfileCreated }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createProfile(username.trim());
      
      if (result.success) {
        onProfileCreated(result.data!.username);
        onClose();
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Choose Your Username
        </h2>
        
        <p className="text-gray-600 mb-6">
          To show your real name instead of "Anonymous User" in the online users list, 
          please choose a username for your profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="e.g., john_doe"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || username.length < 3}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Your username will be visible to other users in the online users list.
          You can change it later from your profile settings.
        </p>
      </div>
    </div>
  );
}