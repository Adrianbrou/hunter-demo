// =============================================================
// Hunter Edge Function
// =============================================================
// Receives operator questions, assembles context from Supabase
// (machine state, recent logs, knowledge base), calls Claude,
// returns a grounded response.
//
// Deploy with:
//   npx supabase functions deploy hunter
//
// Set secrets:
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// =============================================================

// @ts-nocheck (Deno runtime, not Node)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

import { HUNTER_SYSTEM_PROMPT } from "./system-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize clients once per cold start
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

// Simple keyword retrieval for relevant KB articles.
// In a real system you'd use embeddings + pgvector. Threshold is intentional
// per the demo philosophy: simple, explainable, swappable for ML later.
async function fetchRelevantKnowledge(question: string, machineIds: string[]) {
  const q = question.toLowerCase();

  // Get all KB articles that apply to the active machines (or 'all')
  const { data: allDocs, error } = await supabase
    .from("knowledge_base")
    .select("doc_id, title, category, content, keywords, applies_to");

  if (error || !allDocs) {
    console.error("KB fetch failed:", error);
    return [];
  }

  // Score each doc by keyword overlap with the question
  const scored = allDocs
    .filter((doc) => {
      // Filter by applicability
      if (!doc.applies_to || doc.applies_to.length === 0) return true;
      if (doc.applies_to.includes("all")) return true;
      return doc.applies_to.some((m: string) => machineIds.includes(m));
    })
    .map((doc) => {
      const keywords: string[] = doc.keywords || [];
      const hits = keywords.filter((k) => q.includes(k.toLowerCase())).length;
      return { ...doc, score: hits };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4); // top 4 most relevant

  return scored.filter((d) => d.score > 0);
}

async function fetchContext() {
  // Current state of all machines
  const { data: machines } = await supabase
    .from("machines")
    .select("*")
    .order("id");

  // Last 20 log entries across all machines
  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .order("ts", { ascending: false })
    .limit(20);

  // Past resolved incidents from the team's history (last 60 days)
  const sixtyDaysAgo = new Date(
    Date.now() - 60 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: incidents } = await supabase
    .from("incident_memory")
    .select("*")
    .gte("occurred_at", sixtyDaysAgo)
    .order("occurred_at", { ascending: false });

  return {
    machines: machines || [],
    logs: logs || [],
    incidents: incidents || [],
  };
}

function filterRelevantIncidents(
  incidents: any[],
  machines: any[],
  logs: any[],
): any[] {
  const alarmMachineIds = new Set(
    machines.filter((m) => m.status === "alarm").map((m) => m.id),
  );
  const recentAnomalyTypes = new Set(
    logs
      .filter((l) => l.is_anomaly && l.anomaly_type)
      .map((l) => l.anomaly_type),
  );
  return incidents.filter(
    (i) =>
      alarmMachineIds.has(i.machine_id) ||
      recentAnomalyTypes.has(i.anomaly_type),
  );
}

function formatContextForPrompt(
  machines: any[],
  logs: any[],
  kbDocs: any[],
  incidents: any[],
): string {
  let context = "## Current Machine State\n\n";
  for (const m of machines) {
    context += `Machine: ${m.name}\n`;
    context += `  Product: ${m.product}\n`;
    context += `  Project: ${m.current_project || "none"}\n`;
    context += `  Status: ${m.status}\n`;
    context += `  Temperature: ${m.extrusion_temp_c} C (baseline ${m.baseline_temp_c})\n`;
    context += `  Line speed: ${m.line_speed_mpm} mpm (baseline ${m.baseline_speed_mpm})\n`;
    if (m.notes) context += `  Notes: ${m.notes}\n`;
    context += "\n";
  }

  context += "## Recent Log Entries (newest first)\n\n";
  for (const log of logs.slice().reverse()) {
    const ts = new Date(log.ts).toLocaleTimeString("en-US", { hour12: false });
    const flag = log.is_anomaly ? " [ANOMALY]" : "";
    context += `${ts} ${log.machine_id} [${log.severity}]${flag}: ${log.message}\n`;
  }
  context += "\n";

  if (kbDocs.length > 0) {
    context += "## Relevant Knowledge Base Articles\n\n";
    for (const doc of kbDocs) {
      context += `### ${doc.doc_id}: ${doc.title}\n${doc.content}\n\n`;
    }
  }

  if (incidents.length > 0) {
    context +=
      "## Your team's past resolved incidents (institutional memory)\n\n";
    context +=
      "These are real fixes operators applied on these specific lines. Lean on these when the current pattern matches a past incident, because they reflect what actually worked here, not just what the manual recommends.\n\n";
    for (const inc of incidents) {
      const occurred = new Date(inc.occurred_at);
      const date = occurred.toLocaleDateString("en-US");
      const daysAgo = Math.round(
        (Date.now() - occurred.getTime()) / (24 * 60 * 60 * 1000),
      );
      context += `### ${date} (${daysAgo} days ago) - ${inc.machine_id} - ${inc.anomaly_type}\n`;
      context += `Symptom: ${inc.symptom}\n`;
      context += `Root cause: ${inc.root_cause}\n`;
      context += `Fix: ${inc.fix_applied}\n`;
      if (inc.fixed_by) context += `Fixed by: ${inc.fixed_by}\n`;
      if (inc.resolution_minutes !== null) {
        context += `Resolution time: ${inc.resolution_minutes} minutes\n`;
      }
      context += `Outcome: ${inc.outcome}\n`;
      if (inc.notes) context += `Notes: ${inc.notes}\n`;
      context += "\n";
    }
  }

  return context;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const question: string | undefined = body?.question;
    const previousMessages: Array<{ role: "user" | "assistant"; content: string }> =
      body?.history || [];

    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'question' in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pull context from Supabase
    const { machines, logs, incidents } = await fetchContext();
    const activeMachineIds = machines.map((m) => m.id);
    const kbDocs = await fetchRelevantKnowledge(question, activeMachineIds);
    const relevantIncidents = filterRelevantIncidents(
      incidents,
      machines,
      logs,
    );

    const contextBlock = formatContextForPrompt(
      machines,
      logs,
      kbDocs,
      incidents,
    );

    // Build messages
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...previousMessages,
      {
        role: "user",
        content: `${contextBlock}\n\n## Operator Question\n\n${question}`,
      },
    ];

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: HUNTER_SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((c: any) => c.type === "text");
    const answer = textBlock ? (textBlock as any).text : "Hunter did not produce a response.";

    return new Response(
      JSON.stringify({
        answer,
        citations: kbDocs.map((d) => ({ doc_id: d.doc_id, title: d.title })),
        matchedIncidents: relevantIncidents.length,
        usage: response.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Hunter function error:", err);
    return new Response(
      JSON.stringify({
        error: "Hunter is unavailable. Please try again or escalate to your shift lead.",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
