import { Users, Construction, AlertCircle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

export default async function UserManagementPage() {
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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900">User Management</h1>
                            <p className="text-zinc-600">
                                This feature is currently under development.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center p-6 bg-zinc-50 text-zinc-400 rounded-full mb-6">
                        <Construction size={48} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-bold text-zinc-900 mb-4">Work in Progress</h2>
                    <p className="text-zinc-500 max-w-md mx-auto mb-8">
                        Our team is working hard to bring you powerfull user management tools,
                        including role-based access control and user analytics.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                        <AlertCircle size={16} />
                        Available in Phase 8
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <h3 className="font-bold text-zinc-900 mb-2">Planned Features</h3>
                        <ul className="space-y-2 text-sm text-zinc-600">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                Admin & Moderator role assignment
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                User activity logs
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                Account suspension tools
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
