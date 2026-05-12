# Hunter

**An AI-powered operator assistant for high-voltage cable manufacturing.**

Hunter is a demo application built for Southwire's Huntersville plant. It combines a live production dashboard with a Claude-powered AI assistant that operators can ask plain English questions about machine state, anomalies, and troubleshooting procedures.

Built by Salomon Adrian Brou for the Southwire engineering manager interview on May 15, 2026.

---

## What this demo proves

The Connected Enterprise initiative at Southwire is about getting plant data to the people who can act on it. Hunter shows one pattern for closing that loop:

1. **The dashboard surface** answers "what is happening on the line right now?"
2. **The Hunter chat surface** answers "what should I do about it?"

Same architecture as TrainerOS (aftrainer.app), applied to a plant floor.

---

## Stack

- **Next.js 14** (App Router, TypeScript) on Vercel
- **Supabase** (Postgres + Realtime for live updates)
- **Deno Edge Functions** (Hunter AI router)
- **Anthropic API** (Claude for the operator assistant)
- **Tailwind CSS + shadcn/ui** (styling)

---

## Setup (first time)

### 1. Prerequisites

You need:
- Node.js 18 or later
- A free Supabase account (https://supabase.com)
- An Anthropic API key (https://console.anthropic.com)
- A Vercel account (for deployment)

### 2. Create a fresh Supabase project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it `hunter-demo`. Pick any region near you. Set a strong DB password and save it somewhere.
4. Wait for the project to provision (about 2 minutes)

### 3. Copy environment variables

1. Copy `.env.example` to `.env.local`
2. From the Supabase dashboard, go to Project Settings to Data API
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (keep this private)
6. Get your Anthropic API key and put it in `ANTHROPIC_API_KEY`

### 4. Run the database schema

1. In the Supabase dashboard, go to SQL Editor
2. Open `supabase/migrations/0001_initial_schema.sql` from this repo
3. Paste it into the SQL Editor and run it
4. Open `supabase/seed.sql` and run that too
5. Verify: in Table Editor you should see `machines`, `logs`, and `knowledge_base` populated

### 5. Deploy the Edge Function

Once you have the Supabase CLI installed:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set ANTHROPIC_API_KEY=your_key_here
npx supabase functions deploy hunter
```

### 6. Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 7. Deploy to Vercel

```bash
npx vercel
```

Follow the prompts. Set the same environment variables in the Vercel dashboard.

---

## Project structure

```
hunter-demo/
├── README.md             (this file)
├── CLAUDE.md             (project context for AI assistants)
├── PLAN.md               (phase plan, current state)
├── JARVIS_NOTES.md       (architectural reasoning for interview)
├── supabase/
│   ├── migrations/       (database schema)
│   ├── seed.sql          (demo data)
│   └── functions/hunter/ (Deno Edge Function for AI)
├── src/
│   ├── app/              (Next.js routes)
│   ├── components/       (React components)
│   ├── lib/              (shared utilities, Supabase client, types)
│   └── data/             (demo scenarios, static content)
└── scripts/              (utility scripts like log simulator)
```

---

## What's done, what's next

See `PLAN.md` for the full phase breakdown.

**Current state:** Phase 1 scaffold complete. Architecture, schema, seed data, Hunter prompt, and component skeletons are in place. Ready for Phase 2 build (Tuesday).

---

## For the interview

When demoing on Friday, follow this script:

1. **Open the live URL** on screen share.
2. **Point at the line view:** "These are three extrusion lines at Huntersville. Line 3 is the 400 kilovolt line, the one fed by the famous 430-foot tower. Each line shows live status: temperature, line speed, conductor diameter."
3. **Point at the log feed:** "Down here, live log entries from each line. Anomalies highlighted in red. The detection is simple threshold logic now, but the architecture supports real ML models."
4. **Click Demo Scenario 1:** "Here is where it gets interesting. I'm simulating a speed anomaly on Line 3. Watch what happens."
5. **Anomaly fires, click into Hunter:** "An operator can now ask Hunter what's going on."
6. **Type or use canned question:** "Why is Line 3 slow?"
7. **Hunter answers, citing logs:** "Hunter has access to the current machine state, recent logs, and a seeded knowledge base of troubleshooting procedures. The answer is grounded, not hallucinated."
8. **Pivot to the pitch:** "This is one app, not two. The dashboard tells operators what's happening. Hunter helps them decide what to do. That loop is what Connected Enterprise is trying to build. I built this in three nights to show the pattern. With real plant data and real maintenance docs, this becomes useful, not just a demo."

---

## Credits

Concept and build: Salomon Adrian Brou ([adrianbrou.com](https://adrianbrou.com))
Built with help from Claude (Anthropic) under the Jarvis persona convention.
