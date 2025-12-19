// Phase 8: Admin Context
// Global state management for admin impersonation and controls

"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Profile, AdminImpersonation } from '@/types';

interface AdminContextType {
  impersonation: AdminImpersonation;
  setImpersonatedId: (userId: string | undefined) => void;
  clearImpersonation: () => void;
  isAdmin: boolean;
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [impersonation, setImpersonation] = useState<AdminImpersonation>({
    isImpersonating: false,
  });
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // In a real implementation, this would check the current user's role
  const isAdmin = true; // This would be determined by the user's actual role

  const setImpersonatedId = (userId: string | undefined) => {
    if (userId) {
      setImpersonation({
        isImpersonating: true,
        impersonatedUserId: userId,
        originalUserId: 'current-user-id', // This would be stored from session
      });
    } else {
      setImpersonation({
        isImpersonating: false,
      });
    }
  };

  const clearImpersonation = () => {
    setImpersonation({
      isImpersonating: false,
    });
  };

  return (
    <AdminContext.Provider
      value={{
        impersonation,
        setImpersonatedId,
        clearImpersonation,
        isAdmin,
        profiles,
        setProfiles,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}