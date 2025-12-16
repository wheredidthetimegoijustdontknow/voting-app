import { Vote, VoteResult } from './types';

/**
 * Aggregate votes by choice and calculate percentages
 * 
 * ⚠️ BEGINNER MISTAKE: Not handling the zero-vote case
 * If a poll has 0 votes, division by zero causes NaN percentages.
 * This function safely returns 0% for all choices when total is 0.
 */
export function aggregateVotes(votes: Vote[]): VoteResult[] {
  // Count votes by choice
  const voteCounts: Record<string, number> = {};

  votes.forEach(vote => {
    voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
  });

  const totalVotes = votes.length;

  // Convert to VoteResult array with percentages
  return Object.entries(voteCounts)
    .map(([choice, count]) => ({
      choice,
      count,
      percentage: totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100),
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Format a date for display (e.g., "Jan 15, 2:30 PM")
 */
export function formatPollDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get a shortened email display (e.g., "user@example.com" → "user@...")
 */
export function shortenEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local}@${domain?.split('.')[0]}...`;
}

/**
 * Calculate the width percentage for a vote bar
 * (Useful for rendering progress bars in UI)
 */
export function getBarWidth(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}