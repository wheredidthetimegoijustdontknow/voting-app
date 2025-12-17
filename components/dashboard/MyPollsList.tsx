'use client';

import { PollWithResults } from '@/lib/polls/types';
import PollCard from '@/components/polls/PollCard';
import Link from 'next/link';
import { Layout } from 'lucide-react';

interface MyPollsListProps {
    polls: PollWithResults[];
    currentUserId: string;
}

export default function MyPollsList({ polls, currentUserId }: MyPollsListProps) {
    if (polls.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-xxl)',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--color-border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)'
                }}
            >
                <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <Layout size={32} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        No polls created yet
                    </h3>
                    <p style={{ marginTop: 'var(--spacing-xs)', maxWidth: '400px' }}>
                        Get started by creating your first poll to see real-time results and analytics.
                    </p>
                </div>
                <Link
                    href="/create" // Changed href to /create as per common practice for creating new resources
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-inverse)',
                        fontWeight: '500',
                        textDecoration: 'none',
                        fontSize: 'var(--font-size-base)',
                        marginTop: 'var(--spacing-sm)'
                    }}
                >
                    Create New Poll
                </Link>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 'var(--spacing-lg)'
            }}
        >
            {polls.map((poll) => (
                <PollCard
                    key={poll.id}
                    poll={poll}
                    isSignedIn={true}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}
