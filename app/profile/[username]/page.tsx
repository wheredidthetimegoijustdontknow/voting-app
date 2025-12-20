// Phase 8: Profile Page - User Identity & Expression Hub
// Dynamic route showing user profile with aura colors, bio, and archetype

import { createServerSupabaseClient } from '@/lib/supabase/server';
// import { getUserArchetype } from '@/lib/utils/archetypes'; // Commented out unused import
import { ArchetypeBadge } from '@/components/profile/ArchetypeBadge';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { ProfilePageWrapper } from '@/components/profile/ProfilePageWrapper';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Trophy } from 'lucide-react';
import { getCurrentProfile } from '@/app/actions/profile';
import { EditProfileButton } from '@/components/profile/EditProfileButton';
import { headers } from 'next/headers';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Await params to get the actual username value
  const { username } = await params;
  
  // Normalize URL parameter to lowercase for consistent routing
  // but preserve original case for database queries and display
  const normalizedUsername = username.toLowerCase();
  
  const supabase = await createServerSupabaseClient();
  const currentProfile = await getCurrentProfile();

  // Check referrer to determine back button behavior
  const hdrs = await headers();
  const referrer = hdrs.get('referer') || '';
  const isFromUsers = referrer.includes('/users');
  const backHref = isFromUsers ? '/users' : '/';
  const backText = isFromUsers ? 'Back to Users' : 'Back to Polls';

  // Fetch user profile by username (case-insensitive)
  const { data: profile, error } = await supabase
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
    .ilike('username', username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Calculate user's archetype (simplified for now)
  const archetype = null;

  // Get user's poll statistics
  const { data: userPolls } = await supabase
    .from('polls')
    .select('id, status, created_at, color_theme_id')
    .eq('user_id', profile.id);

  const { data: userVotes } = await supabase
    .from('votes')
    .select('id, created_at')
    .eq('user_id', profile.id);

  // Calculate stats
  const totalPolls = userPolls?.length || 0;
  const totalVotes = userVotes?.length || 0;
  const activePolls = userPolls?.filter(p => p.status === 'ACTIVE')?.length || 0;
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  // Format last activity (get from user's votes if any)
  const lastUserVote = userVotes && userVotes.length > 0 
    ? userVotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
    
  const lastActivity = lastUserVote
    ? new Date(lastUserVote.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'Never';

  return (
    <ProfilePageWrapper username={username}>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Aura Color Header Gradient */}
      <div 
        className="h-64 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${profile.aura_color}15 0%, ${profile.aura_color}30 50%, ${profile.aura_color}45 100%)`
        }}
      >
        {/* Back Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-800/90 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">{backText}</span>
          </Link>
        </div>

        {/* Profile Avatar & Basic Info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Spirit Emoji Avatar */}
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 border-white shadow-lg"
              style={{ backgroundColor: `${profile.aura_color}20` }}
            >
              {profile.spirit_emoji}
            </div>
            
            {/* Username & Archetype */}
            <div className="space-y-2">
              <h1 
                className="text-4xl font-bold"
                style={{ color: profile.aura_color }}
              >
                @{profile.username}
              </h1>
              
              {archetype && (
                <ArchetypeBadge 
                  title={archetype} 
                  auraColor={profile.aura_color}
                  className="mx-auto"
                />
              )}
              
              {/* Role Badge */}
              <div className="flex justify-center">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border"
                  style={{ 
                    borderColor: profile.aura_color,
                    color: profile.aura_color,
                    backgroundColor: `${profile.aura_color}10`
                  }}
                >
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Bio Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-zinc-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">About</h2>
          </div>
          
          {profile.bio ? (
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {profile.bio}
            </p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 italic">
              This user hasn't added a bio yet.
            </p>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Polls */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Polls</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalPolls}</p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${profile.aura_color}20` }}
              >
                <Trophy size={20} style={{ color: profile.aura_color }} />
              </div>
            </div>
          </div>

          {/* Total Votes */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Votes</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalVotes}</p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${profile.aura_color}20` }}
              >
                <User size={20} style={{ color: profile.aura_color }} />
              </div>
            </div>
          </div>

          {/* Active Polls */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Polls</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{activePolls}</p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${profile.aura_color}20` }}
              >
                <Trophy size={20} style={{ color: profile.aura_color }} />
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Member Since</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{memberSince}</p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${profile.aura_color}20` }}
              >
                <Calendar size={20} style={{ color: profile.aura_color }} />
              </div>
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Recent Activity</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Last voted: <span className="font-medium text-zinc-900 dark:text-zinc-100">{lastActivity}</span>
          </p>
        </div>

        {/* Edit Profile Button (only for current user and not when impersonating) */}
        {currentProfile.success && currentProfile.data?.userId === profile.id && (
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <EditProfileButton profile={profile} />
          </div>
        )}
      </div>
      </div>
    </ProfilePageWrapper>
  );
}