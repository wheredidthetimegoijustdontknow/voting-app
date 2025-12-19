'use client';

import React, { useState } from 'react';
import { Users, Search, RefreshCw, Shield } from 'lucide-react';
import UserRow from './UserRow';
import { ImpersonationControl } from './ImpersonationControl';

interface UserManagementClientProps {
  profiles: any[];
}

export function UserManagementClient({ profiles }: UserManagementClientProps) {
  const [allProfiles, setAllProfiles] = useState(profiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshProfiles = async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, you'd make an API call here
      // For now, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredProfiles = allProfiles.filter(profile => 
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Impersonation Control Panel */}
      <ImpersonationControl />

      {/* Search and Controls */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">User Directory</h2>
              <p className="text-sm text-zinc-600">{filteredProfiles.length} users found</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refreshProfiles}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-700">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
                    {searchTerm ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <UserRow
                    key={profile.id}
                    profile={profile}
                    onRefresh={refreshProfiles}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{allProfiles.length}</div>
              <div className="text-sm text-zinc-600">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">
                {allProfiles.filter(p => p.role === 'ADMIN' || p.role === 'MODERATOR').length}
              </div>
              <div className="text-sm text-zinc-600">Admins & Mods</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">
                {allProfiles.filter(p => p.created_at).length}
              </div>
              <div className="text-sm text-zinc-600">Registered Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}