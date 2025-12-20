// Phase 8: Users Directory Page
// Display all users with ability to DM, wave, and report

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UsersTable } from '@/components/users/UsersTable';
import { getCurrentProfile } from '@/app/actions/profile';
import { Users, Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = await createServerSupabaseClient();
  const currentProfile = await getCurrentProfile();
  
  // Await search parameters
  const params = await searchParams;
  
  // Get search parameters
  const search = params.search || '';
  const roleFilter = params.role || '';

  // Build query
  let query = supabase
    .from('profiles')
    .select(`
      id,
      username,
      bio,
      aura_color,
      spirit_emoji,
      role,
      created_at
    `)
    .order('created_at', { ascending: false });

  // Apply search filter
  if (search) {
    query = query.ilike('username', `%${search}%`);
  }

  // Apply role filter
  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }

  // Fetch users
  const { data: users, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    // Handle error appropriately
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Error loading users
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back to Polls Button */}
      <div className="mb-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Polls</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: 'var(--color-primary)15' }}
        >
          <Users size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Users Directory
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Discover and connect with other community members
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div 
        className="rounded-2xl shadow-sm p-6"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <form method="GET" className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              name="search"
              placeholder="Search users by username..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              style={{ 
                backgroundColor: 'var(--color-content-bg)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <select
              name="role"
              defaultValue={roleFilter}
              className="pl-10 pr-8 py-2 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer shadow-sm"
              style={{ 
                backgroundColor: 'var(--color-content-bg)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>

          {/* Clear Filters */}
          {(search || roleFilter) && (
            <a
              href="/users"
              className="px-6 py-2 font-medium rounded-lg transition-colors text-center"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
            >
              Clear
            </a>
          )}
        </form>

        {/* Results Count */}
        <div className="mt-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {users && users.length > 0 ? (
            <span>
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
              {roleFilter && ` with role "${roleFilter}"`}
            </span>
          ) : (
            <span>No users found</span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <UsersTable 
        users={users || []} 
        currentUserId={currentProfile.success ? currentProfile.data?.userId : undefined}
        currentUserRole={currentProfile.success ? currentProfile.data?.role : undefined}
      />
    </div>
  );
}
