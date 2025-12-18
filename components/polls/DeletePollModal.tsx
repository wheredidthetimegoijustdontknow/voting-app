import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deletePoll } from '@/app/actions/poll';

interface DeletePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    onSuccess: () => void;
}

export default function DeletePollModal({ isOpen, onClose, pollId, onSuccess }: DeletePollModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            console.log('[DeletePollModal] Deleting poll:', pollId);
            const result = await deletePoll(pollId);

            if (result.success) {
                console.log('[DeletePollModal] Deletion successful');
                onSuccess();
                onClose();
            } else {
                console.error('[DeletePollModal] Deletion failed:', result.error);
                setError(result.error || 'Failed to delete poll');
            }
        } catch (err: any) {
            console.error('[DeletePollModal] Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
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
                    disabled={isDeleting}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    <X size={18} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Warning Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 text-red-500 mb-4">
                        <Trash2 size={32} />
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Delete this poll?
                    </h3>

                    <p className="text-sm font-medium mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        This action cannot be undone. All votes and analytics associated with this poll will be permanently removed.
                    </p>

                    {error && (
                        <div className="w-full mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:brightness-95 active:scale-95"
                            style={{
                                backgroundColor: 'var(--color-surface-hover)',
                                color: 'var(--color-text-primary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20 text-white flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                            }}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
