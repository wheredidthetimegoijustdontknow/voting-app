// Phase 8: Profile Edit Modal
// Allows users to edit their bio, aura color, and spirit emoji

'use client';

import { useState } from 'react';
import { X, Palette, Smile, FileText, Save, RotateCcw } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { useToast } from '@/components/ui/ToastContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    username: string;
    bio: string | null;
    aura_color: string;
    spirit_emoji: string;
  };
  onSave: (updatedProfile: any) => void;
}

const PRESET_COLORS = [
  '#8A2BE2', // Purple
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE'  // Light Purple
];

const PRESET_EMOJIS = [
  '👤', '🧑', '👩', '👨', '👦', '👧', '👱', '🧔', '👵', '👴',
  '😀', '😃', '😄', '😁', '😊', '🙂', '🤗', '😎', '🤓', '🥳',
  '🦄', '🐱', '🐶', '🐼', '🦊', '🐨', '🐯', '🦁', '🐮', '🐷',
  '🌟', '💎', '🔥', '⚡', '🌈', '🎯', '🎨', '🎭', '🎪', '🎵'
];

export function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const [bio, setBio] = useState(profile.bio || '');
  const [auraColor, setAuraColor] = useState(profile.aura_color);
  const [spiritEmoji, setSpiritEmoji] = useState(profile.spirit_emoji);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const result = await updateProfile(profile.id, {
        bio: bio.trim() || null,
        aura_color: auraColor,
        spirit_emoji: spiritEmoji
      });

      if (result.success) {
        toast('Profile updated successfully!', { type: 'success' });
        onSave({
          ...profile,
          bio: bio.trim() || null,
          aura_color: auraColor,
          spirit_emoji: spiritEmoji
        });
        onClose();
      } else {
        toast(result.error || 'Failed to update profile', { type: 'error' });
      }
    } catch (error) {
      toast('An unexpected error occurred', { type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setBio(profile.bio || '');
    setAuraColor(profile.aura_color);
    setSpiritEmoji(profile.spirit_emoji);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Bio Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Bio
              </label>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-zinc-500 text-right">
              {bio.length}/500 characters
            </div>
          </div>

          {/* Aura Color Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Aura Color
              </label>
            </div>
            
            {/* Preset Colors */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAuraColor(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    auraColor === color 
                      ? 'border-zinc-900 dark:border-zinc-100 scale-110' 
                      : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={auraColor}
                onChange={(e) => setAuraColor(e.target.value)}
                className="w-12 h-12 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer"
              />
              <input
                type="text"
                value={auraColor}
                onChange={(e) => setAuraColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                placeholder="#8A2BE2"
              />
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{spiritEmoji}</span>
                <span 
                  className="text-lg font-semibold"
                  style={{ color: auraColor }}
                >
                  @{profile.username}
                </span>
              </div>
            </div>
          </div>

          {/* Spirit Emoji Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile size={20} className="text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Spirit Emoji
              </label>
            </div>
            
            {/* Preset Emojis */}
            <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSpiritEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                    spiritEmoji === emoji 
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-700' 
                      : 'border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom Emoji Input */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={spiritEmoji}
                onChange={(e) => setSpiritEmoji(e.target.value)}
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-center text-2xl"
                placeholder="Choose an emoji..."
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={handleReset}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}