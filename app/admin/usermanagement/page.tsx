import { Users } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { getAllProfiles } from '@/lib/actions/admin';
import { UserManagementClient } from '@/components/admin/UserManagementClient';

export default async function UserManagementPage() {
    // Basic auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch all user profiles for the admin
    let profiles: any[] = [];
    try {
        profiles = await getAllProfiles();
    } catch (error) {
        console.error('Error fetching profiles:', error);
        // Continue with empty array if fetch fails
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
                                Manage user roles, impersonate accounts, and monitor user activity.
                            </p>
                        </div>
                    </div>
                </header>

                <UserManagementClient profiles={profiles} />
            </div>
        </div>
    );
}
