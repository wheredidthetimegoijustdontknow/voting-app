import { createClient } from '@supabase/supabase-js';

// Initialize Admin Client
export const getSupabaseAdmin = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface BotUser {
    id: string;
    email: string;
    username: string;
    created_at: string;
    vote_count: number;
}

export async function createBots(count: number = 5): Promise<{ created: number; errors: any[] }> {
    const supabase = getSupabaseAdmin();
    let created = 0;
    const errors = [];

    // 1. Get existing profiles to determine naming index
    const { count: existingProfileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .ilike('username', 'SimBot %');

    let nextIndex = (existingProfileCount || 0) + 1;

    for (let i = 0; i < count; i++) {
        const botId = nextIndex + i;
        const email = `sim_bot_${botId}@example.com`;

        try {
            // Updated: Simple creation. The DB Trigger (handle_new_user) now handles Profile creation + Email.
            const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    username: `SimBot ${botId}`,
                    is_sim_bot: true
                }
            });

            if (createError) throw createError;
            if (user) created++;

        } catch (err: any) {
            console.error(`Failed to create ${email}:`, err.message);
            errors.push(err);
        }
    }

    return { created, errors };
}

export async function deleteBots(count: number = 5): Promise<{ deleted: number; errors: any[] }> {
    const supabase = getSupabaseAdmin();
    let deleted = 0;
    const errors = [];

    // Get the most recent bots
    // We can identify them by username pattern 'SimBot %'
    const { data: bots, error } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', 'SimBot %')
        .order('created_at', { ascending: false })
        .limit(count);

    if (error) {
        console.error("Error listing bots for deletion:", error);
        return { deleted: 0, errors: [error] };
    }

    if (!bots || bots.length === 0) {
        return { deleted: 0, errors: [] };
    }

    for (const bot of bots) {
        try {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(bot.id);

            if (deleteError) {
                // If user not found, it's an orphan profile. Delete it directly.
                if (deleteError.status === 404 || deleteError.code === 'user_not_found' || deleteError.message.includes('not found')) {
                    console.warn(`Auth user not found for bot ${bot.username}. Deleting orphan profile.`);
                    const { error: profileError } = await supabase.from('profiles').delete().eq('id', bot.id);
                    if (profileError) throw profileError;
                    deleted++; // Count as deleted since we cleaned it up
                } else {
                    throw deleteError;
                }
            } else {
                deleted++;
            }
        } catch (err: any) {
            console.error(`Failed to delete bot ${bot.username} (${bot.id}):`, err.message);
            errors.push(err);
        }
    }

    return { deleted, errors };
}

export async function listBots(): Promise<BotUser[]> {
    const supabase = getSupabaseAdmin();

    // 1. Query profiles table
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, created_at, email')
        .ilike('username', 'SimBot %')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error listing bots:", error);
        return [];
    }

    if (profiles.length === 0) return [];

    const botIds = profiles.map(p => p.id);

    // 2. Fetch vote counts for these bots
    const { data: voteCounts, error: votesError } = await supabase
        .from('votes')
        .select('user_id')
        .in('user_id', botIds);

    const voteMap: Record<string, number> = {};
    if (!votesError && voteCounts) {
        voteCounts.forEach(v => {
            voteMap[v.user_id] = (voteMap[v.user_id] || 0) + 1;
        });
    }

    return profiles.map(p => ({
        id: p.id,
        email: p.email || '',
        username: p.username,
        created_at: p.created_at,
        vote_count: voteMap[p.id] || 0
    }));
}

export async function getBotStats(): Promise<{ totalBots: number; totalBotVotes: number }> {
    const supabase = getSupabaseAdmin();

    // 1. Get bots
    const bots = await listBots();

    // 2. Sum up votes from listBots result (more efficient than separate query if we already called it)
    const totalBotVotes = bots.reduce((sum, bot) => sum + bot.vote_count, 0);

    return {
        totalBots: bots.length,
        totalBotVotes
    };
}

