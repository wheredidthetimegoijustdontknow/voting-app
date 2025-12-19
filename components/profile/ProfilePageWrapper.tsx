'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

interface ProfilePageWrapperProps {
  children: React.ReactNode;
  username: string;
}

export function ProfilePageWrapper({ children, username }: ProfilePageWrapperProps) {
  const { isImpersonating, impersonatedUser } = useAdminImpersonation();
  const router = useRouter();

  // Normalize username for consistent comparison
  const normalizedUsername = username.toLowerCase();
  const normalizedImpersonatedUsername = impersonatedUser?.username?.toLowerCase();

  useEffect(() => {
    // If impersonating and the current username doesn't match the impersonated user,
    // redirect to the impersonated user's profile
    if (isImpersonating && impersonatedUser && normalizedUsername !== normalizedImpersonatedUsername) {
      console.log(`ProfilePageWrapper: Redirecting from ${username} to ${impersonatedUser.username} due to impersonation`);
      router.replace(`/profile/${impersonatedUser.username}`);
    }
  }, [isImpersonating, impersonatedUser, normalizedUsername, normalizedImpersonatedUsername, router]);

  // If we're impersonating and viewing the impersonated user's profile,
  // show a banner indicating this is impersonation mode
  if (isImpersonating && impersonatedUser && normalizedUsername === normalizedImpersonatedUsername) {
    return (
      <div>
        {/* Impersonation Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-800">
              You are viewing @{impersonatedUser.username}'s profile in impersonation mode
            </span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}