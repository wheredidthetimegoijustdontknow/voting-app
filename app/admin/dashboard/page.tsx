// Phase 8: Admin Dashboard - User Identity & Expression Command Center
// Global management interface for user expression and poll integrity

import { getAllProfiles } from '@/lib/actions/admin';
import { fetchBotStats } from '@/lib/actions/admin';
import UserRow from '@/components/admin/UserRow';
import { ImpersonationControl } from '@/components/admin/ImpersonationControl';
import { Shield, Users, Bot, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function AdminDashboard() {
  // Fetch all profiles and bot stats
  const [profiles, botStats] = await Promise.all([
    getAllProfiles(),
    fetchBotStats()
  ]);

  // Calculate ecosystem stats
  const totalProfiles = profiles?.length || 0;
  const adminCount = profiles?.filter(p => p.role === 'ADMIN').length || 0;
  const moderatorCount = profiles?.filter(p => p.role === 'MODERATOR').length || 0;
  const activeUsers = profiles?.filter(p => p.last_vote_at).length || 0;
  const dormantUsers = totalProfiles - activeUsers;

  // Group profiles by archetype (simplified for now)
  const archetypes = ['USER', 'MODERATOR', 'ADMIN']; // This would be calculated from voting history

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Admin Command Center
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage user identity and system integrity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Last updated:</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Global Ecosystem Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Profiles</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalProfiles}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Dormant Users</p>
                <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">{dormantUsers}</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Bots</p>
                <p className="text-2xl font-bold text-purple-600">{botStats.totalBots}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Impersonation Control */}
        <div className="mb-8">
          <ImpersonationControl />
        </div>

        {/* Voter Directory */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Voter Directory
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage user roles, identities, and impersonation
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {adminCount} Admins, {moderatorCount} Moderators
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <UserRow
                      key={profile.id}
                      profile={profile}
                      onRefresh={() => {
                        // This would trigger a refresh of the page data
                        window.location.reload();
                      }}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-zinc-300" />
                        <p className="text-zinc-500 dark:text-zinc-400">No profiles found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Identity Management</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Reset user bios, aura colors, and spirit emojis that violate community standards.
              </p>
              <button className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors">
                Bulk Identity Reset
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Role Management</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Promote trusted users to moderator status or demote problematic accounts.
              </p>
              <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors">
                Role Bulk Update
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">System Health</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Monitor system performance, active users, and potential issues.
              </p>
              <button className="text-sm bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}