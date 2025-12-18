# Phase 6 Retrospective: Bugs, Solutions & Lessons Learned

## Overview
This document outlines the critical technical challenges encountered during the Phase 6 UI refactor. It serves as a knowledge base for future development, specifically regarding Next.js Server Actions, Supabase RLS, and complex CSS/React rendering issues.

## 1. The "Undeletable" Poll (Backend)
**Issue:** Users could not delete their polls despite being the creator. The action would fail silently or return a generic error.

**Root Cause:**
1.  **Missing RLS Policy:** The `polls` table had no `DELETE` policy defined in Supabase. Even valid SQL queries from the client were rejected by the database.
2.  **Foreign Key Constraints:** The `polls` table is referenced by `votes` and `polls_choices`. Attempting to delete a poll without first removing its dependencies caused a database constraint violation.
3.  **RLS Cascading Block:** Even if we tried to delete dependencies first, standard RLS policies prevented a user from deleting *other people's* votes on their poll.

**Solution: The Admin Client Pattern**
- We created a dedicated `lib/supabase/admin.ts` using the `SUPABASE_SERVICE_ROLE_KEY`.
- **Why:** This client bypasses RLS entirely.
- **Workflow:**
    1.  User triggers `deletePoll`.
    2.  Server Action verifies ownership using the *standard* client (secure).
    3.  Once verified, the Action switches to the *Admin* client to perform the cleanup (delete votes -> delete choices -> delete poll).

**Lesson:**
> *Never rely on client-side RLS for cascading deletions of multi-user data. Always use a verified Server Action with Admin privileges to clean up shared resources.*

---

## 2. The Flickering Modal (Frontend)
**Issue:** The `DeletePollModal` would flicker rapidly or disappear when the user moved their mouse near the edges or outside the box.

**Root Cause: CSS Stacking Contexts**
- The modal component was rendered *inside* the `PollCard` component in the DOM tree.
- `PollCard` has `overflow: hidden`, `transform`, and complex `hover` effects.
- These properties create a new **Stacking Context**. Even with `position: fixed; z-index: 9999`, the modal was effectively trapped "inside" the card's rendering layer. Browsers struggle to render a fixed element escaping a transformed parent, leading to z-index fighting and flickering on hover updates.

**Solution: React Portals**
- We refactored the modal to use `createPortal(jsx, document.body)`.
- **Why:** This physically moves the modal's DOM nodes to the bottom of the `<body>` tag, completely outside the `PollCard` hierarchy.
- **Result:** The modal now exists in the global stacking context, unaffected by the parent card's styles or overflow rules.

**Lesson:**
> *Always use React Portals for Modals, Tooltips, and Dropdowns. Never try to fight CSS stacking contexts with z-index alone.*

---

## 3. The "Ghost" Poll (Real-time Sync)
**Issue:** After successfully deleting a poll, it remained visible in the UI until the user manually refreshed the page.

**Root Cause:**
- Our `useRealtimeVotes` hook was listening for `INSERT` (new votes) and `UPDATE` (edits), but ignored `DELETE` events on the `polls` table.
- The local state (`polls` array) was not being synchronized with the deletion event.

**Solution: Explicit Delete Listener**
- We added a specific `.on('postgres_changes', { event: 'DELETE', table: 'polls' })` listener.
- When an event fires, the hook filters the local state array: `setPolls(prev => prev.filter(p => p.id !== deletedId))`.

**Lesson:**
> *Real-time UIs imply full CRUD synchronization. If you sync creation, you must sync deletion.*

---

## Future Considerations
- **Optimistic UI:** For deletion, we waited for the server to confirm before removing the item from the UI. In the future, we could remove it instantly (Optimistic Update) and revert if the server request fails, making the app feel even faster.
- **Archives vs Deletion:** As the app grows, "hard deleting" data (removing rows) might be destructive for analytics. Phase 8 (User Analytics) might require us to switch to "soft deletes" (adding a `deleted_at` timestamp) instead of removing rows.

