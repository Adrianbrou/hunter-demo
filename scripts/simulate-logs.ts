// =============================================================
// Log Simulator
// =============================================================
// Inserts realistic log entries every 3 seconds into Supabase.
// Run alongside `npm run dev` to give the dashboard a "live"
// feel during local development and the Friday demo.
//
// Usage:
//   npm run simulate
//
// Or directly:
//   tsx scripts/simulate-logs.ts
//
// Stop with Ctrl+C.
// =============================================================

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const NOMINAL_LOGS_BY_LINE: Record<string, string[]> = {
  "line-1": [
    "Temperature stable, all sensors agree",
    "Line speed nominal at 4.6 mpm",
    "Cooling loop pressure 4.5 bar, nominal",
    "Conductor tension within tolerance",
    "Insulation thickness measurement passed",
    "Crosshead pressure stable",
  ],
  "line-2": [
    "Champlain Hudson segment in progress",
    "Pellet moisture at 0.025 percent, within tightened spec",
    "High-pot pre-test passed at 862kV DC",
    "Line speed nominal at 3.8 mpm",
    "Quality checkpoint passed",
    "Concentricity measurement nominal",
  ],
  "line-3": [
    "Cooling pressure recovering toward nominal",
    "Line still throttled, awaiting operator action",
    "Speed holding at 3.2 mpm, anomaly active",
    "Temperature within tolerance at 198.5 C",
    "Maintenance notified of anomaly",
  ],
};

const SEVERITIES_AND_WEIGHTS: Array<[string, number]> = [
  ["info", 0.85],
  ["warning", 0.13],
  ["anomaly", 0.02],
];

function pickSeverity(): string {
  const r = Math.random();
  let acc = 0;
  for (const [sev, w] of SEVERITIES_AND_WEIGHTS) {
    acc += w;
    if (r < acc) return sev;
  }
  return "info";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MACHINE_IDS = ["line-1", "line-2", "line-3"];

async function emitLog() {
  const machineId = pick(MACHINE_IDS);
  const severity = pickSeverity();
  const message = pick(NOMINAL_LOGS_BY_LINE[machineId]);
  const isAnomaly = severity === "anomaly";

  const { error } = await supabase.from("logs").insert({
    machine_id: machineId,
    severity,
    message: isAnomaly ? `ANOMALY: ${message}` : message,
    is_anomaly: isAnomaly,
    anomaly_score: isAnomaly ? 0.55 + Math.random() * 0.3 : null,
    anomaly_type: isAnomaly ? "speed_deviation" : null,
  });

  if (error) {
    console.error("Insert failed:", error.message);
  } else {
    console.log(`[${new Date().toISOString()}] ${machineId} ${severity}: ${message}`);
  }
}

async function main() {
  console.log("Hunter log simulator started. Press Ctrl+C to stop.");
  console.log("Emitting one log every 3 seconds.\n");

  // Emit one immediately, then on interval
  await emitLog();
  setInterval(emitLog, 3000);
}

main().catch((err) => {
  console.error("Simulator crashed:", err);
  process.exit(1);
});
