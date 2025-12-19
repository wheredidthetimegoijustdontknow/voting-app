/**
 * Comprehensive list of reserved usernames to prevent confusion and impersonation
 * This includes admin roles, system names, and potentially confusing variations
 */
export const RESERVED_USERNAMES = [
  // Admin and Moderation Roles
  'admin', 'administrator', 'owner', 'founder', 'ceo', 'cto', 'coo',
  'moderator', 'mod', 'helper', 'support', 'staff', 'team',
  
  // System and Service Accounts
  'system', 'service', 'api', 'bot', 'webhook', 'automation',
  'noreply', 'no-reply', 'donotreply', 'notifications',
  
  // Security and Legal
  'security', 'privacy', 'legal', 'terms', 'dmca', 'abuse',
  
  // Common System Names
  'root', 'admin', 'administrator', 'user', 'users', 'guest',
  'anonymous', 'anon', 'test', 'testing', 'demo', 'sample',
  
  // Social Platform Common Names
  'help', 'info', 'contact', 'about', 'support', 'feedback',
  'press', 'media', 'news', 'blog', 'careers', 'jobs',
  
  // Confusing Similar Names (case variations)
  'administrator', 'administrators', 'moderators', 'owners',
  'founder', 'founders', 'developers', 'dev', 'coder', 'coders',
  
  // Platform-Specific
  'profile', 'profiles', 'settings', 'account', 'accounts',
  'dashboard', 'panel', 'console', 'control', 'controls',
  
  // Time-based and Number-based that could be confusing
  'today', 'yesterday', 'tomorrow', 'now', 'later', 'soon',
  'active', 'online', 'offline', 'away', 'busy', 'available',
  
  // Action words that could be confused with commands
  'delete', 'remove', 'edit', 'update', 'create', 'new',
  'login', 'logout', 'signin', 'signup', 'register', 'signout',
  
  // Common prefixes/suffixes that might cause confusion
  'official', 'real', 'true', 'verified', 'certified', 'official',
  'main', 'primary', 'central', 'global', 'universal',
  
  // Platform and Technology names
  'supabase', 'nextjs', 'vercel', 'netlify', 'aws', 'google',
  'facebook', 'twitter', 'instagram', 'linkedin', 'github',
  
  // Database and Tech terms
  'database', 'db', 'sql', 'query', 'cache', 'session',
  'token', 'auth', 'oauth', 'jwt', 'api', 'rest', 'graphql',
  
  // File and Asset terms
  'image', 'images', 'photo', 'photos', 'video', 'videos',
  'file', 'files', 'document', 'documents', 'upload', 'download',
  
  // Payment and Commerce
  'payment', 'payments', 'billing', 'subscription', 'premium',
  'upgrade', 'downgrade', 'purchase', 'buy', 'sell', 'shop',
  
  // Analytics and Reporting
  'analytics', 'stats', 'statistics', 'reports', 'metrics',
  'dashboard', 'insights', 'analysis', 'data', 'chart', 'graphs'
];

/**
 * Check if a username is reserved (case-insensitive)
 */
export function isReservedUsername(username: string): boolean {
  const lowerUsername = username.toLowerCase();
  return RESERVED_USERNAMES.some(reserved => 
    reserved.toLowerCase() === lowerUsername
  );
}

/**
 * Get a list of reserved usernames for validation messages
 */
export function getReservedUsernames(): string[] {
  return [...RESERVED_USERNAMES];
}
