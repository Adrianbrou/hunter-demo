# Hunter

**An AI co-pilot for the plant floor of a high-voltage cable manufacturer.**

Hunter pairs a live production dashboard with a Claude-powered assistant that operators can ask plain English questions about machine state, anomalies, and troubleshooting procedures. Built specifically for the kind of plant floor Southwire runs at Huntersville (230kV to 400kV transmission cable).

> **Live demo:** [hunter-demo-bay.vercel.app](https://hunter-demo-bay.vercel.app)
> Screenshot and walkthrough GIF coming after the Friday demo.

---

## 🧭 Motivation

Southwire's Huntersville plant produces some of the largest high-voltage cable in North America. The 430-foot extrusion tower at the back of the plant has run cable for Vineyard Wind 1 and the Champlain Hudson Power Express. The company has publicly committed to a digital transformation: the Connected Enterprise initiative with Rockwell Automation, a multi-year SAP migration to Google Cloud, AI investments in Ndustrial and Verdigris.

The strategic question is the same one every industrial operator is asking: how do you close the loop between live plant data and the decision a single operator makes at 3am when a line goes into alarm?

I had a 45-minute interview window to make a point, not write a paper. So I built Hunter in three nights using the exact stack I run in production for my own product TrainerOS (aftrainer.app): Next.js, Supabase Postgres with Realtime, Deno Edge Functions, and the Anthropic API. Same database, same realtime, same security boundary, same AI router pattern. Different domain. The point is that the architecture transfers, and the gap between an idea on a whiteboard and a working surface in front of an operator can be very short when the platform is right.

---

## 🚀 Quick Start

```bash
git clone https://github.com/Adrianbrou/hunter-demo.git
cd hunter-demo
npm install
cp .env.example .env.local   # fill in Supabase + Anthropic values
npm run dev
```

You also need a Supabase project (run the migration in `supabase/migrations/` and the seed in `supabase/seed.sql` against it) and an Anthropic API key set as an Edge Function secret on that project.

Open http://localhost:3000. You should see three extrusion lines on the left, a live log feed below them, and the Hunter chat panel on the right.

For the optional live-feed effect during a demo (one new log every 3 seconds):

```bash
npm run simulate
```

---

## 📖 Usage

Hunter has three surfaces in one screen.

### 1. Line View
Three extrusion lines (Line 1 at 230kV, Line 2 at 345kV, Line 3 at 400kV) with live status, extrusion temperature, line speed, and current customer project. Machine cards switch to red on alarm. Individual metrics turn amber when they drift more than 5 percent off baseline.

### 2. Log Feed
The last 50 log entries across all lines, streaming live via Supabase Realtime. Anomaly rows are highlighted with a red border and the anomaly score is shown inline. Detection is threshold based by design (the rules and severity bands are spelled out in KB-010 in the seed knowledge base). The detection layer is its own module, so a real ML model can be swapped in without changing the rest of the system.

### 3. Hunter Chat
The Claude Sonnet 4.6 powered operator assistant. The operator types a question in plain English. The Edge Function pulls the current machine state, the last 20 log entries, and the most keyword-relevant knowledge base articles, then asks Claude for a grounded response. Hunter is instructed to cite the KB doc IDs and log timestamps it draws from, and to refuse unsafe overrides.

Three pre-built demo scenarios are pinned at the top of the chat panel:

| Scenario | What it shows |
|---|---|
| Line 3 speed anomaly | Grounded diagnosis. Hunter reads live sensor state, finds the matching KB article, recommends a first response. |
| Can I override speed? | Safety boundary. Hunter refuses an unsafe override and cites the operator manual reason. |
| Champlain Hudson moisture spec | Project-specific knowledge. Hunter finds the customer order notes for the right cable batch. |

### Stack

- **Next.js 14** App Router with TypeScript and Tailwind CSS
- **Supabase** Postgres, Realtime, Edge Functions, Storage
- **Anthropic Claude Sonnet 4.6** for the operator assistant
- **shadcn/ui** primitives and **lucide-react** icons
- **Vercel** for production deploy

### Project layout

```
hunter-demo/
├── README.md             this file
├── supabase/
│   ├── migrations/       database schema
│   ├── seed.sql          demo data: 3 machines, ~25 logs, 10 KB docs
│   └── functions/hunter/ Deno Edge Function (Claude router)
├── src/
│   ├── app/              Next.js routes
│   ├── components/       React components for the three surfaces
│   ├── lib/              Supabase client, shared types, utils
│   └── data/             demo scenarios
└── scripts/              simulate-logs.ts (live feed generator)
```

---

## 🤝 Contributing

This is an interview demo and PRs are not actively reviewed, but fork it freely.

```bash
git clone https://github.com/Adrianbrou/hunter-demo.git
cd hunter-demo
npm install
npm run dev          # local dev server on :3000
npm run type-check   # TypeScript validation
npm run build        # production build
npm run simulate     # log generator (needs Supabase env vars)
```

You need a Supabase project with the migration + seed applied and the Hunter Edge Function deployed before the dev server has data to render.

---

## For the demo on Friday May 15

The interview walks through these eight beats:

1. Open the live URL on screen share.
2. Point at the line view: three extrusion lines, 230kV through 400kV cable, the kind of products Huntersville actually makes.
3. Point at the log feed: live entries from each line, anomalies highlighted automatically.
4. Click Demo Scenario 1: speed anomaly developing on Line 3.
5. Click into Hunter: an operator can now ask what is going on.
6. Hunter answers, citing the relevant log entries and knowledge base articles. Grounded, not hallucinated.
7. Pivot to the pitch: one app, two surfaces, one loop. The dashboard shows what is happening. Hunter helps decide what to do. That is what Connected Enterprise is trying to build at scale.
8. With real plant data and real maintenance docs, this becomes a daily-use tool for shift operators, not a demo.

---

## Credits

Built by Salomon Adrian Brou ([adrianbrou.com](https://adrianbrou.com)).
Architecture twin: [aftrainer.app](https://aftrainer.app), my production product on the same stack.
