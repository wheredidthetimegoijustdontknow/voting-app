'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastContext';

export function VoteToastListener() {
    const { toast } = useToast();
    // Fix: Ensure supabase client is stable across renders
    const [supabase] = useState(() => createClient());

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
                    console.log('🔔 [VoteToastListener] New vote toast event:', {
                        payload,
                        newVote: payload.new,
                        timestamp: new Date().toISOString()
                    });
                    
                    const newVote = payload.new as { user_id: string; poll_id: string; choice: string };
                    console.log('🔔 [VoteToastListener] Extracted vote data:', newVote);

                    // Try to fetch the username for the voter
                    try {
                        console.log('🔍 [VoteToastListener] Fetching voter profile for user_id:', newVote.user_id);
                        // We select 'username' from 'profiles' where id matches the voter's user_id
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('username, aura_color, spirit_emoji')
                            .eq('id', newVote.user_id)
                            .single();

                        console.log('🔍 [VoteToastListener] Profile fetch result:', { data, error });
                        
                        if (error && error.code !== 'PGRST116') { // Ignore "no rows found" fetching error safely
                            console.error('❌ [VoteToastListener] Error fetching voter profile:', error);
                        }

                        console.log('🔍 [VoteToastListener] Fetching poll question for poll_id:', newVote.poll_id);
                        // Fetch poll question
                        const { data: pollData } = await supabase
                            .from('polls')
                            .select('question_text')
                            .eq('id', newVote.poll_id)
                            .single();
                            
                        console.log('🔍 [VoteToastListener] Poll fetch result:', pollData);

                        const voterName = data?.username || 'A user';
                        const voterEmoji = data?.spirit_emoji || '👤';
                        const voterAura = data?.aura_color || '#8A2BE2';
                        const pollQuestion = pollData?.question_text || 'a poll';
                        
                        const toastMessage = `${voterEmoji} ${voterName} voted "${newVote.choice}" on: ${pollQuestion}`;
                        console.log('🔔 [VoteToastListener] Showing toast:', toastMessage);

                        toast(toastMessage, {
                            type: 'info',
                            duration: 5000,
                        });

                    } catch (err) {
                        console.error('💥 [VoteToastListener] Error handling vote toast:', err);
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
