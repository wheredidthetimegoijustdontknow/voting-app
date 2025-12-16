// __mocks__/supabase-server.ts
// This file mocks your Supabase client setup for testing
import { vi } from 'vitest';

export const createServerSupabaseClient = vi.fn().mockResolvedValue({
  auth: { 
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } } 
    }) 
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
});