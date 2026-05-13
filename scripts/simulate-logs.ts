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

// Anchor points for live metric jitter. Line 3 stays in its alarm state
// (3.2 mpm) so the demo always has a visible anomaly to drive Hunter chat.
const MACHINE_ANCHORS: Record<string, { temp_c: number; speed_mpm: number }> = {
  "line-1": { temp_c: 185.4, speed_mpm: 4.6 },
  "line-2": { temp_c: 192.1, speed_mpm: 3.8 },
  "line-3": { temp_c: 198.5, speed_mpm: 3.2 },
};

async function emitLog() {
  const machineId = pick(MACHINE_IDS);
  const severity = pickSeverity();
  const message = pick(NOMINAL_LOGS_BY_LINE[machineId]);
  const isAnomaly = severity === "anomaly";

  const anchor = MACHINE_ANCHORS[machineId];
  const sensor_snapshot = {
    speed_mpm: +(anchor.speed_mpm + (Math.random() - 0.5) * 0.15).toFixed(2),
    temp_c: +(anchor.temp_c + (Math.random() - 0.5) * 0.5).toFixed(2),
    cooling_bar: +(4.5 + (Math.random() - 0.5) * 0.25).toFixed(2),
  };

  const { error } = await supabase.from("logs").insert({
    machine_id: machineId,
    severity,
    message: isAnomaly ? `ANOMALY: ${message}` : message,
    is_anomaly: isAnomaly,
    anomaly_score: isAnomaly ? 0.55 + Math.random() * 0.3 : null,
    anomaly_type: isAnomaly ? "speed_deviation" : null,
    sensor_snapshot,
  });

  if (error) {
    console.error("Insert failed:", error.message);
  } else {
    console.log(`[${new Date().toISOString()}] ${machineId} ${severity}: ${message}`);
  }
}

async function jitterMachine() {
  const machineId = pick(MACHINE_IDS);
  const anchor = MACHINE_ANCHORS[machineId];
  const newTemp = +(anchor.temp_c + (Math.random() - 0.5) * 0.6).toFixed(2);
  const newSpeed = +(anchor.speed_mpm + (Math.random() - 0.5) * 0.1).toFixed(2);

  const { error } = await supabase
    .from("machines")
    .update({
      extrusion_temp_c: newTemp,
      line_speed_mpm: newSpeed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", machineId);

  if (error) {
    console.error("Machine update failed:", error.message);
  } else {
    console.log(
      `[${new Date().toISOString()}] ${machineId} jitter: temp=${newTemp} C, speed=${newSpeed} mpm`,
    );
  }
}

async function main() {
  console.log("Hunter log simulator started. Press Ctrl+C to stop.");
  console.log("Emitting one log every 3 seconds and one machine jitter every 15 seconds.\n");

  await emitLog();
  setInterval(emitLog, 3000);
  setInterval(jitterMachine, 15000);
}

main().catch((err) => {
  console.error("Simulator crashed:", err);
  process.exit(1);
});
