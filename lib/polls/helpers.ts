import { Vote, VoteResult } from './types';

/**
 * Aggregate votes by choice and calculate percentages
 * 
 * ⚠️ BEGINNER MISTAKE: Not handling the zero-vote case
 * If a poll has 0 votes, division by zero causes NaN percentages.
 * This function safely returns 0% for all choices when total is 0.
 */
export function aggregateVotes(votes: Vote[], pollChoices: string[] = []): VoteResult[] {
  // Count votes by choice
  const voteCounts: Record<string, number> = {};

  votes.forEach(vote => {
    voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
  });

  const totalVotes = votes.length;

  // Create results for all choices (even ones with 0 votes)
  const results = pollChoices.map((choice) => ({
    choice,
    count: voteCounts[choice] || 0,
    percentage: totalVotes === 0 ? 0 : Math.round((voteCounts[choice] || 0) / totalVotes * 100),
  }));

  // Also add any choices that have votes but aren't in pollChoices
  Object.entries(voteCounts).forEach(([choice, count]) => {
    if (!results.find(r => r.choice === choice)) {
      results.push({
        choice,
        count,
        percentage: totalVotes === 0 ? 0 : Math.round(count / totalVotes * 100),
      });
    }
  });

  return results.sort((a, b) => b.count - a.count);
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
 * Calculate bar width for progress bars
 * Ensures minimum visible width for choices with votes
 */
export function getBarWidth(percentage: number): string {
  if (percentage === 0) return '0%';
  // Ensure at least 5% width for visibility
  return `${Math.max(percentage, 5)}%`;
}