import { fetchBots, fetchBotStats } from '@/lib/actions/admin';
import { Bot, AlertTriangle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SimulationControls from '@/components/admin/SimulationControls';

export default async function AdminPage() {
    // Basic auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }
    // In a real app, check for admin role here. 
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile?.role !== 'admin') redirect('/');

    const bots = await fetchBots();
    const stats = await fetchBotStats();

    return (
        <div
            className="rounded-2xl p-8 md:p-10"
            style={{ backgroundColor: 'var(--color-content-bg)' }}
        >
            <div className="container mx-auto" style={{ maxWidth: '1000px' }}>
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-heading-xl mb-2 flex items-center gap-2">
                            <Bot className="text-primary" />
                            Bot Simulation Admin
                        </h1>
                        <p className="text-body text-secondary">
                            Manage persistent bots and simulate voting behavior.
                        </p>
                    </div>
                </header>

                {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        <span>
                            <strong>Warning:</strong> SUPABASE_SERVICE_ROLE_KEY is missing. Bot management features will not work.
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Control Panel */}
                    <div className="card">
                        <h2 className="text-heading-md mb-4 flex items-center gap-2">
                            <Bot size={20} />
                            Simulation Controls
                        </h2>

                        <SimulationControls />
                    </div>

                    {/* Stats */}
                    <div className="card">
                        <h2 className="text-heading-md mb-4">Simulation Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-surface border border-light rounded">
                                <span className="text-secondary">Total Persistent Bots</span>
                                <span className="text-xl font-bold">{stats.totalBots}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surface border border-light rounded">
                                <span className="text-secondary">Total Bot Votes</span>
                                <span className="text-xl font-bold text-primary">{stats.totalBotVotes}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surface border border-light rounded">
                                <span className="text-secondary">Environment</span>
                                <span className="badge badge-info">{process.env.NODE_ENV}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bot List */}
                <section className="card">
                    <h2 className="text-heading-md mb-4">Registered Bots</h2>
                    {bots.length === 0 ? (
                        <div className="text-center py-8 text-secondary">
                            No bots found. Create some to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-default text-secondary text-sm">
                                        <th className="py-2 px-4">Bot Name</th>
                                        <th className="py-2 px-4">Email</th>
                                        <th className="py-2 px-4">Votes</th>
                                        <th className="py-2 px-4">Created</th>
                                        <th className="py-2 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bots.map(bot => (
                                        <tr key={bot.id} className="border-b border-light hover:bg-background transition">
                                            <td className="py-3 px-4 font-medium">{bot.username}</td>
                                            <td className="py-3 px-4 text-secondary font-mono text-xs">{bot.email}</td>
                                            <td className="py-3 px-4">
                                                <span className="badge badge-info">{bot.vote_count}</span>
                                            </td>
                                            <td className="py-3 px-4 text-secondary text-sm">
                                                {new Date(bot.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="badge badge-success">Ready</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
