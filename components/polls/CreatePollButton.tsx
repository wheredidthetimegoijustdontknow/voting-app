'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreatePollModal from './CreatePollModal';

export default function CreatePollButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] overflow-hidden"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-accent) 100%)',
                }}
            >
                {/* Shine effect on hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                <div className="relative flex items-center gap-2">
                    <div className="bg-white/20 p-1 rounded-lg transition-transform group-hover:rotate-90">
                        <Plus size={18} />
                    </div>
                    <span>Create New Poll</span>
                </div>
            </button>

            <CreatePollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
