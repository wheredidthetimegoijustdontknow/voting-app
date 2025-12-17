'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const SAMPLE_QUESTIONS = [
    {
        question: "What's your favorite programming language?",
        choices: ["Python", "JavaScript", "Rust", "Go", "TypeScript"]
    },
    {
        question: "Best time to code?",
        choices: ["Early Morning", "Late Night", "Afternoon", "Weekends"]
    },
    {
        question: "Tab vs Spaces?",
        choices: ["Tabs", "Spaces", "Mix (Chaos)"]
    },
    {
        question: "Favorite Frontend Framework?",
        choices: ["React", "Vue", "Svelte", "Angular", "Solid"]
    },
    {
        question: "Coffee or Tea?",
        choices: ["Coffee", "Tea", "Water", "Energy Drinks"]
    }
];

export async function generateSyntheticData() {
    if (process.env.NODE_ENV !== 'development') {
        return { success: false, message: 'Only available in development mode' };
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { success: false, message: 'Missing SUPABASE_SERVICE_ROLE_KEY. Cannot manage bots.' };
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // Strategy: Create FRESH unique bots every time to guarantee success.
        // This avoids "User already registered" and "Pagination/Finding" issues.
        // Since this is for dev/demo, creating extra users is fine.

        const runId = Date.now().toString().slice(-4);
        const bots = [];

        console.log(`Starting generation with runId: ${runId}`);

        // 1. Create 3 new bots for this specific run
        for (let i = 1; i <= 3; i++) {
            const email = `bot_${runId}_${i}@example.com`;

            const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { username: `Bot ${runId}-${i}` }
            });

            if (createError) {
                console.error(`Failed to create ${email}:`, createError);
                continue;
            }

            if (user) bots.push(user);
        }

        if (bots.length === 0) {
            return { success: false, message: 'Failed to create any new bot users.' };
        }

        const creatorBot = bots[0]; // First bot creates polls if needed

        // 2. Create Sample Polls?
        // Always check if we have enough polls, if not, creating more is good.
        let createdPollsCount = 0;
        const { count } = await supabaseAdmin.from('polls').select('*', { count: 'exact', head: true });

        // Ensure at least 3 polls exist
        if (count !== null && count < 3) {
            for (const sample of SAMPLE_QUESTIONS) {
                const { data: poll, error: pollError } = await supabaseAdmin
                    .from('polls')
                    .insert({
                        user_id: creatorBot.id,
                        question_text: sample.question
                    })
                    .select()
                    .single();

                if (pollError || !poll) continue;

                const choiceInserts = sample.choices.map(c => ({
                    poll_id: poll.id,
                    choice: c
                }));

                await supabaseAdmin.from('polls_choices').insert(choiceInserts);
                createdPollsCount++;
            }
        }

        // 3. Fetch all polls
        const { data: polls } = await supabaseAdmin.from('polls').select('id');
        if (!polls || polls.length === 0) {
            return { success: false, message: 'No polls found.' };
        }

        // 4. Bots Vote
        let votesCast = 0;
        for (const poll of polls) {
            const { data: choices } = await supabaseAdmin
                .from('polls_choices')
                .select('choice')
                .eq('poll_id', poll.id);

            if (!choices || choices.length === 0) continue;

            for (const bot of bots) {
                // Vote on everything for maximum activity
                const randomChoice = choices[Math.floor(Math.random() * choices.length)].choice;

                // We can skip the "check if voted" because these are BRAND NEW bots.
                // They have definitely not voted on anything yet.

                const { error: voteError } = await supabaseAdmin.from('votes').insert({
                    poll_id: poll.id,
                    user_id: bot.id,
                    choice: randomChoice
                });

                if (!voteError) votesCast++;
            }
        }

        revalidatePath('/dashboard');
        return {
            success: true,
            message: `Created ${bots.length} new bots, ${createdPollsCount} polls, cast ${votesCast} votes.`
        };

    } catch (error: any) {
        console.error('Synthetic data generation failed:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
}
