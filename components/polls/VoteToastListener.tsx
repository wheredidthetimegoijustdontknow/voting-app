'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastContext';

export function VoteToastListener() {
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to INSERT events on the 'votes' table
        const channel = supabase
            .channel('realtime-votes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                },
                async (payload) => {
                    const newVote = payload.new as { user_id: string; poll_id: string; choice: string };

                    // Try to fetch the username for the voter
                    try {
                        // We select 'username' from 'profiles' where id matches the voter's user_id
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('username')
                            .eq('id', newVote.user_id)
                            .single();

                        if (error && error.code !== 'PGRST116') { // Ignore "no rows found" fetching error safely
                            console.error('Error fetching voter profile:', error);
                        }

                        // Fetch poll question
                        const { data: pollData } = await supabase
                            .from('polls')
                            .select('question_text')
                            .eq('id', newVote.poll_id)
                            .single();

                        const voterName = data?.username || 'A user';
                        const pollQuestion = pollData?.question_text || 'a poll';

                        toast(`${voterName} voted "${newVote.choice}" on: ${pollQuestion}`, {
                            type: 'info',
                            duration: 5000,
                        });

                    } catch (err) {
                        console.error('Error handling vote toast:', err);
                        toast(`A user just voted!`, { type: 'info' });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Listening for new votes...');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, toast]);

    return null; // This component handles side effects only
}
