# Whispr - Project Context for AI Agents

## What is Whispr?
Whispr is an anonymous messaging web app built with pure HTML, CSS, and JavaScript (no framework). Users get a personal link they share publicly. Anyone can send them anonymous messages through that link. The receiver can read, reply (anonymously), block senders, and manage their inbox.

## Live URL
https://abadi04.github.io/whispr

## Repository
https://github.com/Abadi04/whispr

## Tech Stack
- Frontend: Pure HTML + CSS + JavaScript (single page app with hash routing)
- Backend/Database: Supabase (PostgreSQL + Auth + Realtime)
- Hosting: GitHub Pages
- No build tools, no npm, no frameworks

## File Structure
- index.html - Main HTML file, loads Supabase CDN then app.js
- app.js - Entire app logic (routing, views, auth, API calls)
- style.css - All styles
- supabase/ - Supabase config folder

## Supabase Project
- URL: https://hhbhmhyqgszvgkaacbvm.supabase.co
- Auth: Email/Password (email confirmation is DISABLED)
- The Supabase JS library is loaded via CDN in index.html:
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
- Client initialized as: window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

## Database Tables (public schema)
- messages: id, sender_id, receiver_id, content, created_at, is_read
- profiles: id (references auth.users), email, full_name, avatar_url, created_at
- blocks: id, blocker_id, blocked_id, created_at (unique pair)

## Authentication
- Email + Password via Supabase Auth
- After login, user session is available via: window.supabaseClient.auth.getUser()
- Owner/admin check must use getUser() directly (NOT a cached variable) because of async timing issues

## Owner / Admin
- Project owner email: abadihdar@gmail.com
- Owner has access to the Analytics dashboard (/analytics route)
- Owner check pattern that works:
  const { data } = await window.supabaseClient.auth.getUser();
  const email = data?.user?.email || '';
  const isOwner = email === 'abadihdar@gmail.com';

## Routing
- Hash-based routing: window.location.hash = 'inbox' navigates to #inbox
- Main routes: home, login, register, inbox, profile, analytics
- Analytics route is protected: only accessible to owner email

## Features Implemented
1. Anonymous messaging (send/receive)
2. Personal shareable link per user
3. Inbox with unread indicators
4. Block / Unblock senders
5. Blocked users management screen
6. Onboarding flow for new users (3 screens, shown once)
7. Empty state with copy link CTA
8. Mobile-optimized UI (touch targets 44px+, swipe actions)
9. Dark/Light mode toggle
10. Smart scroll in chat (auto-scroll to latest, jump-to-latest button)
11. Message timestamps with day separators (Arabic format)
12. Incremental loading for older messages
13. Analytics dashboard (owner only):
    - Total users, active users (last 7 days)
    - Total messages (last 7 days)
    - Messages-per-day chart
    - Activation rate (users who sent at least 1 message)
14. Font size toggle in chat (saved in localStorage)

## Known Issues Fixed
- Supabase library was missing from index.html (now added via CDN)
- isOwner check was async timing issue (fixed by calling getUser() directly in route handler)
- Blank screen caused by syntax errors in App.jsx after bad prompts
- Block/analytics errors were crashing the whole app (now wrapped in try/catch)

## Important Notes for Next Agent
- NEVER use app.isOwner cached variable for analytics auth - always call getUser() fresh
- The app has NO build step - edit HTML/CSS/JS directly and push to GitHub Pages
- Supabase CDN script MUST be before app.js in index.html
- Email confirmation is OFF in Supabase - users can login immediately after signup
- Arabic UI - all user-facing text should be in Arabic
- Mobile-first design - always test on small screens
- Do not add npm/node/webpack - keep it pure HTML/JS/CSS

## Testing
- Lightweight, dependency-free tests live in `tests/` (no npm install).
- Run them with: `node --test` from the repo root.
- `tests/load-app.js` extracts pure helpers (escHtml, validateUsername, validateMessage) directly from app.js so tests exercise the real shipped code.
- See `SECURITY_REPORT.md` for the full security review and open recommendations.

## What to Work on Next
- Improve analytics charts (better visualization)
- Push notifications or email notifications for new messages
- Landing page (separate page explaining Whispr before login)
- Report / abuse system linked with block feature
- Profile customization (avatar, display name)
- Message reactions (simple emoji response)
