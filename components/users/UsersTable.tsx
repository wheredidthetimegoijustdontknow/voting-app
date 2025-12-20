'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Hand, Flag, MoreHorizontal, Crown, Shield, User } from 'lucide-react';
import { sendDirectMessage, waveAtUser, reportUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/ToastContext';

interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  aura_color: string;
  spirit_emoji: string;
  role: string;
  created_at: string;
  last_seen?: string;
}

interface UsersTableProps {
  users: UserProfile[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleAction = async (action: string, username: string) => {
    setActionMenuOpen(null);
    setLoadingStates(prev => ({ ...prev, [`${action}_${username}`]: true }));
    
    try {
      switch (action) {
        case 'dm':
          await handleDirectMessage(username);
          break;
        case 'wave':
          await handleWave(username);
          break;
        case 'report':
          await handleReport(username);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`${action}_${username}`]: false }));
    }
  };

  const handleDirectMessage = async (targetUsername: string) => {
    // For now, show a simple prompt - in a full implementation this could be a modal
    const message = window.prompt(`Send a message to @${targetUsername}:`);
    if (!message) return;

    const formData = new FormData();
    formData.append('targetUsername', targetUsername);
    formData.append('message', message);

    const result = await sendDirectMessage(formData);
    
    if (result.success) {
      toast(result.data?.message || `Message sent to @${targetUsername}`, {
        type: 'success',
        duration: 3000
      });
    } else {
      toast(result.error || 'An unexpected error occurred', {
        type: 'error',
        duration: 4000
      });
    }
  };

  const handleWave = async (targetUsername: string) => {
    const formData = new FormData();
    formData.append('targetUsername', targetUsername);

    const result = await waveAtUser(formData);
    
    if (result.success) {
      toast(result.data?.message || `You waved at @${targetUsername}! 👋`, {
        type: 'success',
        duration: 3000
      });
    } else {
      toast(result.error || 'An unexpected error occurred', {
        type: 'error',
        duration: 4000
      });
    }
  };

  const handleReport = async (targetUsername: string) => {
    // Simple prompt for now - could be enhanced with a proper modal
    const reason = window.prompt(`Why are you reporting @${targetUsername}?`);
    if (!reason) return;

    // Simple category selection - could be enhanced with a proper modal
    const category = window.prompt('Report category (spam, harassment, inappropriate_content, other):', 'other');
    if (!category || !['spam', 'harassment', 'inappropriate_content', 'other'].includes(category)) {
      toast('Please select a valid report category.', {
        type: 'error',
        duration: 4000
      });
      return;
    }

    const formData = new FormData();
    formData.append('targetUsername', targetUsername);
    formData.append('reason', reason);
    formData.append('category', category);

    const result = await reportUser(formData);
    
    if (result.success) {
      toast(result.data?.message || `Report submitted against @${targetUsername}`, {
        type: 'success',
        duration: 3000
      });
    } else {
      toast(result.error || 'An unexpected error occurred', {
        type: 'error',
        duration: 4000
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={14} className="text-yellow-500" />;
      case 'moderator':
        return <Shield size={14} className="text-blue-500" />;
      default:
        return <User size={14} className="text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="rounded-2xl shadow-md overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface)' }}>
              <th className="text-left py-6 px-6 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>User</th>
              <th className="text-center py-6 px-6 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Role</th>
              <th className="text-center py-6 px-6 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Member Since</th>
              <th className="text-center py-6 px-6 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-surface)' }}>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isAdmin = currentUserRole === 'admin';
              
              return (
                <tr key={user.id} className="group transition-colors" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm"
                        style={{ backgroundColor: `${user.aura_color}20` }}
                      >
                        {user.spirit_emoji}
                      </div>
                      
                      {/* User Info */}
                      <div className="min-w-0">
                        <Link 
                          href={`/profile/${user.username}`}
                          className="font-semibold hover:underline block truncate"
                          style={{ color: isCurrentUser ? user.aura_color : 'var(--color-text-primary)' }}
                        >
                          @{user.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>(You)</span>
                          )}
                        </Link>
                        {user.bio && (
                          <p className="text-sm truncate max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-6 px-6 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border-none ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-6 px-6 text-sm text-center" style={{ color: 'var(--color-text-primary)' }}>
                    {formatMemberSince(user.created_at)}
                  </td>
                  
                  <td className="py-6 px-6 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      {/* Primary Actions */}
                      <button
                        onClick={() => handleAction('dm', user.username)}
                        disabled={loadingStates[`dm_${user.username}`]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-600"
                        style={{ color: 'var(--color-text-muted)' }}
                        title={`Send message to @${user.username}`}
                      >
                        <MessageCircle size={14} />
                        {loadingStates[`dm_${user.username}`] ? 'Sending...' : 'DM'}
                      </button>
                      
                      <button
                        onClick={() => handleAction('wave', user.username)}
                        disabled={loadingStates[`wave_${user.username}`]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:text-green-600"
                        style={{ color: 'var(--color-text-muted)' }}
                        title={`Wave at @${user.username}`}
                      >
                        <Hand size={14} />
                        {loadingStates[`wave_${user.username}`] ? 'Waving...' : 'Wave'}
                      </button>
                      
                      {/* Report Button (hidden for current user) */}
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleAction('report', user.username)}
                          disabled={loadingStates[`report_${user.username}`]}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:text-red-600"
                          style={{ color: 'var(--color-text-muted)' }}
                          title={`Report @${user.username}`}
                        >
                          <Flag size={14} />
                          {loadingStates[`report_${user.username}`] ? 'Reporting...' : 'Report'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No users found</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>There are no users to display at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
