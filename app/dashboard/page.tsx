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
        <div
            className="rounded-2xl p-8 md:p-10"
            style={{ backgroundColor: 'var(--color-content-bg)' }}
        >
            <div className="space-y-12">
                <header>
                    <h1
                        className="text-4xl font-bold tracking-tight mb-2"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Dashboard
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
                        Manage your polls and view performance insights.
                    </p>
                </header>

                <section>
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Overview</h2>
                    <DashboardStats
                        totalPolls={totalPolls}
                        totalVotes={totalVotes}
                        avgVotesPerPoll={avgVotesPerPoll}
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Polls</h2>
                    </div>
                    <MyPollsList polls={polls} currentUserId={user!.id} />
                </section>

                <DevTools />

                {/* Real-time Data Diagnostic Panel */}
                <DataDiagnostic polls={polls} currentUserId={user!.id} />
            </div>
        </div>
    );
}
