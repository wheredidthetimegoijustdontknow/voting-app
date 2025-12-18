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
  const [duration, setDuration] = useState<string>('indefinite'); // '1h', '24h', '3d', '7d', 'indefinite', 'custom'
  const [startsAt, setStartsAt] = useState<string>('now'); // 'now', 'custom'
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
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
      // Calculate timestamps
      let starts_at: string | undefined = undefined;
      if (startsAt === 'custom' && customStartTime) {
        starts_at = new Date(customStartTime).toISOString();
      } else {
        starts_at = new Date().toISOString();
      }

      let ends_at: string | null = null;
      if (duration === 'custom' && customEndTime) {
        ends_at = new Date(customEndTime).toISOString();
      } else if (duration !== 'indefinite') {
        const start = new Date(starts_at);
        const hoursToAdd = duration === '1h' ? 1 : duration === '24h' ? 24 : duration === '3d' ? 72 : duration === '7d' ? 168 : 0;
        if (hoursToAdd > 0) {
          start.setHours(start.getHours() + hoursToAdd);
          ends_at = start.toISOString();
        }
      }

      // Server Action Call
      const result = await createPoll({
        question_text: questionText.trim(),
        choices: validChoices,
        starts_at,
        ends_at,
        is_premium_timer: duration === 'custom' || startsAt === 'custom',
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        {/* Start Time */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
            Start Time
          </label>
          <div className="flex flex-col gap-2">
            <select
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="input text-sm h-10"
              disabled={isSubmitting}
            >
              <option value="now">Immediate</option>
              <option value="custom">Scheduled (Custom)</option>
            </select>
            {startsAt === 'custom' && (
              <input
                type="datetime-local"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="input text-sm h-10"
                disabled={isSubmitting}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
            Poll Duration
          </label>
          <div className="flex flex-col gap-2">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input text-sm h-10"
              disabled={isSubmitting}
            >
              <option value="indefinite">Indefinite (No Limit)</option>
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="3d">3 Days</option>
              <option value="7d">7 Days</option>
              <option value="custom">Custom (Premium)</option>
            </select>
            {duration === 'custom' && (
              <input
                type="datetime-local"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="input text-sm h-10"
                disabled={isSubmitting}
                min={customStartTime || new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>
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
