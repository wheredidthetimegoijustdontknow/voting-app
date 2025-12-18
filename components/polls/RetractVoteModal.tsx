import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCcw, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import { retractVote } from '@/app/actions/vote';

interface RetractVoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    onSuccess: () => void;
}

export default function RetractVoteModal({ isOpen, onClose, pollId, onSuccess }: RetractVoteModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isRetracting, setIsRetracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleRetract = async () => {
        setIsRetracting(true);
        setError(null);

        try {
            const result = await retractVote(pollId);

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.error || 'Failed to change vote');
            }
        } catch (err: any) {
            console.error('[RetractVoteModal] Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsRetracting(false);
        }
    };

    if (!isMounted || !isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in zoom-in-95"
            style={{ pointerEvents: 'auto' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 modal-backdrop"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-sm glassmorphism rounded-3xl shadow-2xl overflow-hidden modal-content-popup"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={isRetracting}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    <X size={18} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 text-indigo-500 mb-4">
                        <RefreshCcw size={32} />
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Change your vote?
                    </h3>

                    <p className="text-sm font-medium mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        This will remove your current vote and allow you to select a different option.
                    </p>

                    {error && (
                        <div className="w-full mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            disabled={isRetracting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:brightness-95 active:scale-95"
                            style={{
                                backgroundColor: 'var(--color-surface-hover)',
                                color: 'var(--color-text-primary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRetract}
                            disabled={isRetracting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                            }}
                        >
                            {isRetracting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Change Vote'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
