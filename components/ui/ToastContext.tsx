'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from './Toast';

interface ToastOptions {
    duration?: number;
    type?: ToastType;
}

interface ToastContextValue {
    toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; duration: number }>>([]);

    const toast = useCallback((message: string, options?: ToastOptions) => {
        console.log(`[ToastContext] Triggered: "${message}"`, options);
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, {
            id,
            message,
            type: options?.type || 'info',
            duration: options?.duration || 4000
        }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none gap-2">
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        id={t.id}
                        message={t.message}
                        type={t.type}
                        duration={t.duration}
                        onDismiss={dismissToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
