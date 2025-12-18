import { fetchBots, fetchBotStats } from '@/lib/actions/admin';
import { Bot, AlertTriangle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SimulationControls from '@/components/admin/SimulationControls';
import AdminNav from '@/components/admin/AdminNav';

export default async function BotSimPage() {
    // Basic auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const bots = await fetchBots();
    const stats = await fetchBotStats();

    return (
        <div
            className="min-h-screen p-4 md:p-8"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="max-w-6xl mx-auto">
                <AdminNav />

                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3 text-zinc-900">
                            <Bot className="text-primary" size={28} />
                            Bot Simulation Command Center
                        </h1>
                        <p className="text-sm text-zinc-600">
                            Manage persistent bots and simulate voting behavior.
                        </p>
                    </div>
                </header>

                {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        <span>
                            <strong>Warning:</strong> SUPABASE_SERVICE_ROLE_KEY is missing. Bot management features will not work.
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Control Panel */}
                    <div className="card-zinc bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-900">
                            <Bot size={20} className="text-indigo-600" />
                            Simulation Controls
                        </h2>

                        <SimulationControls />
                    </div>

                    {/* Stats */}
                    <div className="card-zinc bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 text-zinc-900">Simulation Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                                <span className="text-sm text-zinc-600">Total Persistent Bots</span>
                                <span className="text-xl font-bold text-zinc-900">{stats.totalBots}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                                <span className="text-sm text-zinc-600">Total Bot Votes</span>
                                <span className="text-xl font-bold text-indigo-600">{stats.totalBotVotes}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                                <span className="text-sm text-zinc-600">Environment</span>
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                                    {process.env.NODE_ENV}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bot List */}
                <section className="card-zinc bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-zinc-900">Registered Bots</h2>
                    {bots.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 italic">
                            No bots found. Create some to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 text-zinc-500 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4 font-semibold">Bot Name</th>
                                        <th className="py-3 px-4 font-semibold">Email</th>
                                        <th className="py-3 px-4 font-semibold">Votes</th>
                                        <th className="py-3 px-4 font-semibold">Created</th>
                                        <th className="py-3 px-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {bots.map(bot => (
                                        <tr key={bot.id} className="hover:bg-zinc-50 transition-colors group">
                                            <td className="py-4 px-4 font-medium text-zinc-900">{bot.username}</td>
                                            <td className="py-4 px-4 text-zinc-500 font-mono text-xs">{bot.email}</td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                    {bot.vote_count}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-zinc-500 text-sm">
                                                {new Date(bot.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                                    Active
                                                </span>
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
