# Hunter Build Plan

**Demo date:** Friday May 15, 2026 at 10:00 AM Eastern
**Today:** Tuesday May 12, 2026

---

## Phase 1: Scaffold (Monday night, complete)

Status: **COMPLETE**

- [x] Project folder structure
- [x] package.json with dependencies
- [x] TypeScript, Next.js, Tailwind configs
- [x] Supabase schema migration
- [x] Seed data (machines, logs, knowledge base)
- [x] Hunter system prompt
- [x] Edge Function skeleton
- [x] React component skeletons
- [x] README, CLAUDE.md, this PLAN.md
- [x] .env.example
- [x] .gitignore

**Phase 1 to Phase 2 setup, completed Monday night by Jarvis:**

- [x] GitHub repo `Adrianbrou/hunter-demo` created, scaffold pushed
- [x] `npm install` completed (430 packages, no fatal errors)
- [x] Fresh Supabase project `hunter-demo` created in the new free `hunter` org
  - Project ref: `uykwrvcryuxfokwhwmhg`
  - Region: us-west-2
  - URL: <https://uykwrvcryuxfokwhwmhg.supabase.co>
- [x] Schema migration applied (machines, logs, knowledge_base, recent_logs view, realtime enabled)
- [x] Seed data loaded: 3 machines, 25 logs, 10 KB docs (counts verified)
- [x] `.env.local` written with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] Hunter Edge Function deployed (version 1, ACTIVE, JWT verification on)
- [x] Model ID fix: `claude-sonnet-4-5` -> `claude-sonnet-4-6` in [supabase/functions/hunter/index.ts](supabase/functions/hunter/index.ts)
- [x] README rewritten to Adrian's standard (Motivation, Quick Start, Usage, Contributing sections)

**Still needs Adrian's hands before Phase 2 build:**

- [ ] Paste Anthropic API key from console.anthropic.com into `.env.local` (replace `sk-ant-your-key-here`)
- [ ] Set the same key as an Edge Function secret (Supabase dashboard -> Project Settings -> Edge Functions -> Secrets, add `ANTHROPIC_API_KEY=sk-ant-...`)
- [ ] Paste service role key from Supabase dashboard (Project Settings -> API -> service_role) into `.env.local` (replace `PASTE_SERVICE_ROLE_KEY_FROM_DASHBOARD`). Only needed for the simulate-logs script.
- [ ] Commit and push the README rewrite + model fix (not yet on GitHub, only the initial scaffold is)
- [ ] Run `npm run dev` and verify localhost:3000 shows the 3 machine cards and the 25 seeded logs. Hunter chat will return "unavailable" until the Anthropic secret is set.

---

## Phase 2: Dashboard Surface (Tuesday night, 4 to 6 hours)

Status: **NOT STARTED**

Build the production line view and log feed. No Hunter chat yet.

- [ ] Wire `src/lib/supabase.ts` to actually connect to your Supabase project
- [ ] In `line-view.tsx`: fetch machines from Supabase, render 3 cards with live status
- [ ] In `line-view.tsx`: implement Supabase Realtime subscription so machine updates appear live
- [ ] In `log-feed.tsx`: fetch most recent 50 log entries, render in scrolling feed
- [ ] In `log-feed.tsx`: subscribe to new log inserts, prepend them with animation
- [ ] In `log-feed.tsx`: highlight rows where `is_anomaly = true` with red border
- [ ] Build `scripts/simulate-logs.ts`: a Node script that inserts a new log every 3 seconds, occasionally flagged as anomaly
- [ ] Test: run `npm run dev` + `npm run simulate` and verify logs stream live
- [ ] Polish: clean typography, dark industrial theme, smooth animations
- [ ] Commit with message: "Phase 2: dashboard surface live"

**Definition of done for Phase 2:** Open the page, see 3 machines, see logs streaming in, see anomalies highlighted. No interaction yet beyond watching.

---

## Phase 3: Hunter Chat Surface (Wednesday night, 4 to 6 hours)

Status: **NOT STARTED**

Build the AI assistant panel.

- [ ] Build `hunter-chat.tsx` UI: message list, input box, send button
- [ ] Build the message types in `src/lib/types.ts` (user vs assistant, with citations)
- [ ] Wire the Edge Function call from `hunter-chat.tsx` to `/functions/v1/hunter`
- [ ] Edge Function: pull current machine state and last 20 logs from Supabase
- [ ] Edge Function: assemble context, call Anthropic API with `claude-opus-4-7` or `claude-sonnet-4-6`
- [ ] Edge Function: stream response back to client (or non-streaming if simpler)
- [ ] Render Hunter responses in the chat panel
- [ ] Build the three demo scenario buttons that pre-fill the chat input
- [ ] Test each scenario manually until answers are reliable
- [ ] Polish the chat UI (typing indicator, markdown rendering, code blocks)
- [ ] Commit: "Phase 3: Hunter chat live"

**Definition of done for Phase 3:** Type a question, get a grounded Claude response that cites a specific log or knowledge base article. All three demo scenarios work flawlessly.

---

## Phase 4: Polish and Deploy (Thursday, 3 to 4 hours)

Status: **NOT STARTED**

- [ ] Visual polish pass: spacing, typography, colors, Southwire blue accent (#1F4E79)
- [ ] Add Southwire-inspired hero header (without using their logo)
- [ ] Loading states everywhere (skeleton screens, not spinners)
- [ ] Error states (what happens if Edge Function fails)
- [ ] Empty states (what if no logs yet)
- [ ] Test on Chrome, Firefox, Safari at 1920x1080 (the size you'll demo at)
- [ ] Deploy to Vercel
- [ ] Set production environment variables in Vercel dashboard
- [ ] Run all three demo scenarios on the live URL
- [ ] Test the live URL from a different browser/incognito to verify it works for the interviewer
- [ ] Update README with the live URL
- [ ] Commit: "Phase 4: production ready"
- [ ] Sleep early Thursday night

**Definition of done for Phase 4:** Live URL works, all three demo scenarios are reliable, page looks polished on first impression.

---

## Phase 5: Friday Smoke Test (Friday morning, 30 minutes)

Status: **NOT STARTED**

**DO NOT MODIFY CODE FRIDAY.**

- [ ] 8:30 AM: open the live URL in Chrome
- [ ] Run all three demo scenarios end-to-end
- [ ] Type one off-script question to make sure Hunter doesn't crash
- [ ] Test screen sharing in a fake Teams call with yourself
- [ ] Have the URL pasted in a notepad ready to paste into chat during the call
- [ ] Close everything except: live URL, Doc 2 (interview script), notepad
- [ ] 9:55 AM: join the Teams call

---

## If something goes wrong

**If Hunter is unreliable on the call:** stick to the three pre-canned demo scenarios. Don't type anything off-script.

**If the live URL is down:** have a backup. Take a 30-second screen recording of each demo scenario working, and have the videos on your desktop. If live fails, say "let me show you the recording" and keep moving.

**If the call ends before you can demo:** send the live URL in the thank you email with a one-line note: "Here is the demo I built for our conversation. Try Demo Scenario 1 first."

---

## Stretch goals (only if Phases 2 to 4 finish early)

These are nice-to-haves. Do not start them unless the core demo is done and polished.

- [ ] A "What changed in the last 10 minutes?" summary that Hunter can answer
- [ ] A predicted maintenance window for one of the machines (showing the predictive maintenance angle)
- [ ] Voice input for Hunter chat (operators in noisy environments)
- [ ] A "Forward to maintenance team" button that fakes creating a ticket
