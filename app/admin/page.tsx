import { LayoutDashboard, ShieldAlert, Bot, Users, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';

const adminSections = [
    {
        title: 'Moderation Queue',
        description: 'Review flagged polls, manage reports, and enforce community guidelines.',
        href: '/admin/moderation',
        icon: ShieldAlert,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
    },
    {
        title: 'Bot Simulation',
        description: 'Configure and run persistent bot users to simulate organic poll activity.',
        href: '/admin/botsim',
        icon: Bot,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
    },
    {
        title: 'User Management',
        description: 'Manage user accounts, roles, permissions and view user activity stats.',
        href: '/admin/usermanagement',
        icon: Users,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        isPlaceholder: true
    }
];

export default async function AdminHomePage() {
    // Basic auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="max-w-6xl mx-auto">
                <AdminNav />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-zinc-900 mb-2">Admin Dashboard</h1>
                    <p className="text-zinc-600 max-w-2xl">
                        Welcome to the command center. From here you can manage all aspects of the voting platform,
                        from content moderation to automated simulation.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group block p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${section.bgColor.replace('50', '500')}`} />

                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${section.bgColor} ${section.color}`}>
                                    <section.icon size={24} />
                                </div>
                                <ArrowRight size={20} className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            <h2 className="text-xl font-bold text-zinc-900 mb-2">{section.title}</h2>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                                {section.description}
                            </p>

                            {section.isPlaceholder && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500">
                                    Coming Soon
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="mt-16 bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-500 rounded-full opacity-20 blur-2xl" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-xl">
                            <h3 className="text-2xl font-bold mb-2">System Overview</h3>
                            <p className="text-indigo-100 opacity-80 text-sm">
                                All administration tools are currently in internal beta. Report any issues to the development team.
                                Security policies are strictly enforced for all administrative actions.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-4 bg-indigo-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-xl">
                                <span className="block text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">Status</span>
                                <span className="text-white font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    All Systems GO
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
