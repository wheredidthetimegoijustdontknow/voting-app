'use client';

import { useState, useEffect } from 'react';
import { getCurrentProfile } from '@/app/actions/profile';
import ProfileSetupModal from './ProfileSetupModal';

interface ProfileCheckerProps {
  children: React.ReactNode;
  userId: string | null;
  currentUsername?: string;
  onUsernameUpdate: (username: string) => void;
}

export default function ProfileChecker({ 
  children, 
  userId, 
  currentUsername, 
  onUsernameUpdate 
}: ProfileCheckerProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await getCurrentProfile();
        
        // If user doesn't have a profile, show modal
        if (result.success && !result.data) {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [userId]);

  const handleProfileCreated = (username: string) => {
    onUsernameUpdate(username);
    setShowProfileModal(false);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
  };

  // Don't render children while checking profile
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={handleCloseModal}
        onProfileCreated={handleProfileCreated}
      />
    </>
  );
}