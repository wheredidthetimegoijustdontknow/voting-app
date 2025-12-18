# Phase 7 Retrospective: System Design & Synchronization

This phase was a significant leap from "feature building" to "system engineering." Here we analyze the challenges faced and the lessons learned for future development.

### 1. The "Ghost Update" Problem (State Synchronization)
**Incident**: Emojis were updating locally but disappearing on refresh or when other updates arrived.
**Lesson**: In a real-time system, your front-end state is a "projection" of your database. If your real-time listener (the projection logic) ignores a field (like `icon`), it will overwrite the local state with `null` or `undefined` the moment any other change happens.
**Beginner Tip**: Always ensure your real-time payloads and state update functions account for *every* piece of data you display. Missing one field leads to "ghosting" where data seems to vanish into thin air.

### 2. Authorization vs. Identity
**Incident**: Admins were unable to change emojis on polls they didn't personally create.
**Lesson**: Coding logic often defaults to "Ownership Check" (`user_id === creator_id`). However, a mature system needs "Role-Based Access Control" (RBAC). 
**Beginner Tip**: When writing security logic, ask: "Who is allowed to do this?" instead of "Is this the owner?". An Admin is a "super-owner" and needs to bypass standard ownership checks.

### 3. The "Ripple Effect" (Re-render Optimization)
**Incident**: Changing one emoji refreshed every single poll card on the page.
**Lesson**: React's default behavior is to re-render all children when a parent state changes. When `polls` array changes (even just one item), every `PollCard` re-renders unless explicitly told not to.
**Beginner Tip**: Use `React.memo` for components in long lists. This tells React: "Only re-render this specific card if *its* data changed, regardless of what's happening to the rest of the list."

### 4. Database Integrity & History
**Incident**: Multiple disparate SQL files were scattered across the root directory.
**Lesson**: Databases are living organisms. You cannot just "run a command" and forget it. You need a paper trail.
**Beginner Tip**: Use a `migrations` folder. It acts like a Git history for your database schema. If a teammate joins or you deploy to production, you need an ordered sequence of scripts to recreate the environment exactly.

### Final Thoughts
Phase 7 taught us that as systems grow, the complexity isn't just in *adding* lines of code, but in managing the *relationships* between data, users, and real-time events.
