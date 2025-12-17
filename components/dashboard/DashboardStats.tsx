'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, Users, Layout, TrendingUp } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
    return (
        <div
            style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    {label}
                </span>
                <div
                    style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-primary)'
                    }}
                >
                    <Icon size={18} />
                </div>
            </div>
            <div>
                <span style={{
                    fontSize: 'var(--font-size-4xl)',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)'
                }}>
                    {value}
                </span>
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
}

interface DashboardStatsProps {
    totalPolls: number;
    totalVotes: number;
    avgVotesPerPoll: number;
}

export default function DashboardStats({ totalPolls, totalVotes, avgVotesPerPoll }: DashboardStatsProps) {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const channel = supabase
            .channel('dashboard-private-sync')
            .on(
                'postgres_changes',
                { event: '*', table: 'votes', schema: 'public' },
                () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        console.log('[DashboardStats] Syncing private dashboard...');
                        router.refresh();
                    }, 2000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            clearTimeout(timeout);
        };
    }, [supabase, router]);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}
        >
            <StatCard
                label="Total Polls"
                value={totalPolls}
                icon={Layout}
            />
            <StatCard
                label="Total Votes Received"
                value={totalVotes}
                icon={Users}
                trend="+12% from last week"
            />
            <StatCard
                label="Avg. Votes / Poll"
                value={avgVotesPerPoll.toFixed(1)}
                icon={BarChart3}
            />
        </div>
    );
}
