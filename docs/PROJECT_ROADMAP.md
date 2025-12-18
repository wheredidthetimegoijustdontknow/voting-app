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

## Phase 5: UI Refinement & Control (✅ Completed)

- [x] **Admin Overlay**: Create a compact control panel for `page.tsx` to manage bots without switching pages.
- [x] **Performance & Caching**: Advanced strategies for high-frequency voting rounds.
- [x] **Interactive Toasts**: New vote feedback with "Glow" effects and compact summaries.
- [x] **Update PROJECT_ROADMAP.md**: Add new features to the roadmap.
- [x] **Commit & Push**: Commit and push changes to the repository.

## Phase 6: App Facelift & Layout Overhaul [COMPLETED]
- [x] **Poll Colorization**: Identity-Based color system implemented (1-5 theme families).
- [x] **Sidebar Navigation**: Relocated top menu to a persistent left-side sidebar.
- [x] **Collapsible Activity Feed**: Transformed activity log into a collapsible right pane.
- [x] **Floating Admin HUD**: Relocated Admin controls to a floating center-bottom position.
- [x] **Update PROJECT_ROADMAP.md**: Track progress on these UI changes.

## Phase 7: Advanced Poll System (✅ Completed)
- [x] **Poll Colors**: Allow users to change the color of their polls.
- [x] **Collapsible Polls**: Compact summary bars for poll cards.
- [x] **Advanced Status Logic**: Implement `DRAFT`, `SCHEDULED`, `ACTIVE`, `ENDED`, `REVIEW`, and `REMOVED` states.
- [x] **Dynamic UI Badges**: `[New!]`, `[Dormant]`, `[Ending Soon]`, and `[Verified]` indicators.
- [x] **Tiered Timers**: Support for Free (presets) and Premium (custom datetime) timers.
- [x] **Soft Delete & Recovery**: Move polls to `REMOVED` state with a 7-day auto-delete grace period.
- [x] **Automated Transitions**: Cron/Edge functions for status updates (e.g., Scheduled -> Active).
- [x] **Inactivity Tracking**: `last_vote_at` tracking for `[Dormant]` badge logic.
- [x] **Admin Features**: Ability to flag polls for review and remove polls.

## Phase 8: User Improvements & Refinement
- [ ] **Stability**: Fix Emoji Icon persistence and re-render optimizations.
- [ ] **User Management**: Add user roles and permissions for different levels of access.
- [ ] **User Analytics**: Real-time engagement metrics and user behavior.
- [ ] **Admin Features**:     
    - [ ] **Poll Constraints**: Change dates/Time limits for polls.
    - [ ] **Poll Management**: Edit, delete, and manage polls.
    - [ ] **Customization**: Allow admins to change poll colors/emojis/avatars for any poll.

## Phase 9: User Analytics and Poll Analytics
- [ ] **User Analytics**: Real-time engagement metrics and user behavior.
- [ ] **Poll Analytics**: Real-time engagement metrics and poll behavior.
- [ ] **Results Visualization**: Integrate Recharts/Chart.js for deep-dive analytics.

## Future: ???
- [ ] **Collapsible Analytics**: Compact summary bars for poll cards.
- [ ] **Notifications**: Real-time notifications for new polls, votes, and activity. Users will receive youtube-like notifications for new polls, votes, and activity. They can subscribe to specific polls to receive notifications for new votes and activity, or receive notifications for all polls, including when new ones are posted and activity on the posts that they created.
- [ ] **Replay Feature**: Users can replay polls to see how people voted over time.
- [ ] **Premium feature**: Users can set their own color scheme for polls they create. (Can be a premium feature in the future)
- [ ] **Premium feature**: Users can set their own avatar/emoji for polls they create. (Can be a premium feature in the future)
- [ ] **Social Features**: Comments and social sharing links.
- [ ] **Glassmorphism Redux**: Revisit premium frosted-glass UI for modals once advanced CSS/stacking fixes are planned.