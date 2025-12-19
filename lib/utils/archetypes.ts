// Phase 8: Archetype Calculation Engine
// Determines user "Voter Archetype" by analyzing voting history

import type { ArchetypeTitle, ArchetypeStats } from '@/types';

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

/**
 * Calculate archetype stats from user's voting history
 * This would typically query the database for the last 50 votes
 */
export const calculateArchetypeStats = async (
  userId: string, 
  supabase: any
): Promise<ArchetypeStats> => {
  // Get user's last 50 votes with poll information
  const { data: votes, error } = await supabase
    .from('votes')
    .select(`
      id,
      created_at,
      choice,
      poll_id,
      polls (
        id,
        created_at,
        color_theme_id,
        status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !votes) {
    console.error('Error fetching user votes for archetype calculation:', error);
    return {
      averageVoteDelayMinutes: 0,
      minorityVotePercentage: 0,
      topCategoryPercentage: 0,
      mostActiveHour: 12
    };
  }

  if (votes.length === 0) {
    return {
      averageVoteDelayMinutes: 0,
      minorityVotePercentage: 0,
      topCategoryPercentage: 0,
      mostActiveHour: 12
    };
  }

  // Calculate average vote delay from poll creation
  let totalDelayMinutes = 0;
  let validDelays = 0;
  const hourlyActivity = new Array(24).fill(0);
  const categoryVotes: Record<number, number> = {};
  let minorityVotes = 0;
  let totalVotes = votes.length;

  for (const vote of votes) {
    // Calculate delay from poll creation
    const pollCreated = new Date(vote.polls.created_at);
    const voteCast = new Date(vote.created_at);
    const delayMinutes = (voteCast.getTime() - pollCreated.getTime()) / (1000 * 60);
    
    if (delayMinutes >= 0) { // Only count votes after poll creation
      totalDelayMinutes += delayMinutes;
      validDelays++;
    }

    // Track hourly activity
    const hour = voteCast.getHours();
    hourlyActivity[hour]++;

    // Track category preferences
    const categoryId = vote.polls.color_theme_id || 1;
    categoryVotes[categoryId] = (categoryVotes[categoryId] || 0) + 1;
  }

  const averageVoteDelayMinutes = validDelays > 0 ? totalDelayMinutes / validDelays : 0;

  // Calculate most active hour
  const mostActiveHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

  // Calculate top category percentage
  const maxCategoryVotes = Math.max(...Object.values(categoryVotes));
  const topCategoryPercentage = totalVotes > 0 ? (maxCategoryVotes / totalVotes) * 100 : 0;

  // For minority vote percentage, we would need to analyze poll results
  // This is a simplified calculation - in reality, we'd need to fetch poll results
  // For now, we'll use a placeholder that could be calculated based on actual poll data
  const minorityVotePercentage = 25; // Placeholder - would need poll results analysis

  return {
    averageVoteDelayMinutes,
    minorityVotePercentage,
    topCategoryPercentage,
    mostActiveHour
  };
};

/**
 * Get user's archetype by calculating from their voting history
 */
export const getUserArchetype = async (
  userId: string, 
  supabase: any
): Promise<ArchetypeTitle | null> => {
  try {
    const stats = await calculateArchetypeStats(userId, supabase);
    return calculateArchetype(stats);
  } catch (error) {
    console.error('Error calculating user archetype:', error);
    return null;
  }
};