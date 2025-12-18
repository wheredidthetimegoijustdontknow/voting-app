import { fetchModerationPolls } from '@/app/actions/poll';
import { ShieldAlert } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import ModerationList from '../../../components/admin/ModerationList';

export default async function ModerationPage() {
    // Basic auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch moderation queue
    const res = await fetchModerationPolls();
    const initialPolls = res.success ? res.polls || [] : [];

    return (
        <div
            className="min-h-screen p-4 md:p-8"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="max-w-6xl mx-auto">
                <AdminNav />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3 text-zinc-900">
                            <ShieldAlert className="text-amber-500" size={28} />
                            Moderation Command Center
                        </h1>
                        <p className="text-sm text-zinc-600">
                            Manage flagged content and poll lifecycle enforcement.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
                            <span className="text-xs text-zinc-500 block uppercase font-bold">Queue Size</span>
                            <span className="text-xl font-bold text-zinc-900">{initialPolls.length}</span>
                        </div>
                    </div>
                </header>

                <main>
                    <ModerationList initialPolls={initialPolls} />
                </main>
            </div>
        </div>
    );
}
