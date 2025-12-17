'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-dismiss timer
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for exit animation to finish before actual removal
            setTimeout(() => onDismiss(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onDismiss]);

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-center justify-between w-full max-w-sm p-4 mb-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ease-out transform translate-y-2 opacity-0",
                isVisible && "translate-y-0 opacity-100",
                // Type-based styling
                type === 'info' && "bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100",
                type === 'success' && "bg-teal-50/90 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200",
                type === 'error' && "bg-red-50/90 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            )}
            role="alert"
        >
            <div className="flex-1 mr-2 text-sm font-medium">
                {message}
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onDismiss(id), 300);
                }}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
                <X size={16} />
            </button>
        </div>
    );
}
