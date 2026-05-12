# Hunter Setup Guide

A step-by-step walkthrough from the zip file to a running app on your laptop.

**Time required:** about 30 to 45 minutes the first time.

---

## Step 1: Create the GitHub repo

1. Go to https://github.com/new
2. Repository name: `hunter-demo`
3. Description: `AI-powered operator assistant for high-voltage cable manufacturing`
4. Private (recommended for now, you can make it public later)
5. Click "Create repository"
6. **Do NOT initialize with README, .gitignore, or license.** This repo will be filled from the zip.

Copy the repo URL (looks like `git@github.com:Adrianbrou/hunter-demo.git`).

---

## Step 2: Extract the zip

1. Download `hunter-demo.zip` from this conversation
2. Extract it somewhere clean, like `~/dev/hunter-demo/` (Mac/Linux) or `C:\dev\hunter-demo\` (Windows)
3. Open the folder in VS Code: `code hunter-demo/`

---

## Step 3: Connect to your GitHub repo

In the VS Code terminal:

```bash
cd hunter-demo
git init
git add .
git commit -m "Initial scaffold from Jarvis prep session"
git branch -M main
git remote add origin git@github.com:Adrianbrou/hunter-demo.git
git push -u origin main
```

If you use HTTPS instead of SSH, replace the `git@github.com:...` URL with the HTTPS one.

---

## Step 4: Install dependencies

```bash
npm install
```

This will take about a minute. You'll see lots of output. As long as it ends without red errors, you're good.

---

## Step 5: Create a fresh Supabase project

**DO NOT touch your TrainerOS Supabase project.** Create a brand new one.

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Project name: `hunter-demo`
4. Database password: pick a strong one, save it in your password manager
5. Region: pick the one closest to you (probably US East)
6. Pricing plan: Free is fine for the demo
7. Click "Create new project"
8. Wait about 2 minutes for it to provision

Once it's ready, you'll see the project dashboard.

---

## Step 6: Run the schema and seed data

1. In the Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open `supabase/migrations/0001_initial_schema.sql` from your local repo
4. Copy ALL of its contents
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned."

Now load the seed data:

1. Click "New query" again
2. Open `supabase/seed.sql` from your local repo
3. Copy ALL of its contents
4. Paste and Run

Verify it worked:

1. Click "Table Editor" in the left sidebar
2. You should see three tables: `machines`, `logs`, `knowledge_base`
3. Click `machines`. You should see 3 rows.
4. Click `logs`. You should see ~25 rows.
5. Click `knowledge_base`. You should see 10 rows.

If any of those counts are wrong, re-run the seed.sql.

---

## Step 7: Get your environment variables

In the Supabase dashboard:

1. Go to Project Settings (gear icon in left sidebar)
2. Click "Data API" in the submenu
3. Copy the following values:

- **Project URL** (something like `https://abcdefghijk.supabase.co`)
- **anon public key** (a long string starting with `eyJ...`)
- **service_role key** (also starts with `eyJ...`, keep this PRIVATE)

Now in VS Code:

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
```

---

## Step 8: Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Log in (or create an account if you don't have one)
3. Click "API Keys" in the sidebar
4. Click "Create Key"
5. Name it `hunter-demo`
6. Copy the key (starts with `sk-ant-`)
7. Paste it into `.env.local` as `ANTHROPIC_API_KEY`

**Important:** Anthropic gives you free credits when you sign up. Hunter will use very little for the demo (cents per day). You don't need a paid plan.

---

## Step 9: Deploy the Edge Function

The Hunter Edge Function needs to run on Supabase. To deploy it:

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Log in:

```bash
npx supabase login
```

Follow the browser prompt.

3. Link your project (use your project ref from the URL):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

4. Set the Anthropic key as a secret:

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

5. Deploy the function:

```bash
npx supabase functions deploy hunter
```

You should see "Deployed Function hunter".

---

## Step 10: Run the app locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**What you should see:**

- A dark industrial dashboard with header "Hunter"
- Three machine cards on the left for the three extrusion lines
- A log feed below showing the seeded logs
- A Hunter chat panel on the right with three demo scenario buttons

If the page loads but you see "Loading..." forever, check the browser console (F12) for errors. Most common issue: env vars not set correctly.

---

## Step 11: Test Hunter

Click one of the three demo scenario buttons in the chat panel. After a few seconds, Hunter should respond with a grounded answer citing one or more KB documents.

If Hunter responds with "Hunter is unavailable":
- Check that the Edge Function was deployed (Step 9)
- Check that the Anthropic API key secret was set
- Check the Edge Function logs in the Supabase dashboard (Edge Functions > hunter > Logs)

---

## Step 12: Run the simulator (optional, gives "live" feel)

In a second terminal tab:

```bash
npm run simulate
```

This inserts a new log entry every 3 seconds. Refresh the page to see them appear. (Phase 2 will make these stream in live without refresh.)

Press Ctrl+C to stop.

---

## You're done with setup!

You should now have:
- A live local app at http://localhost:3000
- A working Hunter chat that responds to questions
- A scripted log simulator for the live feel

**Next:** Read `PLAN.md` and start Phase 2 on Tuesday night.

---

## Troubleshooting

### "Missing Supabase environment variables"
Your `.env.local` is missing values or you forgot to copy from `.env.example`. Make sure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are filled in.

### "Failed to fetch machines"
Either your Supabase project isn't running, or you didn't run the migration. Double check Step 6.

### Hunter responses are slow or fail
Edge Functions cold start can take 1 to 2 seconds the first time. After that, responses should be fast. If they consistently fail, check the Edge Function logs in Supabase dashboard.

### TypeScript errors in VS Code
Try `npm run type-check`. If errors persist, restart the TypeScript server in VS Code: Cmd/Ctrl + Shift + P, then "TypeScript: Restart TS Server".
