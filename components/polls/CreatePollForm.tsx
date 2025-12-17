// app/components/polls/CreatePollForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPoll } from '@/app/actions/poll';

export default function CreatePollForm() {
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
    <div
      className="card"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border-default)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
        boxShadow: 'none',
        marginBottom: 'var(--spacing-xl)'
      }}
    >
      <h2
        className="text-heading-lg"
        style={{
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-lg)',
          marginTop: 0
        }}
      >
        Create New Poll
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label
            htmlFor="question"
            className="text-body"
            style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)'
            }}
          >
            Question
          </label>
          <input
            type="text"
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What would you like to ask?"
            className="input"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'var(--font-family-sans)',
              lineHeight: '1.5',
              transition: 'all 0.2s ease'
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Choices */}
        <div>
          <label
            className="text-body"
            style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)'
            }}
          >
            Choices
          </label>
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className="input"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-family-sans)',
                    lineHeight: '1.5',
                    transition: 'all 0.2s ease'
                  }}
                  disabled={isSubmitting}
                />
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      color: 'var(--color-error)',
                      border: '1px solid var(--color-error)',
                      borderRadius: '6px',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '500',
                      fontFamily: 'var(--font-family-sans)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'none',
                      transform: 'translateY(0)',
                    }}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.filter = 'brightness(0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
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
            style={{
              marginTop: 'var(--spacing-sm)',
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              fontFamily: 'var(--font-family-sans)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: 'none',
              transform: 'translateY(0)',
            }}
            disabled={isSubmitting}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            + Add Choice
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="badge badge-error"
            style={{
              backgroundColor: 'var(--color-error-bg)',
              borderColor: 'var(--color-error-border)',
              color: 'var(--color-error)',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              borderWidth: '1px',
              borderStyle: 'solid',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: isSubmitting ? 'var(--color-primary-hover)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: '1px solid var(--color-primary)',
            borderRadius: '6px',
            fontSize: 'var(--font-size-base)',
            fontWeight: '500',
            fontFamily: 'var(--font-family-sans)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'none',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.filter = 'brightness(0.95)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.filter = 'brightness(1)';
            }
          }}
        >
          {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}