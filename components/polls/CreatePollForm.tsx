'use client';

import { useState } from 'react';
import { CreatePollRequest, CreatePollResponse } from '@/lib/polls/types';

export default function CreatePollForm() {
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Validate form
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
      const request: CreatePollRequest = {
        question_text: questionText.trim(),
        choices: validChoices,
      };

      const response = await fetch('/api/polls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: CreatePollResponse = await response.json();

      if (result.success) {
        // Reset form
        setQuestionText('');
        setChoices(['', '']);
        // Refresh the page to show the new poll
        window.location.reload();
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
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold text-black mb-6">Create New Poll</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-black mb-2">
            Question
          </label>
          <input
            type="text"
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            disabled={isSubmitting}
          />
        </div>

        {/* Choices */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  disabled={isSubmitting}
                />
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
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
            className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
            disabled={isSubmitting}
          >
            + Add Choice
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}