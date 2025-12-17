import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchPollsWithResults } from '@/lib/polls/queries';
import DashboardStats from '@/components/dashboard/DashboardStats';
import MyPollsList from '@/components/dashboard/MyPollsList';
import DevTools from '@/components/dashboard/DevTools';
import DataDiagnostic from '@/components/dashboard/DataDiagnostic';

export const revalidate = 0;

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch user's polls
    const polls = await fetchPollsWithResults(user.id);

    // Calculate stats
    const totalPolls = polls.length;
    const totalVotes = polls.reduce((acc, poll) => acc + poll.total_votes, 0);
    const avgVotesPerPoll = totalPolls > 0 ? totalVotes / totalPolls : 0;

    return (
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1
                    style={{
                        fontSize: 'var(--font-size-4xl)',
                        fontWeight: '700',
                        marginBottom: 'var(--spacing-xs)',
                        color: 'var(--color-text-primary)'
                    }}
                >
                    Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Manage your polls and view performance insights.
                </p>
            </header>

            <section style={{ marginBottom: 'var(--spacing-xxl)' }}>
                <h2
                    style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: '600',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)'
                    }}
                >
                    Overview
                </h2>
                <DashboardStats
                    totalPolls={totalPolls}
                    totalVotes={totalVotes}
                    avgVotesPerPoll={avgVotesPerPoll}
                />
            </section>

            <section>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-lg)'
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        My Polls
                    </h2>
                </div>
                <MyPollsList polls={polls} currentUserId={user.id} />
            </section>

            <DevTools />

            {/* Real-time Data Diagnostic Panel */}
            <DataDiagnostic polls={polls} currentUserId={user.id} />
        </div>
    );
}
