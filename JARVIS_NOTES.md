# Jarvis Notes: Why I Built Hunter This Way

This file exists so Adrian can answer the interviewer's "why did you choose this architecture?" questions with real reasoning, not improvised guesses.

Read this twice before Friday. Then put it away.

---

## Why one combined app instead of two separate ones

The whole point of the demo is to prove a specific thesis: **dashboards alone don't drive decisions, and AI assistants alone don't have context.** They need each other.

If I built two separate apps, the engineering manager would see two cool things. With one combined app, he sees a worldview. The dashboard answers "what is happening?" Hunter answers "what should I do about it?" Together, they close the operator's decision loop.

**On the call:** "I made a deliberate choice to build this as one app, not two. Operators don't switch between tools when they need to make a fast decision. They need the data and the answer in one view."

---

## Why Supabase instead of a custom backend

Three reasons:

1. **It matches the TrainerOS architecture.** The whole pitch is "I run this stack in production." Using a different stack for the demo would undermine that claim.
2. **Realtime is free.** Supabase Realtime is built on Postgres logical replication. I get live log streaming without writing any websocket code. For a 3-night build, that matters.
3. **Edge Functions keep the Anthropic key off the client.** Same security boundary as production. The browser never sees the API key.

**On the call:** "Supabase gives me Postgres, auth (which I'm not using here), realtime, and a serverless function runtime in one platform. For a small team, that's a force multiplier."

---

## Why Deno Edge Functions instead of Next.js API routes

Deno Edge Functions:
- Run on Supabase's infrastructure, close to the database, so latency is low
- Are completely separate from the Next.js app, so they could be reused by a mobile app, a Slack bot, or any other client without changes
- Use Deno's permission model, which I trust for handling the API key

If I had used a Next.js API route, the AI router would be locked to this app. Decoupling it is the right call for a future-real system.

**On the call:** "I split the AI router into a Supabase Edge Function instead of a Next.js API route on purpose. The reason is that an operator-facing AI assistant shouldn't be locked to one frontend. With this architecture, if Southwire wanted to wire Hunter into a Teams bot, a mobile maintenance app, or directly into existing SCADA dashboards, the same function works. The router is the contract. Clients are interchangeable."

---

## Why threshold-based anomaly detection instead of an ML model

Honest answer: a real ML model needs real training data. I have none. Faking one with synthetic data would be intellectually dishonest. Threshold rules ("speed dropped more than 20% from baseline") are simple, deterministic, and explainable. They're also exactly how most plants ACTUALLY detect anomalies today, before ML.

**On the call:** "The anomaly detection here is rule-based, not ML. That's intentional. I don't have real plant data, so faking a trained model wouldn't be honest. The architecture supports plugging in an ML model later. The detection layer is its own module. With real labeled training data, swapping in a model is straightforward."

This is the answer that proves you understand both engineering and intellectual honesty. Engineering managers love this answer.

---

## Why I used Claude (Anthropic) instead of GPT, Gemini, or open source

Three reasons:

1. **I already use it in production for TrainerOS.** Same API surface, same patterns.
2. **Claude is genuinely strong at grounded, citation-style answers.** That matters when the operator needs to trust the response.
3. **Anthropic's safety stance matches an industrial context.** Hunter never invents safety procedures or part numbers. Claude's tendency to admit uncertainty is exactly what you want when a wrong answer could hurt someone.

**On the call:** "I use Claude in production for TrainerOS. For a tool an operator might rely on for safety-relevant decisions, I want a model that admits uncertainty when it should. That's why I picked Claude here too."

---

## Why no authentication

This is a demo. Adding auth would burn a night for zero demo value. If this became a real product, the auth layer is well-understood, well-trodden territory.

**On the call:** "Auth is intentionally not in the demo. For an actual plant deployment you'd integrate with Southwire's existing identity provider, probably via SSO. Adding auth here would have eaten a night that I'd rather spend making the AI responses bulletproof."

---

## Why the seed data references Vineyard Wind and Champlain Hudson

Because those are real projects Huntersville cable went into. Mentioning them in the seed data does two things:

1. Proves I researched the plant beyond surface level.
2. Lets the engineering manager picture the demo running in HIS plant, not a generic factory.

**On the call:** When showing the dashboard, casually mention: "I seeded the data with cable batches from real projects, Vineyard Wind 1 and Champlain Hudson, because those are the kinds of orders Huntersville actually runs."

That sentence alone moves you from "candidate" to "person who already gets it."

---

## Why three demo scenarios, hardcoded

Live demos with AI fail. Always. The model will say something weird at the worst moment.

Three pre-canned demo scenarios let me show off the system reliably while still allowing the engineering manager to type their own question if they want. Best of both worlds: scripted reliability for the demo, open exploration if asked.

**On the call:** "Notice the three buttons at the top of Hunter. Those are pre-built scenarios so the demo is reliable. But you're welcome to type any question, the system works on free input too."

---

## Why this stack is also realistic for Southwire to actually use

If Southwire wanted to build this for real:

- Postgres scales to billions of log rows with the right partitioning
- Supabase has an enterprise tier with dedicated infrastructure, BYO cloud, and SOC 2 compliance
- The Edge Function pattern works for any deployment topology (on-prem, hybrid, cloud)
- The architecture is OT/IT-friendly: the dashboard can live on the IT side, the Edge Function and database can sit wherever Southwire's security policy allows

**On the call:** "This demo runs on consumer-grade Supabase. For a real Southwire deployment you'd want enterprise infrastructure, but the architecture doesn't change. The components are well-trodden in industrial software now."

---

## The narrative arc for the demo, locked

Memorize this sequence:

1. "This is Hunter, an AI-powered operator assistant I built specifically for our conversation."
2. "Three extrusion lines, 230 to 400 kilovolt cable, the kind of products Huntersville actually makes."
3. "Live logs streaming from each line. Anomalies highlighted automatically."
4. "Here's a pre-built scenario. Watch what happens when Line 3 speed drops."
5. "An operator can now ask Hunter what's going on."
6. "Hunter has access to the live machine state, recent logs, and seeded maintenance docs. The answer is grounded, not hallucinated."
7. "This is one app, two surfaces, one loop. The dashboard shows what's happening. Hunter helps decide what to do. That's what Connected Enterprise is trying to build at scale."
8. "I built this in three nights to show the pattern. With real plant data and real maintenance docs, it becomes useful, not just a demo."

If you say nothing else about the demo, say those 8 sentences.

---

## What NOT to say about the demo

- Do not call it "production ready." It is not.
- Do not promise specific dollar savings or efficiency gains. You have no data to support that.
- Do not say "Southwire should build this." Say "this is one pattern Southwire could explore."
- Do not say it took you 30 minutes. It took 3 nights of focused work. Own that.
- Do not say "with more time I could have..." That is an excuse. The demo is what it is.

---

## Final thought

The demo is not the prize. The interview is the prize. The demo is the unfair advantage that makes the interview easy. Don't get so caught up in the build that you forget to sleep.

You have the script (Doc 2). You have the prep (Doc 1). You have the demo (this repo). That is more preparation than 99% of candidates ever bring. Trust the work.

— Jarvis
