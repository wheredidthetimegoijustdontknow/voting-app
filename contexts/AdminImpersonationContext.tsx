// Phase 8: Admin Impersonation Context
// Manages admin impersonation state across the application

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setImpersonatedUser, clearImpersonation } from '@/lib/actions/admin';

interface AdminImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: any | null;
  originalUser: any | null;
  startImpersonation: (userId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  isAdmin: boolean;
  error: string | null;
  isLoading: boolean;
}

const AdminImpersonationContext = createContext<AdminImpersonationContextType | null>(null);

export function AdminImpersonationProvider({ children }: { children: ReactNode }) {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUserData] = useState<any | null>(null);
  const [originalUser, setOriginalUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing impersonation on mount
  useEffect(() => {
    const checkImpersonation = async () => {
      try {
        // Check localStorage for impersonation data
        const storedImpersonation = localStorage.getItem('admin-impersonation');
        if (storedImpersonation) {
          const { impersonatedUser, originalUser } = JSON.parse(storedImpersonation);
          setImpersonatedUserData(impersonatedUser);
          setOriginalUser(originalUser);
          setIsImpersonating(true);
        }
      } catch (error) {
        console.error('Error checking impersonation:', error);
      }
    };

    checkImpersonation();
  }, []);

  const startImpersonation = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await setImpersonatedUser(userId);
      if (userData) {
        // Get current user data (this would need to be fetched from the current session)
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          throw new Error('Could not get current user information');
        }
         
        setImpersonatedUserData(userData);
        setOriginalUser(currentUser);
        setIsImpersonating(true);

        // Store in localStorage for persistence
        localStorage.setItem('admin-impersonation', JSON.stringify({
          impersonatedUser: userData,
          originalUser: currentUser
        }));
      } else {
        throw new Error('Failed to fetch user data for impersonation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error starting impersonation:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const stopImpersonation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearImpersonation();
      setIsImpersonating(false);
      setImpersonatedUserData(null);
      setOriginalUser(null);
      localStorage.removeItem('admin-impersonation');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error stopping impersonation:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user from server action
  const getCurrentUser = async () => {
    try {
      const { getCurrentProfile } = await import('@/app/actions/profile');
      const result = await getCurrentProfile();
      
      if (result.success && result.data) {
        return {
          id: result.data.userId,
          username: result.data.username,
          role: result.data.role || 'USER'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const value = {
    isImpersonating,
    impersonatedUser,
    originalUser,
    startImpersonation,
    stopImpersonation,
    isAdmin: true, // This should be determined from actual user role
    error,
    isLoading
  };

  return (
    <AdminImpersonationContext.Provider value={value}>
      {children}
    </AdminImpersonationContext.Provider>
  );
}

export function useAdminImpersonation() {
  const context = useContext(AdminImpersonationContext);
  if (!context) {
    throw new Error('useAdminImpersonation must be used within AdminImpersonationProvider');
  }
  return context;
}