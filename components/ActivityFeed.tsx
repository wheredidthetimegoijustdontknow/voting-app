'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPollDate } from '@/lib/polls/helpers';
import { Activity, User, Vote as VoteIcon } from 'lucide-react';

interface VoteActivity {
    id: string;
    created_at: string;
    choice: string;
    username: string;
    question_text: string;
    color_theme_id: number;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<VoteActivity[]>([]);
    const supabase = createClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Initial fetch of recent votes
        const fetchRecentVotes = async () => {
            const { data, error } = await supabase
                .from('votes')
                .select(`
          id,
          created_at,
          choice,
          profiles (username),
          polls (question_text, color_theme_id)
        `)
                .order('created_at', { ascending: false })
                .limit(15);

            if (data) {
                console.log('Raw vote data:', data[0]); // Debug log
                const transformed: VoteActivity[] = (data as any).map((v: any) => {
                    const pollData = v.polls;
                    console.log('Poll data:', pollData); // Debug log
                    return {
                        id: v.id,
                        created_at: v.created_at,
                        choice: v.choice,
                        username: (v.profiles as any)?.username || 'Anonymous',
                        question_text: pollData?.question_text || 'Unknown Poll',
                        color_theme_id: pollData?.color_theme_id || 1
                    };
                });
                console.log('Transformed activities:', transformed[0]); // Debug log
                setActivities(transformed);
            }
        };

        fetchRecentVotes();

        // 2. Subscribe to real-time votes
        const channel = supabase
            .channel('public:votes_activity')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'votes' },
                async (payload) => {
                    // When a new vote comes in, fetch its details (to get profile/poll info)
                    const { data, error } = await supabase
                        .from('votes')
                        .select(`
              id,
              created_at,
              choice,
              profiles (username),
              polls (question_text, color_theme_id)
            `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        const v = data as any;
                        const newActivity: VoteActivity = {
                            id: v.id,
                            created_at: v.created_at,
                            choice: v.choice,
                            username: v.profiles?.username || 'Anonymous',
                            question_text: v.polls?.question_text || 'Unknown Poll',
                            color_theme_id: v.polls?.color_theme_id || 1
                        };

                        setActivities(prev => [newActivity, ...prev].slice(0, 20));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div
            className="flex flex-col h-full overflow-hidden transition-colors duration-300"
            style={{
                backgroundColor: 'var(--color-surface)',
            }}
        >
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-default)' }}>
                <div className="flex items-center gap-2 font-bold text-sm tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    <Activity size={18} className="text-primary" />
                    <span>LIVE ACTIVITY</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {activities.length}
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin"
            >
                {activities.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
                            <Activity size={20} className="text-zinc-300" />
                        </div>
                        <p className="text-sm font-medium text-zinc-400">Waiting for activity...</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const colorId = activity.color_theme_id || 1;
                        return (
                            <div
                                key={activity.id}
                                className="group relative pl-4 border-l-5 transition-all duration-300"
                                style={{
                                    borderColor: `var(--color-poll-${colorId})`,
                                    '--activity-color': `var(--color-poll-${colorId})`
                                } as React.CSSProperties}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold truncate pr-2" style={{ color: 'var(--color-text-primary)' }}>
                                        {activity.username}
                                    </span>
                                    <span className="text-[10px] whitespace-nowrap opacity-60 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                        {formatPollDate(activity.created_at)}
                                    </span>
                                </div>

                                <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    voted <span className="font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-md">"{activity.choice}"</span>
                                </p>
                                <p className="text-[10px] truncate font-medium opacity-70 italic" style={{ color: 'var(--color-text-muted)' }}>
                                    on: {activity.question_text}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t text-[10px] flex items-center justify-center" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-2 font-bold tracking-widest uppercase opacity-80">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span>Realtime Sync Active</span>
                </div>
            </div>
        </div>
    );
}
