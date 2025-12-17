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
          polls (question_text)
        `)
                .order('created_at', { ascending: false })
                .limit(15);

            if (data) {
                const transformed: VoteActivity[] = (data as any).map((v: any) => ({
                    id: v.id,
                    created_at: v.created_at,
                    choice: v.choice,
                    username: (v.profiles as any)?.username || 'Anonymous',
                    question_text: (v.polls as any)?.question_text || 'Unknown Poll'
                }));
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
              polls (question_text)
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
                            question_text: v.polls?.question_text || 'Unknown Poll'
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
            className="flex flex-col h-full border-l overflow-hidden transition-colors duration-300"
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-default)'
            }}
        >
            <div className="p-4 border-b flex items-center gap-2 font-semibold" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border-default)' }}>
                <Activity size={18} className="text-primary" />
                <span>Live Activity</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
            >
                {activities.length === 0 ? (
                    <div className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Waiting for activity...
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="group relative pl-4 border-l-2 transition-all hover:border-primary"
                            style={{ borderColor: 'var(--color-border-light)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex -space-x-1">
                                    <User size={12} className="text-secondary" />
                                </div>
                                <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                    {activity.username}
                                </span>
                                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                    {formatPollDate(activity.created_at)}
                                </span>
                            </div>

                            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                voted <span className="font-semibold text-primary">"{activity.choice}"</span>
                            </p>
                            <p className="text-[10px] truncate mt-0.5 italic" style={{ color: 'var(--color-text-muted)' }}>
                                on: {activity.question_text}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-opacity-50 border-t text-[10px] flex items-center justify-between" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Connected to Realtime</span>
                </div>
                <span>{activities.length} entries</span>
            </div>
        </div>
    );
}
