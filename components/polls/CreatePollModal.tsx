import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import CreatePollForm from './CreatePollForm';

interface CreatePollModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePollModal({ isOpen, onClose }: CreatePollModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsMounted(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isMounted) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 modal-backdrop"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-lg glassmorphism rounded-3xl shadow-2xl overflow-hidden modal-content-popup ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            Create New Poll
                        </h2>
                        <p className="text-xs font-medium opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                            Fill in the details to start your poll
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-90"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Wrapper */}
                <div className="p-8 overflow-y-auto max-h-[80vh]">
                    <CreatePollForm onSuccess={onClose} />
                </div>
            </div>
        </div>
    );
}
