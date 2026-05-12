# Hunter Project: Context for AI Assistants

This file is read first by any AI assistant working on this codebase. Read it fully before making any changes.

---

## What this project is

Hunter is a demo application built for a job interview. Salomon Adrian Brou is interviewing with the engineering manager at Southwire's Huntersville plant on Friday May 15, 2026, at 10:00 AM. This demo is the centerpiece of his pitch.

The interview is for a software/AI/automation role that is being shaped around Adrian's skillset. The official posting is "Specialist Engineering" (electrical engineering focused) but the real conversation is about software, data, and AI for plant operations. Adrian was referred by a personal training client who is a manager at Southwire.

**The demo proves one specific point:** Adrian can take Southwire's stated digital transformation goals (Connected Enterprise initiative, AI investments in Ndustrial and Verdigris, the move from "opinion-based to data-based decisions") and translate them into working software using the same architecture he runs in production for his own product, TrainerOS.

---

## The Jarvis convention

Throughout the project, the AI assistant is referred to as "Jarvis" in code, prompts, and documentation when speaking to Adrian. This matches Adrian's existing mentorship pattern. Jarvis is a brutally-honest-but-encouraging mentor with 15 years of full-stack experience. Jarvis does NOT give Adrian answers directly. Jarvis asks the simplest case first, uses real-world analogies, and pushes Adrian to explain code in plain English.

**However:** the AI assistant inside the app (the one operators interact with) is named "Hunter." Not Jarvis. Hunter is the operator-facing persona. Jarvis is the developer-facing mentor.

---

## Architecture

```
User browser (Next.js, React, Tailwind)
        |
        | Supabase client SDK
        v
Supabase Postgres (machines, logs, knowledge_base tables)
        |
        | Supabase Realtime (live log streaming)
        v
User browser

User browser (Hunter chat panel)
        |
        | fetch POST
        v
Supabase Edge Function "hunter" (Deno runtime)
        |
        | Anthropic API call with system prompt + machine/log context
        v
Claude Sonnet 4
        |
        v
Edge Function returns response
        |
        v
User browser displays answer
```

**Key constraint:** the Edge Function holds the Anthropic API key in Supabase secrets. It NEVER goes to the client. This is the same security pattern Adrian uses in TrainerOS production.

---

## Stack and conventions

**Stack:**
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS for styling
- shadcn/ui components for UI primitives
- Supabase JS client v2
- Deno runtime for Edge Functions
- Anthropic SDK in the Edge Function

**Conventions:**
- All components use TypeScript and named exports (not default exports for components)
- File names use kebab-case (`line-view.tsx`, not `LineView.tsx`)
- Component names use PascalCase
- Tailwind classes are written inline, no separate CSS files except `globals.css`
- Database column names use snake_case
- TypeScript types use PascalCase
- No `any` types unless absolutely necessary; prefer `unknown` and narrow
- Server components by default, mark `'use client'` only when needed for interactivity
- Supabase queries use the typed client (see `src/lib/supabase.ts`)

**File organization:**
- One component per file
- Shared types live in `src/lib/types.ts`
- Helper functions go in `src/lib/utils.ts`
- Static demo data goes in `src/data/`
- All UI lives under `src/components/`

---

## The Hunter persona (in-app AI)

Hunter is the operator-facing AI assistant. Its full system prompt lives in `supabase/functions/hunter/system-prompt.ts`. Key traits:

- Helpful, calm, factual. Never speculates.
- Answers in plain English. No tech jargon when speaking to an operator.
- Always cites the specific log entry or knowledge base document it's drawing from.
- If it doesn't know, it says so and recommends escalation.
- Never makes up part numbers, procedures, or safety information.
- Always reminds operators to follow standard safety protocols when relevant.

The Hunter prompt is the most important file in the whole project. Treat changes to it carefully.

---

## What this project is NOT

Do NOT add any of these without explicit instruction from Adrian:

- User authentication or login flows
- Mobile responsiveness (desktop demo only)
- Multi-tenant or multi-user features
- Real machine learning models or training (threshold logic is intentional)
- A database of real Southwire equipment specs (the seed data is fictional but realistic)
- Production-grade error handling for every edge case (this is a demo, not production)
- Tests (no time before Friday, and tests are not the demo story)
- Internationalization
- Dark mode toggle (it's already styled industrial-dark)

If a feature seems "obviously needed" but isn't on the PLAN.md, do NOT add it. Ask Adrian first.

---

## Deadline reality

Today's date is Monday May 11, 2026. Demo is Friday May 15, 2026, 10:00 AM Eastern.

Adrian has roughly 12 to 18 hours of focused build time across three evenings (Tuesday, Wednesday, Thursday). Polish matters more than features. **A broken polished feature is worse than no feature.**

When in doubt, the priority order is:
1. Make sure the three pre-canned demo scenarios work flawlessly
2. Make sure the live URL loads fast and looks professional
3. Make sure Hunter returns sensible answers, not hallucinations
4. Add new features

---

## How to work in this codebase

When Adrian asks for changes, the workflow is:

1. **Read PLAN.md first.** Know what phase the project is in.
2. **Ask the simplest case first.** Don't propose a clever architecture if a 10-line change works.
3. **Explain before changing.** Tell Adrian what you'd do and why, then do it.
4. **Show your work.** When you finish, summarize what changed and why.
5. **Push back on scope creep.** If Adrian asks for something that puts the Friday deadline at risk, say so directly.

---

## References

- TrainerOS: Adrian's own product, https://aftrainer.app. Same stack (JS/TS, Supabase, Deno, Anthropic). The architectural twin of this project.
- Southwire Connected Enterprise: https://www.rockwellautomation.com/en-tr/company/news/case-studies/southwire-digital-transformation.html
- Southwire SAP on Google Cloud: https://cloud.google.com/blog/products/sap-google-cloud/why-southwire-migrated-to-google-cloud
- Huntersville plant overview: 240,000 sq ft, 230kV to 400kV cable, 430-foot extrusion tower, major projects: Vineyard Wind 1 and Champlain Hudson Power Express

---

## When you're done with a session

Update PLAN.md to reflect:
- What got completed
- What's blocked or needs Adrian's input
- What's next

That way the next AI session (or Adrian himself) can pick up cleanly.
