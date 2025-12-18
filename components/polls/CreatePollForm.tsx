// app/components/polls/CreatePollForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '@/app/actions/poll';

interface CreatePollFormProps {
  onSuccess?: () => void;
}

export default function CreatePollForm({ onSuccess }: CreatePollFormProps) {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const addChoice = () => {
    setChoices([...choices, '']);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form (Client-side)
    if (!questionText.trim()) {
      setError('Please enter a question');
      return;
    }

    const validChoices = choices.filter(choice => choice.trim() !== '');
    if (validChoices.length < 2) {
      setError('Please provide at least 2 choices');
      return;
    }

    setIsSubmitting(true);

    try {
      // Server Action Call
      const result = await createPoll({
        question_text: questionText.trim(),
        choices: validChoices,
      });

      if (result.success) {
        // Reset form
        setQuestionText('');
        setChoices(['', '']);
        // Refresh the page data
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Failed to create poll');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Input */}
      <div>
        <label
          htmlFor="question"
          className="text-body font-medium mb-2 block"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Question
        </label>
        <input
          type="text"
          id="question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="What would you like to ask?"
          className="input w-full"
          disabled={isSubmitting}
        />
      </div>

      {/* Choices */}
      <div>
        <label
          className="text-body font-medium mb-2 block"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Choices
        </label>
        <div className="space-y-3">
          {choices.map((choice, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                className="input flex-1"
                disabled={isSubmitting}
              />
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-error text-error hover:bg-error/10 transition-colors"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addChoice}
          className="mt-3 px-3 py-1.5 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
          disabled={isSubmitting}
        >
          + Add Choice
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="badge badge-error w-full py-3 px-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-primary w-full h-12 text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
      >
        {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
      </button>
    </form>
  );
}
