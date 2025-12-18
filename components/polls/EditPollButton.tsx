'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import EditPollModal from './EditPollModal';

interface EditPollButtonProps {
  pollId: string;
  isCreator: boolean;
  questionText: string;
  onEditSuccess?: () => void;
}

export function EditPollButton({ pollId, isCreator, questionText, onEditSuccess }: EditPollButtonProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isCreator) {
    return null;
  }

  const handleEditSuccess = (newQuestion: string) => {
    if (onEditSuccess) {
      onEditSuccess();
    }
    setIsEditModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-blue-500/85"
        style={{ color: '#ffffff' }}
        title="Edit this poll"
        aria-label="Edit poll"
      >
        <Pencil size={16} />
      </button>

      <EditPollModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        pollId={pollId}
        currentQuestion={questionText}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}