'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useEffect, useState } from 'react';

interface Result {
    choice: string;
    count: number;
    percentage: number;
}

interface PollResultsChartProps {
    results: Result[];
}

export default function PollResultsChart({ results }: PollResultsChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                style={{
                    height: 300,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)'
                }}
            >
                Loading chart...
            </div>
        );
    }

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border-default)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
                    <p style={{ margin: 0, color: 'var(--color-primary)' }}>
                        Votes: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={results}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                    <XAxis
                        dataKey="choice"
                        stroke="var(--color-text-secondary)"
                        fontSize="12px"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="var(--color-text-secondary)"
                        fontSize="12px"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-subtle)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="var(--color-primary)" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
