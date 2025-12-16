// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // or 'node' if you only test Server Actions
    globals: true,
    // Setup the path alias for Next.js projects
    alias: {
      '@/lib/supabase/server': './__mocks__/supabase-server.ts', // Mock path
      '@/app/actions/vote': './app/actions/vote', // Alias for the real code
    },
  },
});