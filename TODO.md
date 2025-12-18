# Project TODOs

## Phase 4: Dashboard & Live Activity (✅ COMPLETED)
- [x] **Dashboard Stats Not Updating**: Fixed with `revalidate = 0` and dynamic calculations.
- [x] **Presence Status Missing**: Bots now integrated into `OnlineUsersBanner`.
- [x] **Consistency Issues**: Global `AppLayout` implemented with Sidebar and Header.
- [x] **Live Activity Feed**: Real-time ticker implemented and humanized.

## Phase 5: UI Refinement & Control (✅ COMPLETED)
- [x] **Admin Control Overlay**: Create a compact "HUD" for `page.tsx` to manage bot simulation without switching pages.
- [x] **Glow Effects**: Visual feedback for real-time vote updates in the UI.
- [x] **Data Documentation**: Finalize the Architecture and Schema documentation.

## Phase 6: App Facelift & Layout Overhaul (✅ COMPLETED)
- [x] **Poll Colorization**: Identity-Based color system implemented.
- [x] **Sidebar Navigation**: Relocated top menu to side.
- [x] **Modal Refactor**: Converted Create/Delete flows to premium modals.
- [x] **Admin HUD**: Floating admin controls.
- [x] **Real-time Deletion**: Instant UI updates on poll removal.

## Phase 7: Advanced Poll System (✅ COMPLETED)
- [x] **Poll Colors**: Allow users to change the color of their polls.
- [x] **Collapsible Polls**: Compact summary bars for poll cards.
- [x] **Schema Migration**: Add `status`, `starts_at`, `ends_at`, `last_vote_at`, `is_premium_timer`, `deleted_at`.
- [x] **Status Transitions**: Implement logic for `SCHEDULED` -> `ACTIVE` -> `ENDED`.
- [x] **Dynamic Badges**: `PollCardBadge` with logic for `New!`, `Dormant`, `Ending Soon`.
- [x] **Countdown Timer**: Real-time client-side timer component.
- [x] **Soft Delete**: `REMOVED` status and restoration logic.
- [x] **Flagging System**: Admin `REVIEW` status and reason tracking.
- [x] **Automation**: Supabase cron for timed status updates.
- [x] **Admin Features**: Ability to flag polls for review and remove polls.

## Phase 8: User Improvements & Refinement
- [ ] **Bug Fix: Emoji Icon Persistence & Re-rendering**:
    - [ ] Fix `useRealtimeVotes` missing icon field.
    - [ ] Update `updatePoll` to allow admin overrides.
    - [ ] Optimize `PollCard` with `React.memo` to prevent global refreshes.
- [ ] **User Management**: Roles and permissions structure.
- [ ] **User Analytics**: Engagement metrics and behavior tracking.
- [ ] **Admin Features**:
    - [ ] Manage users (ban/promote).
    - [ ] Edit/Delete any poll.
    - [ ] Custom Poll colors/emojis/avatars.

## Phase 9: Analytics & Visualization
- [ ] **Poll Analytics**: Deep dive metrics per poll.
- [ ] **Results Visualization**: Recharts/Chart.js integration.
- [ ] **Collapsible Analytics**: Summary views.

## Future
- [ ] **Notifications**: Real-time alerts for votes/polls.
- [ ] **Replay Feature**: Time-travel view of voting trends.
- [ ] **Premium Features**: Custom branding for pro users.
- [ ] **Glassmorphism Redux**: Revisit premium frosted-glass UI for modals once advanced CSS/stacking fixes are planned.
- [ ] **Social Features**: Comments and sharing.
