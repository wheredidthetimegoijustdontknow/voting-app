'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import DeletePollModal from './DeletePollModal';

interface DeletePollButtonProps {
    pollId: string;
    isCreator: boolean;
    onDeleteSuccess?: () => void;
}

export function DeletePollButton({ pollId, isCreator, onDeleteSuccess }: DeletePollButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!isCreator) {
        return null;
    }

    const handleDeleteSuccess = () => {
        if (onDeleteSuccess) {
            onDeleteSuccess();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-white hover:bg-red-500/85 active:scale-95 shadow-sm"
                title="Delete this poll"
                aria-label="Delete poll"
            >
                <Trash2 size={16} />
            </button>

            <DeletePollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pollId={pollId}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}
