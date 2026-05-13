"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================
// Browser-side simulator
// =============================================================
// Mirrors scripts/simulate-logs.ts but runs from the page so the
// demo can be toggled with a button on the live URL. Uses the
// anon key, which already has insert on logs and update on machines.
// =============================================================

const MACHINE_IDS = ["line-1", "line-2", "line-3"] as const;

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

const MACHINE_ANCHORS: Record<string, { temp_c: number; speed_mpm: number }> = {
  "line-1": { temp_c: 185.4, speed_mpm: 4.6 },
  "line-2": { temp_c: 192.1, speed_mpm: 3.8 },
  "line-3": { temp_c: 198.5, speed_mpm: 3.2 },
};

const SEVERITY_WEIGHTS: Array<[string, number]> = [
  ["info", 0.85],
  ["warning", 0.13],
  ["anomaly", 0.02],
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSeverity(): string {
  const r = Math.random();
  let acc = 0;
  for (const [sev, w] of SEVERITY_WEIGHTS) {
    acc += w;
    if (r < acc) return sev;
  }
  return "info";
}

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
    console.error("Simulator insert failed:", error.message);
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
    console.error("Simulator machine update failed:", error.message);
  }
}

export function SimulatorControl() {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    // Emit one immediately so the user sees something within a beat
    void emitLog();

    const logInterval = setInterval(() => {
      void emitLog();
    }, 3000);
    const machineInterval = setInterval(() => {
      void jitterMachine();
    }, 15000);

    return () => {
      clearInterval(logInterval);
      clearInterval(machineInterval);
    };
  }, [running]);

  return (
    <button
      type="button"
      onClick={() => setRunning((r) => !r)}
      className={cn(
        "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors",
        running
          ? "border-status-running/50 bg-status-running/10 text-status-running hover:bg-status-running/15"
          : "border-border bg-panel-elevated text-muted hover:border-primary-light/50 hover:text-foreground",
      )}
      title={
        running
          ? "Stop inserting simulated logs"
          : "Start inserting simulated logs (one every 3s)"
      }
    >
      {running ? (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-running opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-running" />
          </span>
          Streaming
          <Pause className="w-3 h-3 ml-0.5" />
        </>
      ) : (
        <>
          <Play className="w-3 h-3" />
          Start stream
        </>
      )}
    </button>
  );
}