export async function simulateVoting(pollId?: string): Promise<{ votesCast: number; errors: any[]; details: any[] }> {
    const supabase = getSupabaseAdmin();
    const errors: any[] = [];
    const details: any[] = [];

    console.log("[bot-manager] simulateVoting: Fetching bots...");
    const bots = await listBots();
    if (bots.length === 0) {
        console.log("[bot-manager] simulateVoting: No bots found.");
        return { votesCast: 0, errors: [], details: [] };
    }

    let polls = [];
    if (pollId) {
        // FIXED: use question_text instead of question
        const { data, error } = await supabase.from('polls').select('id, question_text').eq('id', pollId);
        if (error) {
            console.error("[bot-manager] simulateVoting: Error fetching target poll:", error);
            return { votesCast: 0, errors: [error], details: [] };
        }
        polls = data || [];
    } else {
        // FIXED: use question_text instead of question
        const { data, error } = await supabase.from('polls').select('id, question_text');
        if (error) {
            console.error("[bot-manager] simulateVoting: Error fetching polls:", error);
            return { votesCast: 0, errors: [error], details: [] };
        }
        polls = data || [];
    }

    if (polls.length === 0) {
        console.log("[bot-manager] simulateVoting: No polls found.");
        return { votesCast: 0, errors: [], details: [] };
    }
    console.log(`[bot-manager] simulateVoting: Found ${bots.length} bots and ${polls.length} polls.`);

    // Humanize: Shuffle polls and bots to avoid predictable sequences
    const shuffledPolls = [...polls].sort(() => Math.random() - 0.5);
    const shuffledBots = [...bots].sort(() => Math.random() - 0.5);

    console.log(`[bot-manager] simulateVoting: Humanizing simulation...`);

    let votesCast = 0;

    for (const poll of shuffledPolls) {
        const { data: choices, error: choicesError } = await supabase.from('polls_choices').select('choice').eq('poll_id', poll.id);

        if (choicesError || !choices || choices.length === 0) {
            if (choicesError) {
                console.error(`[bot-manager] Error fetching choices for poll ${poll.id}:`, choicesError);
                errors.push(choicesError);
            }
            continue;
        }

        for (const bot of shuffledBots) {
            const { data: existing, error: checkError } = await supabase.from('votes').select('id').eq('poll_id', poll.id).eq('user_id', bot.id).single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error(`[bot-manager] Error checking existing vote for bot ${bot.id}:`, checkError);
                errors.push(checkError);
                continue;
            }

            if (!existing) {
                // Humanize: Random delay between 500ms and 2000ms
                const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
                await sleep(delay);

                const randomChoice = choices[Math.floor(Math.random() * choices.length)].choice;
                const { error: insertError } = await supabase.from('votes').insert({
                    poll_id: poll.id,
                    user_id: bot.id,
                    choice: randomChoice
                });

                if (insertError) {
                    console.error(`[bot-manager] Failed to cast vote: ${bot.username} on ${poll.question_text}`, insertError.message);
                    errors.push(insertError);
                } else {
                    votesCast++;
                    console.log(`[bot-manager] VOTE CAST (${delay}ms delay): ${bot.username} -> "${randomChoice}" on "${poll.question_text}"`);
                    details.push({
                        bot: bot.username,
                        poll: poll.question_text,
                        choice: randomChoice
                    });
                }
            }
        }
    }

    console.log(`[bot-manager] simulateVoting: Complete. Votes cast: ${votesCast}`);
    return { votesCast, errors, details };
}

export async function clearBotVotes(): Promise<{ deleted: number; errors: any[] }> {
    const supabase = getSupabaseAdmin();
    console.log("[bot-manager] clearBotVotes: STARTING VOID RUN...");

    // 1. Get bot IDs
    const bots = await listBots();
    if (bots.length === 0) {
        console.log("[bot-manager] clearBotVotes: No bots found. Nothing to delete.");
        return { deleted: 0, errors: [] };
    }

    const botIds = bots.map(b => b.id);
    console.log(`[bot-manager] clearBotVotes: Preparing to delete votes for ${botIds.length} bots:`, botIds);

    // 2. Count before for verification
    const { count: beforeCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .in('user_id', botIds);

    console.log(`[bot-manager] clearBotVotes: Found ${beforeCount} votes to delete.`);

    if (beforeCount === 0) {
        console.log("[bot-manager] clearBotVotes: Database already has 0 votes for these bots.");
        return { deleted: 0, errors: [] };
    }

    // 3. Perform Deletion
    const { count, error } = await supabase
        .from('votes')
        .delete({ count: 'exact' })
        .in('user_id', botIds);

    if (error) {
        console.error("[bot-manager] clearBotVotes: DELETE ERROR:", error);
        return { deleted: 0, errors: [error] };
    }

    console.log(`[bot-manager] clearBotVotes: Supabase reported ${count} rows deleted.`);

    // 4. Verification check after deletion
    const { count: afterCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .in('user_id', botIds);

    console.log(`[bot-manager] clearBotVotes: Verification count after delete: ${afterCount}`);

    if (afterCount && afterCount > 0) {
        console.error(`[bot-manager] clearBotVotes: CRITICAL - ${afterCount} votes still exist after delete command!`);
        return { deleted: count ?? 0, errors: ["Verification failed: Votes still exist after deletion"] };
    }

    return { deleted: count ?? 0, errors: [] };
}
