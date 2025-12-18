'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updatePoll } from '@/app/actions/poll';
import { X, Edit3, Palette, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface EditPollModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    currentQuestion: string;
    onSuccess?: (newQuestion: string) => void;
}

type ModalMode = 'menu' | 'title' | 'color';

export default function EditPollModal({ isOpen, onClose, pollId, currentQuestion, onSuccess }: EditPollModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [mode, setMode] = useState<ModalMode>('menu');

    // Title Edit State
    const [question, setQuestion] = useState(currentQuestion);

    // Color Edit State
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setMode('menu');
            setQuestion(currentQuestion);
            setError('');
            setIsSubmitting(false); // <--- Reset loading state
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Small delay to allow exit animation if we add one
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, currentQuestion]);

    if (!isMounted || !isOpen) return null;

    const handleUpdateTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
            setError('Please enter a question');
            return;
        }
        if (question.length < 5) {
            setError('Question must be at least 5 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const result = await updatePoll(pollId, { question_text: question.trim() });
            if (result.success) {
                router.refresh();
                if (onSuccess) onSuccess(question.trim());
                onClose();
            } else {
                setError(result.error || 'Failed to update poll');
            }
        } catch (error) {
            console.error('Error updating poll:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateColor = async (colorId: number) => {
        setIsSubmitting(true);
        setError('');

        try {
            const result = await updatePoll(pollId, { color_theme_id: colorId });
            if (result.success) {
                router.refresh(); // This should trigger the new color
                // We don't need to pass color back to onSuccess necessarily, rely on refresh
                onClose();
            } else {
                setError(result.error || 'Failed to update color');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error updating color:', error);
            setError('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    const renderMenu = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
                Edit Poll
            </h2>

            <button
                onClick={() => setMode('title')}
                className="w-full flex items-center p-4 rounded-xl border transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group"
                style={{ borderColor: 'var(--color-border-default)' }}
            >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Edit3 size={20} />
                </div>
                <div className="text-left">
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Change Title</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Update the question text</div>
                </div>
            </button>

            <button
                onClick={() => setMode('color')}
                className="w-full flex items-center p-4 rounded-xl border transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group"
                style={{ borderColor: 'var(--color-border-default)' }}
            >
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Palette size={20} />
                </div>
                <div className="text-left">
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Change Color</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Update the visual theme</div>
                </div>
            </button>
        </div>
    );

    const renderTitleEditor = () => (
        <form onSubmit={handleUpdateTitle} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setMode('menu')}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    &larr; Back
                </button>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Change Title
                </h2>
                <div className="w-8" /> {/* Spacer */}
            </div>

            <div>
                <label htmlFor="question" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Question
                </label>
                <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like to ask?"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border-default)'
                    }}
                    disabled={isSubmitting}
                    autoFocus
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
        </form>
    );

    const renderColorPicker = () => {
        // Group IDs into rows as per requirements
        // Original: 1-5
        // Light: 6-10
        // Bright: 11-15
        // Warm: 16-20
        // Dark: 21-25

        const renderSwatch = (id: number) => (
            <button
                key={id}
                onClick={() => handleUpdateColor(id)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full border-2 border-black dark:border-white shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 relative"
                style={{
                    backgroundColor: `var(--color-poll-${id})`,
                    // @ts-ignore - Tailwind CSS variable
                    '--tw-ring-color': `var(--color-poll-${id})`
                }}
            >
                {/* We could show a checkmark if it's the current selected color, but we don't have it in props yet.
                    Ideally we should pass currentColorId to the modal props. For now, just click to set. */}
            </button>
        );

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <button
                        type="button"
                        onClick={() => setMode('menu')}
                        className="text-sm hover:underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        &larr; Back
                    </button>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        Select Theme
                    </h2>
                    <div className="w-8" />
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Original</div>
                        <div className="flex gap-3 flex-wrap">{[1, 2, 3, 4, 5].map(renderSwatch)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Light</div>
                        <div className="flex gap-3 flex-wrap">{[6, 7, 8, 9, 10].map(renderSwatch)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Bright</div>
                        <div className="flex gap-3 flex-wrap">{[11, 12, 13, 14, 15].map(renderSwatch)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Warm</div>
                        <div className="flex gap-3 flex-wrap">{[16, 17, 18, 19, 20].map(renderSwatch)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Vibrant</div>
                        <div className="flex gap-3 flex-wrap">{[21, 22, 23, 24, 25].map(renderSwatch)}</div>
                    </div>
                </div>

                {isSubmitting && (
                    <div className="text-center text-xs mt-2 flex items-center justify-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                        <Loader2 size={12} className="animate-spin" /> Updating theme...
                    </div>
                )}
            </div>
        );
    };

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
                className="relative w-full max-w-sm glassmorphism rounded-3xl shadow-2xl overflow-hidden modal-content-popup p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    <X size={18} />
                </button>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {error}
                    </div>
                )}

                {mode === 'menu' && renderMenu()}
                {mode === 'title' && renderTitleEditor()}
                {mode === 'color' && renderColorPicker()}
            </div>
        </div>,
        document.body
    );
}
