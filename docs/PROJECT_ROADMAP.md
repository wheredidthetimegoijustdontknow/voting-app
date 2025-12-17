# Voting App Project Roadmap

## Phase 1: Foundation & Core Logic (✅ Completed)

- [x] **Project Setup**: Initialize Next.js 16 with TypeScript and Tailwind CSS.  
- [x] **Database Architecture**: Design Supabase schema for `profiles`, `polls`, `polls_choices`, and `votes`.  
- [x] **Authentication**: Integrate Supabase Auth for user management.  
- [x] **Security**: Implement Row Level Security (RLS) policies for all tables.  
- [x] **Basic UI Layout**: Create responsive app shell and navigation.

## Phase 2: Core Features (✅ Completed)

- [x] **Create Poll**:  
      - [x] Implement database mutations.  
      - [x] Refactor to use **Server Actions** (`createPoll`).  
      - [x] Input validation with Zod.  
- [x] **Voting Mechanism**:  
      - [x] Implement voting logic.  
      - [x] Refactor to **Server Actions** (`submitVote`).  
      - [x] Ensure only one vote per user per poll.  
- [x] **Poll Management**:  
      - [x] **Edit Poll**: Allow creators to update questions (Server Action `updatePoll`).  
      - [x] **Delete Poll**: Allow creators to remove polls (Server Action `deletePoll`).

## Phase 3: Realtime & UX Polish (✅ Completed)

- [x] **Realtime Updates**:  
      - [x] Live vote counts using Supabase Realtime.  
      - [x] Live poll question updates.  
      - [x] State synchronization fixes (hooks).  
- [x] **Presence**: Show "Online Users" count.  
- [x] **UX Enhancements**:  
      - [x] Modal for editing polls.  
      - [x] Flicker-free interactions.  
      - [x] Immediate UI updates (`router.refresh`).  
      - [x] Scroll locking for modals.  
- [x] **Theme**: Dark Mode implementation.  
- [x] **Codebase**: Refactoring and cleanup (removed legacy API routes).

## Phase 4: Dashboard & Live Activity (✅ Completed)

- [x] **Global Sidebar**: Implemented a real-time `ActivityFeed` for all users.
- [x] **Bot Simulation (God Mode)**: 
    - [x] Created `bot-manager.ts` using **Service Role Key** for direct DB access.
    - [x] Humanized bot behavior with randomized delays and shuffling.
- [x] **Dashboard Stats**: 
    - [x] Real-time aggregation of Total Polls, Votes, and Engagement.
    - [x] Fixed hardcoded mock data with dynamic calculations.
- [x] **Consistency**: Moved Header and Status to global `AppLayout`.
- [x] **Project Overview**: Consolidated architecture, data flow, and God Mode details into `PROJECT_OVERVIEW.md`.

## Phase 5: UI Refinement & Control (🚧 Next Up)

- [ ] **Admin Overlay**: Create a compact control panel for `page.tsx` to manage bots without switching pages.
- [ ] **Performance & Caching**: Advanced strategies for high-frequency voting rounds.
- [ ] **Interactive Toasts**: New vote feedback with "Glow" effects and compact summaries.
- [ ] **Results Visualization**: Integrate Recharts/Chart.js for deep-dive analytics.

## Phase 6: Advanced Features (Future)

- [ ] **Poll Constraints**: End dates/Time limits for polls.
- [ ] **Social Features**: Comments and social sharing links.
- [ ] **Collapsible Analytics**: Compact summary bars for poll cards.