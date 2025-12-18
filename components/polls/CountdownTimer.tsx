'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string;
    onEnd?: () => void;
    label?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onEnd, label }) => {
    const [timeLeft, setTimeLeft] = useState<{
        h: string;
        m: string;
        s: string;
        total: number;
    }>({ h: '00', m: '00', s: '00', total: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                if (onEnd) onEnd();
                return { h: '00', m: '00', s: '00', total: 0 };
            }

            const h = Math.floor(difference / (1000 * 60 * 60));
            const m = Math.floor((difference / (1000 * 60)) % 60);
            const s = Math.floor((difference / 1000) % 60);

            return {
                h: h.toString().padStart(2, '0'),
                m: m.toString().padStart(2, '0'),
                s: s.toString().padStart(2, '0'),
                total: difference
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (left.total <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onEnd]);

    if (timeLeft.total <= 0) return null;

    const isUrgent = timeLeft.total < 3600000; // Less than 1 hour

    return (
        <div className="flex items-center gap-1.5 text-xs font-mono">
            {label && <span className="uppercase font-bold text-red-500 whitespace-nowrap">{label}</span>}
            <div className={`px-2 py-1 rounded-md border-2 border-red-500 font-bold transition-all duration-500 text-sm text-zinc-900 ${isUrgent
                ? 'bg-red-50 shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-pulse-slow'
                : 'bg-white'
                }`}>
                {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
            </div>
        </div>
    );
};
