'use client';

import React, { useState, useMemo } from 'react';
import {
    Trash2,
    RotateCcw,
    ShieldCheck,
    Loader2,
    Search,
    Eye,
    EyeOff,
    AlertCircle,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';
import { restorePoll, unflagPoll, permanentlyDeletePoll } from '@/app/actions/poll';
import PollCard from '../polls/PollCard';
import type { PollWithResults } from '@/lib/polls/types';

interface ModerationListProps {
    initialPolls: PollWithResults[];
}

export default function ModerationList({ initialPolls }: ModerationListProps) {
    const [polls, setPolls] = useState(initialPolls);
    const [search, setSearch] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const { toast } = useToast();

    const filteredPolls = useMemo(() => {
        return polls.filter(poll =>
            poll.question_text.toLowerCase().includes(search.toLowerCase()) ||
            poll.id.toLowerCase().includes(search.toLowerCase())
        );
    }, [polls, search]);

    const handleAction = async (id: string, action: 'restore' | 'unflag' | 'delete') => {
        if (action === 'delete' && !window.confirm('Are you sure? This is permanent and irreversible.')) {
            return;
        }

        setActionId(id);
        let res;

        if (action === 'restore') res = await restorePoll(id);
        else if (action === 'unflag') res = await unflagPoll(id);
        else if (action === 'delete') res = await permanentlyDeletePoll(id);

        if (res?.success) {
            toast(`${action === 'delete' ? 'Permanently deleted' : 'Poll updated'} successfully`, { type: 'success' });
            setPolls(prev => prev.filter(p => p.id !== id));
            if (previewId === id) setPreviewId(null);
        } else {
            toast(res?.error || 'Action failed', { type: 'error' });
        }
        setActionId(null);
    };

    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by question or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                                <th className="px-6 py-4">Poll Details</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Context</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredPolls.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-sm">
                                        No polls matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredPolls.map((poll) => (
                                    <React.Fragment key={poll.id}>
                                        <tr className={`hover:bg-zinc-50/80 transition-colors ${previewId === poll.id ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-semibold text-zinc-900 leading-tight">
                                                        {poll.question_text}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-zinc-400">
                                                        ID: {poll.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${poll.status === 'REVIEW'
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                            : 'bg-red-100 text-red-700 border-red-200'
                                                        }`}>
                                                        {poll.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 text-xs">
                                                    <div className="flex items-center gap-1.5 text-zinc-600">
                                                        <User size={12} className="text-zinc-400" />
                                                        <span className="truncate max-w-[120px]">{poll.user_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                                                        <AlertCircle size={10} />
                                                        <span>
                                                            {poll.status === 'REMOVED'
                                                                ? `Deleted: ${new Date(poll.deleted_at!).toLocaleDateString()}`
                                                                : `Created: ${new Date(poll.created_at).toLocaleDateString()}`
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setPreviewId(previewId === poll.id ? null : poll.id)}
                                                        className={`p-2 rounded-lg transition-all border ${previewId === poll.id
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200'
                                                            }`}
                                                        title={previewId === poll.id ? "Hide Preview" : "Show Preview"}
                                                    >
                                                        {previewId === poll.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>

                                                    {poll.status === 'REVIEW' && (
                                                        <button
                                                            onClick={() => handleAction(poll.id, 'unflag')}
                                                            disabled={!!actionId}
                                                            className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all border border-emerald-200"
                                                            title="Unflag & Approve"
                                                        >
                                                            {actionId === poll.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                                        </button>
                                                    )}

                                                    {poll.status === 'REMOVED' && (
                                                        <button
                                                            onClick={() => handleAction(poll.id, 'restore')}
                                                            disabled={!!actionId}
                                                            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all border border-blue-200"
                                                            title="Restore Poll"
                                                        >
                                                            {actionId === poll.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleAction(poll.id, 'delete')}
                                                        disabled={!!actionId}
                                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all border border-red-200"
                                                        title="Permanently Delete"
                                                    >
                                                        {actionId === poll.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {previewId === poll.id && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 bg-zinc-50/50">
                                                    <div className="max-w-xl mx-auto">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Live Preview</span>
                                                            <div className="h-px flex-1 mx-4 bg-zinc-200" />
                                                        </div>
                                                        <div className="pointer-events-none opacity-90 scale-[0.98] transform-gpu">
                                                            <PollCard
                                                                poll={poll}
                                                                isSignedIn={false}
                                                                currentUserId={null}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
