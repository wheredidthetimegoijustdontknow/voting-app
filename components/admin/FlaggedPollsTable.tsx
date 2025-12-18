'use client';

import React, { useState, useEffect } from 'react';
import { fetchModerationPolls, restorePoll, flagPoll } from '@/app/actions/poll';
import { Trash2, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';

export const FlaggedPollsTable: React.FC = () => {
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const { toast } = useToast();

    const loadPolls = async () => {
        setLoading(true);
        const res = await fetchModerationPolls();
        if (res.success) {
            setPolls(res.polls || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPolls();
    }, []);

    const handleRestore = async (id: string) => {
        setActionId(id);
        const res = await restorePoll(id);
        if (res.success) {
            toast('Poll restored successfully', { type: 'success' });
            loadPolls();
        } else {
            toast(res.error || 'Failed to restore', { type: 'error' });
        }
        setActionId(null);
    };

    if (loading && polls.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-zinc-500" size={24} />
            </div>
        );
    }

    if (polls.length === 0) {
        return (
            <div className="text-center p-6 text-zinc-500 text-xs">
                No polls currently in moderation queue.
            </div>
        );
    }

    return (
        <div className="space-y-2 overflow-y-auto max-h-60 scrollbar-hide">
            {polls.map((poll) => (
                <div
                    key={poll.id}
                    className="flex flex-col gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
                >
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-tight">
                            {poll.question_text}
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${poll.status === 'REVIEW'
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                            {poll.status}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500">
                            {poll.status === 'REMOVED' ? `Deleted: ${new Date(poll.deleted_at).toLocaleDateString()}` : `Flagged`}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleRestore(poll.id)}
                                disabled={!!actionId}
                                className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition disabled:opacity-50"
                                title="Restore Poll"
                            >
                                {actionId === poll.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
