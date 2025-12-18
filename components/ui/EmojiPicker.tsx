'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    isOpen: boolean;
    title?: string;
}

const COMMON_EMOJIS = [
    // Poll/Data
    '📊', '📈', '📉', '📋', '🗳️', '🎯', '💡', '🔥',
    // Faces
    '😊', '😂', '🤔', '😎', '🤩', '🥳', '😴', '🙄',
    // Objects
    '💻', '📱', '🎮', '🎧', '🎸', '🎨', '🎬', '📚',
    // Symbols
    '❤️', '✨', '⭐', '✅', '❌', '⚠️', '🚀', '🌈',
    // Nature/Food
    '🍕', '☕', '🍦', '🍔', '🍎', '🐱', '🐶', '🌍'
];

export default function EmojiPicker({ onSelect, onClose, isOpen, title = "Select an Icon" }: EmojiPickerProps) {
    const [search, setSearch] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-4 max-h-[300px] overflow-y-auto">
                    <div className="grid grid-cols-6 gap-2">
                        {COMMON_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onSelect(emoji);
                                    onClose();
                                }}
                                className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                        Choose your vibe
                    </p>
                </div>
            </div>
        </div>
    );
}
