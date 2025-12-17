'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePoll } from '@/app/actions/poll';

interface EditPollModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    currentQuestion: string;
    onSuccess?: (newQuestion: string) => void;
}

export default function EditPollModal({ isOpen, onClose, pollId, currentQuestion, onSuccess }: EditPollModalProps) {
    const [question, setQuestion] = useState(currentQuestion);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
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
            const result = await updatePoll(pollId, question.trim());

            if (result.success) {
                router.refresh(); // Trigger immediate update
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

    return (
        // Removed 'animate-in' classes to prevent flickering if state updates cause re-render
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                <h2 className="text-xl font-semibold text-black mb-4">
                    Edit Poll Question
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-black mb-1">
                            Question
                        </label>
                        <textarea
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What would you like to ask?"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="text-red-700 text-sm bg-red-100 p-2 rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !question.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
