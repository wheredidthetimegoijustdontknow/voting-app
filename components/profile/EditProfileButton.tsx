'use client';

import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

interface EditProfileButtonProps {
  profile: any;
}

export function EditProfileButton({ profile }: EditProfileButtonProps) {
  const { isImpersonating } = useAdminImpersonation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  // Don't show edit button when impersonating
  if (isImpersonating) {
    return null;
  }

  const handleSave = (updatedProfile: any) => {
    setCurrentProfile(updatedProfile);
  };

  return (
    <>
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
      >
        <Edit3 size={16} />
        Edit Profile
      </button>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={currentProfile}
        onSave={handleSave}
      />
    </>
  );
}