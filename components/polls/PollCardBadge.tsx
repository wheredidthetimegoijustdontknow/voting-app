'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PollCardBadgeProps {
    status: string;
    created_at: string;
    last_vote_at?: string | null;
    ends_at?: string | null;
    is_verified?: boolean;
}

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

export const PollCardBadge: React.FC<PollCardBadgeProps> = ({
    status,
    created_at,
    last_vote_at,
    ends_at,
    is_verified
}) => {
    const now = new Date();
    const createdAt = new Date(created_at);
    const lastVoteAt = last_vote_at ? new Date(last_vote_at) : null;
    const endsAt = ends_at ? new Date(ends_at) : null;

    const isNew = now.getTime() - createdAt.getTime() < 5 * 60 * 1000;
    const isDormant = status === 'ACTIVE' && lastVoteAt && (now.getTime() - lastVoteAt.getTime() > 7 * 24 * 60 * 60 * 1000);
    const isEndingSoon = status === 'ACTIVE' && endsAt && (endsAt.getTime() - now.getTime() < 60 * 60 * 1000) && (endsAt.getTime() - now.getTime() > 0);

    if (status === 'REMOVED') return <Badge color="bg-red-500/20 text-red-400 border-red-500/50">Removed</Badge>;
    if (status === 'REVIEW') return <Badge color="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Under Review</Badge>;
    if (status === 'ENDED') return <Badge color="bg-zinc-500/20 text-zinc-400 border-zinc-500/50">Ended</Badge>;
    if (status === 'SCHEDULED') return <Badge color="bg-blue-500/20 text-blue-400 border-blue-500/50">Scheduled</Badge>;

    return (
        <div className="flex flex-wrap gap-2">
            {isNew && <Badge color="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse">New!</Badge>}
            {isEndingSoon && <Badge color="bg-orange-500/20 text-orange-400 border-orange-500/50">Ending Soon</Badge>}
            {isDormant && <Badge color="bg-zinc-700/50 text-zinc-400 border-zinc-600">Dormant</Badge>}
            {is_verified && <Badge color="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">Verified</Badge>}
            {status === 'ACTIVE' && !isEndingSoon && !isDormant && !isNew && (
                <Badge color="bg-indigo-500/10 text-indigo-400/80 border-indigo-500/20">Active</Badge>
            )}
        </div>
    );
};

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        color
    )}>
        {children}
    </span>
);
