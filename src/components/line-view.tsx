"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn, statusColor } from "@/lib/utils";
import type { Machine } from "@/lib/types";
import { Activity, Thermometer, Gauge } from "lucide-react";

// =============================================================
// LineView: Surface 1
// =============================================================
// Renders the three extrusion lines with live status.
//
// Phase 1 (this file, scaffold): fetches once, no realtime yet.
// Phase 2 (Tuesday): add Supabase Realtime subscription so
// machine status updates appear live.
// =============================================================

export function LineView() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMachines() {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("id");

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch machines:", error);
      } else if (data) {
        setMachines(data as Machine[]);
      }
      setLoading(false);
    }

    fetchMachines();

    const channel = supabase
      .channel("machines-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "machines" },
        (payload) => {
          if (!mounted) return;
          const updated = payload.new as Machine;
          setMachines((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-panel border border-border rounded-lg p-6">
        <div className="text-muted text-sm">Loading lines...</div>
      </div>
    );
  }

  return (
    <section className="bg-panel border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Production Lines
        </h2>
        <span className="text-xs text-muted">{machines.length} active</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {machines.map((m) => (
          <MachineCard key={m.id} machine={m} />
        ))}
      </div>
    </section>
  );
}

function MachineCard({ machine }: { machine: Machine }) {
  const isAlarm = machine.status === "alarm";

  return (
    <div
      className={cn(
        "rounded-md p-4 border bg-panel-elevated",
        isAlarm ? "border-red-500/50" : "border-border",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{machine.name}</span>
        <span
          className={cn(
            "inline-block w-2.5 h-2.5 rounded-full",
            statusColor(machine.status),
            machine.status === "running" && "animate-pulse-slow",
          )}
          aria-label={machine.status}
        />
      </div>

      <p className="text-xs text-muted mb-3 line-clamp-2">{machine.product}</p>

      {machine.current_project && (
        <p className="text-xs text-primary-light mb-3 font-medium">
          {machine.current_project}
        </p>
      )}

      <div className="space-y-1.5 text-xs">
        <Metric
          icon={<Thermometer className="w-3 h-3" />}
          label="Temp"
          value={machine.extrusion_temp_c}
          unit="C"
          baseline={machine.baseline_temp_c}
        />
        <Metric
          icon={<Gauge className="w-3 h-3" />}
          label="Speed"
          value={machine.line_speed_mpm}
          unit="mpm"
          baseline={machine.baseline_speed_mpm}
        />
        <Metric
          icon={<Activity className="w-3 h-3" />}
          label="Status"
          stringValue={machine.status.toUpperCase()}
        />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  stringValue,
  unit,
  baseline,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number | null;
  stringValue?: string;
  unit?: string;
  baseline?: number;
}) {
  const isDeviated =
    typeof value === "number" &&
    typeof baseline === "number" &&
    Math.abs(value - baseline) / baseline > 0.05;

  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted">
        {icon}
        {label}
      </span>
      <span
        className={cn("font-mono", isDeviated ? "text-amber-300" : "text-foreground")}
      >
        {stringValue ?? (value !== null && value !== undefined ? `${value} ${unit}` : "—")}
      </span>
    </div>
  );
}
