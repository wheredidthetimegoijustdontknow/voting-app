'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CreatePollForm from './polls/CreatePollForm';
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <main
        className="rounded-2xl shadow-sm border p-8 min-h-[80vh] transition-colors duration-300"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        {/* Dashboard Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Manage your polls and view results.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Active Polls', value: totalActivePolls, color: 'text-primary' },
            { label: 'Total Votes', value: totalVotes.toLocaleString(), color: 'text-primary' },
            { label: 'Avg. Votes / Poll', value: avgEngagement, color: 'primary' }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border transition-all duration-100 hover:ring-1"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-default)',
                '--tw-ring-color': 'var(--color-primary)'
              } as React.CSSProperties}
            >
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: stat.color === 'primary' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Create Poll Form Section */}
        <div className="mb-8">
          <CreatePollForm />
        </div>

        {/* Polls List Section */}
        <div>
          <div
            className="flex items-center justify-between text-sm pb-2 border-b mb-4"
            style={{
              color: 'var(--color-text-muted)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            <span className="font-medium">All Polls</span>
          </div>

          <PollingPollList
            initialPolls={polls}
            userId={userId}
          />
        </div>
      </main>


      {/* Admin Simulation HUD - Only for authenticated users in this demo */}
      {userId && <AdminHUD />}
    </div>
  );
}
