# Archetype Calculation Engine

This module determines a user's "Voter Archetype" by analyzing their data from the `votes` and `polls` tables.

## 1. Logic Implementation (`lib/utils/archetypes.ts`)

-- TS START --
export type ArchetypeTitle = 
  | "The Early Bird" 
  | "The Night Owl" 
  | "The Contrarian" 
  | "The Trendsetter" 
  | "The Specialist";

interface ArchetypeStats {
  averageVoteDelayMinutes: number;
  minorityVotePercentage: number;
  topCategoryPercentage: number;
  mostActiveHour: number;
}

export const calculateArchetype = (stats: ArchetypeStats): ArchetypeTitle => {
  // 1. Check for Early Bird (Votes within 10 mins of poll creation)
  if (stats.averageVoteDelayMinutes < 10) return "The Early Bird";

  // 2. Check for Contrarian (Votes for the least popular option > 40% of the time)
  if (stats.minorityVotePercentage > 40) return "The Contrarian";

  // 3. Check for Specialist (Votes in one color/category > 70% of the time)
  if (stats.topCategoryPercentage > 70) return "The Specialist";

  // 4. Check for Night Owl (Most activity between 12 AM and 5 AM)
  if (stats.mostActiveHour >= 0 && stats.mostActiveHour <= 5) return "The Night Owl";

  // Default Title
  return "The Trendsetter";
};
-- TS END --

## 2. Integration with Profiles Table
The calculation should be performed either:
1. **On-the-fly**: Calculated when the Profile page is loaded by fetching the user's last 50 votes.
2. **Scheduled**: An Edge Function that runs nightly and updates a `title` column in the `profiles` table for performance.

## 3. UI Display (`components/profile/ArchetypeBadge.tsx`)
Render this badge prominently next to the username using the user's `aura_color` for the border.

-- TS START --
export const ArchetypeBadge = ({ title, auraColor }: { title: string, auraColor: string }) => {
  return (
    <div 
      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{ border: `1px solid ${auraColor}`, color: auraColor }}
    >
      {title}
    </div>
  );
};
-- TS END --