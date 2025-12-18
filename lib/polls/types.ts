// Raw database row types
export type Poll = {
  id: string;
  created_at: string;
  user_id: string;
  question_text: string;
  color_theme_id: number;
};

export type Vote = {
  id: string;
  created_at: string;
  user_id: string;
  poll_id: string;
  choice: string;
};

// Frontend-friendly types (combine DB data with computed values)
export type PollWithResults = Poll & {
  creator_email: string;
  total_votes: number;
  results: VoteResult[];
  user_has_voted: boolean;
  user_vote_choice?: string;
};

export type VoteResult = {
  choice: string;
  count: number;
  percentage: number;
};

// API request/response types
export type CreatePollRequest = {
  question_text: string;
  choices: string[]; // e.g., ["Yes", "No"]
};

export type CreatePollResponse = {
  success: boolean;
  poll_id?: string;
  error?: string;
};

export type VoteRequest = {
  poll_id: string;
  choice: string;
};

export type VoteResponse = {
  success: boolean;
  error?: string;
};