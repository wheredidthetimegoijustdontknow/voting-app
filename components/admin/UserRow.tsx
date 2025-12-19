// Phase 8: UserRow Component
// Admin interface for managing individual users

"use client";

import { useState } from 'react';
import { updateUserRole, resetUserIdentity } from '@/lib/actions/admin';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { Shield, User, AlertTriangle, Eye } from 'lucide-react';
import type { Profile } from '@/types';

interface UserRowProps {
  profile: Profile;
  onRefresh: () => void;
}

export const UserRow: React.FC<UserRowProps> = ({ profile, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const { startImpersonation } = useAdminImpersonation();

  const handleRoleChange = async (newRole: 'USER' | 'MODERATOR' | 'ADMIN') => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateUserRole(profile.id, newRole);
      onRefresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setIsUpdating(false);
      setShowConfirm(null);
    }
  };

  const handleIdentityReset = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await resetUserIdentity(profile.id);
      onRefresh();
    } catch (error) {
      console.error('Error resetting identity:', error);
      alert('Failed to reset user identity');
    } finally {
      setIsUpdating(false);
      setShowConfirm(null);
    }
  };

  const handleImpersonate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await startImpersonation(profile.id);
      alert(`Now viewing as ${profile.username}. The UI will show their username and information.`);
    } catch (error) {
      console.error('Error setting impersonation:', error);
      alert('Failed to set impersonation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      {/* User Info */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{profile.spirit_emoji}</span>
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {profile.username}
            </div>
            <div className="text-xs text-zinc-500">
              {profile.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-4 px-4">
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
          style={{ 
            borderColor: profile.aura_color,
            color: profile.aura_color,
            backgroundColor: `${profile.aura_color}15`
          }}
        >
          <Shield size={12} className="mr-1" />
          {profile.role}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {profile.last_vote_at ? (
            <span className="text-green-600">Active</span>
          ) : (
            <span className="text-zinc-400">Inactive</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {/* Impersonate */}
          <button
            onClick={handleImpersonate}
            disabled={isUpdating}
            className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50"
            title="View app as this user"
          >
            <Eye size={12} className="mr-1" />
            Debug: View As
          </button>

          {/* Role Management */}
          {showConfirm === 'role' ? (
            <div className="flex items-center gap-1">
              <select
                value={profile.role}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                disabled={isUpdating}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="USER">USER</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('role')}
              className="inline-flex items-center px-2 py-1 text-xs bg-zinc-600 hover:bg-zinc-500 text-white rounded transition-colors"
            >
              <Shield size={12} className="mr-1" />
              Change Role
            </button>
          )}

          {/* Identity Reset */}
          {showConfirm === 'reset' ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleIdentityReset}
                disabled={isUpdating}
                className="inline-flex items-center px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('reset')}
              className="inline-flex items-center px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              title="Reset user's bio, aura color, and emoji"
            >
              <AlertTriangle size={12} className="mr-1" />
              Reset Identity
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;