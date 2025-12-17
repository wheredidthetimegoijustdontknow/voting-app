'use client';

import { useState } from 'react';
import { generateSyntheticData } from '@/lib/actions/dev';
import { Database } from 'lucide-react';

export default function DevTools() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setMessage(null);
        const result = await generateSyntheticData();
        setLoading(false);
        setMessage(result.message);

        if (result.success) {
            // Refresh page to see new stats?
            // Actions revalidatePath handles it, but client-side router.refresh might be needed if async.
            // But dashboard is server component, so revalidatePath should work on next navigation/refresh.
            window.location.reload();
        }
    };

    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div
            style={{
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-md)',
                border: '1px dashed var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)'
            }}
        >
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                Developer Tools
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    <Database size={16} />
                    {loading ? 'Generating...' : 'Generate Synthetic Votes'}
                </button>
                {message && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: message.includes('Success') ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {message}
                    </span>
                )}
            </div>
        </div>
    );
}
