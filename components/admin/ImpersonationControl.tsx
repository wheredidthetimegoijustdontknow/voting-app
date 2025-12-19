// Phase 8: Admin Impersonation Control Component
// UI for admins to impersonate users for testing and debugging

'use client';

import { useState, useEffect } from 'react';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { User, Shield, Eye, EyeOff } from 'lucide-react';
import { getAllProfiles } from '@/lib/actions/admin';

export function ImpersonationControl() {
  const { 
    isImpersonating, 
    impersonatedUser, 
    originalUser, 
    startImpersonation, 
    stopImpersonation,
    isAdmin 
  } = useAdminImpersonation();
  
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load all users for selection
    const loadUsers = async () => {
      try {
        const users = await getAllProfiles();
        setAllUsers(users || []);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleStartImpersonation = async () => {
    if (!selectedUserId) return;
    
    setIsLoading(true);
    try {
      await startImpersonation(selectedUserId);
    } catch (error) {
      console.error('Error starting impersonation:', error);
      alert('Failed to start impersonation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopImpersonation = async () => {
    setIsLoading(true);
    try {
      await stopImpersonation();
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      alert('Failed to stop impersonation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-red-500" size={20} />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Admin Impersonation Mode
        </h3>
      </div>

      {!isImpersonating ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Impersonate any user to test their experience and debug issues.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select User to Impersonate
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Choose a user...</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  @{user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartImpersonation}
            disabled={!selectedUserId || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
          >
            <Eye size={16} />
            {isLoading ? 'Starting...' : 'Start Impersonation'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <EyeOff className="text-red-600" size={16} />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Currently impersonating @{impersonatedUser?.username}
            </span>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <p><strong>Original User:</strong> @{originalUser?.username}</p>
            <p><strong>Impersonating:</strong> @{impersonatedUser?.username}</p>
            <p><strong>Role:</strong> {impersonatedUser?.role}</p>
          </div>

          <button
            onClick={handleStopImpersonation}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
          >
            <User size={16} />
            {isLoading ? 'Stopping...' : 'Stop Impersonation'}
          </button>
        </div>
      )}
    </div>
  );
}