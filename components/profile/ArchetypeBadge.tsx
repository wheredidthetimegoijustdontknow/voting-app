// Phase 8: ArchetypeBadge Component
// Displays user's voting archetype with aura color styling

import React from 'react';
import type { ArchetypeTitle } from '@/types';

interface ArchetypeBadgeProps {
  title: ArchetypeTitle;
  auraColor: string;
  className?: string;
}

export const ArchetypeBadge: React.FC<ArchetypeBadgeProps> = ({
  title,
  auraColor,
  className = ""
}) => {
  return (
    <div 
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${className}`}
      style={{ 
        border: `1px solid ${auraColor}`, 
        color: auraColor,
        backgroundColor: `${auraColor}10` // 10% opacity background
      }}
    >
      <span className="mr-1">🏆</span>
      {title}
    </div>
  );
};

export default ArchetypeBadge;