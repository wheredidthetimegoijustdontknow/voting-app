/**
 * Utility functions for consistent profile link generation
 * Ensures all profile URLs use lowercase for consistency while displaying original case
 */

/**
 * Generate a profile URL with normalized (lowercase) username
 * @param username - The username to create a profile link for
 * @returns The profile URL with lowercase username
 */
export function getProfileUrl(username: string): string {
  return `/profile/${username.toLowerCase()}`;
}

/**
 * Generate a profile link with normalized (lowercase) username
 * @param username - The username to create a profile link for
 * @param displayName - Optional display name (defaults to original username)
 * @returns Object with URL and display name
 */
export function getProfileLink(username: string, displayName?: string): { url: string; displayName: string } {
  return {
    url: getProfileUrl(username),
    displayName: displayName || username
  };
}

/**
 * Check if a username URL parameter should be normalized
 * @param username - The username from URL params
 * @returns Normalized username for consistent routing
 */
export function normalizeUsernameForUrl(username: string): string {
  return username.toLowerCase();
}