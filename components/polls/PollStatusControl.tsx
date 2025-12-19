// Phase 8: Poll Status Control
// Allows creators to manually transition polls between states

"use client";

import { useState } from 'react';
import { updatePoll } from '@/app/actions/poll';
import { useToast } from '@/components/ui/ToastContext';
import { Play, Pause, CheckCircle } from 'lucide-react';

interface PollStatusControlProps {
  pollId: string;
  currentStatus: string;
  isCreator: boolean;
  onStatusChange?: () => void;
}

export function PollStatusControl({ 
  pollId, 
  currentStatus, 
  isCreator, 
  onStatusChange 
}: PollStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Only show controls for creators
  if (!isCreator) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const res = await updatePoll(pollId, { status: newStatus });
      if (res.success) {
        toast(`Poll ${newStatus.toLowerCase()} successfully!`, { type: 'success' });
        if (onStatusChange) onStatusChange();
      } else {
        toast(res.error || 'Failed to update poll status', { type: 'error' });
      }
    } catch (error) {
      toast('An unexpected error occurred', { type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusAction = () => {
    switch (currentStatus) {
      case 'DRAFT':
      case 'PENDING':
        return {
          label: 'Activate Poll',
          icon: Play,
          action: () => handleStatusChange('ACTIVE'),
          color: 'bg-green-600 hover:bg-green-500',
          description: 'Make poll visible and allow voting'
        };
      case 'ACTIVE':
        return {
          label: 'End Poll',
          icon: Pause,
          action: () => handleStatusChange('ENDED'),
          color: 'bg-orange-600 hover:bg-orange-500',
          description: 'Stop voting and show final results'
        };
      case 'ENDED':
        return {
          label: 'Reopen Poll',
          icon: Play,
          action: () => handleStatusChange('ACTIVE'),
          color: 'bg-blue-600 hover:bg-blue-500',
          description: 'Allow voting to continue'
        };
      default:
        return null;
    }
  };

  const statusAction = getStatusAction();
  
  if (!statusAction) return null;

  const IconComponent = statusAction.icon;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={statusAction.action}
        disabled={isUpdating}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${statusAction.color}`}
        title={statusAction.description}
      >
        {isUpdating ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <IconComponent size={12} />
        )}
        {statusAction.label}
      </button>
      
      {/* Current Status Badge */}
      <span 
        className="px-2 py-1 text-xs font-medium rounded border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-default)',
          color: 'var(--color-text-muted)'
        }}
      >
        {currentStatus}
      </span>
    </div>
  );
}

export default PollStatusControl;