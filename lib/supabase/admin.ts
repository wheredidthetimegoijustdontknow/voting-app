import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses RLS and should be used ONLY for administrative
 * actions in server-side code (Server Actions, API Routes).
 */
export const createAdminSupabaseClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};
