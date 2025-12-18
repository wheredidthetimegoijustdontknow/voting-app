'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CreatePollButton from './polls/CreatePollButton';
import PollingPollList from './polls/PollsContainer';
import AdminHUD from './admin/AdminHUD';
import type { PollWithResults } from '@/lib/polls/types';

interface PageClientProps {
  polls: PollWithResults[];
  userId: string | null;
}

export default function PageClient({ polls, userId }: PageClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const totalActivePolls = polls.length;
  const totalVotes = polls.reduce((acc: number, poll) => acc + (poll.total_votes || 0), 0);
  const avgEngagement = totalActivePolls > 0 ? (totalVotes / totalActivePolls).toFixed(1) : '0';

  // Real-time subscription for dashboard updates
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const channel = supabase
      .channel('dashboard-stats-sync')
      .on(
        'postgres_changes',
        { event: '*', table: 'votes', schema: 'public' },
        () => {
          // Debounce refresh to avoid spamming during bot activity
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            console.log('[PageClient] Syncing dashboard stats...');
            router.refresh();
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timeout);
    };
  }, [supabase, router]);


  return (
    <div
      className="rounded-2x3 p-8 md:p-10"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      <div className="space-y-10">
        {/* Dashboard Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
              Manage your polls and view results in real-time.
            </p>
          </div>
          <CreatePollButton />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Active Polls', value: totalActivePolls, color: 'text-primary' },
            { label: 'Total Votes', value: totalVotes.toLocaleString(), color: 'text-primary' },
            { label: 'Avg. Votes / Poll', value: avgEngagement, color: 'primary' }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border transition-all duration-300 hover:border-primary hover:shadow-lg dark:hover:shadow-indigo-500/10"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-default)',
              } as React.CSSProperties}
            >
              <div className="text-sm font-semibold mb-1 uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </div>
              <div
                className="text-4xl font-bold"
                style={{ color: stat.color === 'primary' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Polls List Section */}
        <div>
          <div
            className="flex items-center justify-between text-sm pb-4 border-b mb-6"
            style={{
              color: 'var(--color-text-muted)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            <span className="font-bold uppercase tracking-widest text-xs">Active Polls</span>
          </div>

          <PollingPollList
            initialPolls={polls}
            userId={userId}
          />
        </div>

        {/* Admin Simulation HUD - Only for authenticated users in this demo */}
        {userId && <AdminHUD />}
      </div>
    </div>
  );
}
