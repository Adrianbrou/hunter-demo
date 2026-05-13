"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn, statusColor } from "@/lib/utils";
import type { Machine } from "@/lib/types";
import {
  Activity,
  Thermometer,
  Gauge,
  AlertTriangle,
  ClipboardEdit,
} from "lucide-react";
import { LogIncidentDialog } from "./log-incident-dialog";

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
  const [error, setError] = useState<string | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logPrefill, setLogPrefill] = useState<{
    machineId?: string;
    anomalyType?: string;
    symptom?: string;
  }>({});

  useEffect(() => {
    let mounted = true;

    async function fetchMachines() {
      const { data, error: fetchError } = await supabase
        .from("machines")
        .select("*")
        .order("id");

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to fetch machines:", fetchError);
        setError("Could not reach the production database. Retrying via realtime.");
      } else if (data) {
        setMachines(data as Machine[]);
        setError(null);
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

  const activeAnomalies = machines.filter((m) => m.status === "alarm");

  function openLogForAnomaly(machine?: Machine) {
    setLogPrefill({
      machineId: machine?.id,
      anomalyType: "speed_deviation",
      symptom: machine?.notes ?? "",
    });
    setLogDialogOpen(true);
  }

  return (
    <>
      {activeAnomalies.length > 0 && (
        <AnomalyBanner
          anomalies={activeAnomalies}
          onLogResolution={() => openLogForAnomaly(activeAnomalies[0])}
        />
      )}

      <section className="bg-panel border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Production Lines
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openLogForAnomaly()}
              disabled={loading || machines.length === 0}
              className="text-xs text-muted hover:text-primary-light transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <ClipboardEdit className="w-3 h-3" />
              Log incident
            </button>
            <span className="text-xs text-muted">
              {loading ? "Loading..." : `${machines.length} active`}
            </span>
          </div>
        </div>

        {error && !loading && machines.length === 0 && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <>
              <MachineCardSkeleton />
              <MachineCardSkeleton />
              <MachineCardSkeleton />
            </>
          ) : (
            machines.map((m) => <MachineCard key={m.id} machine={m} />)
          )}
        </div>
      </section>

      <LogIncidentDialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        machines={machines}
        defaultMachineId={logPrefill.machineId}
        defaultAnomalyType={logPrefill.anomalyType}
        defaultSymptom={logPrefill.symptom}
      />
    </>
  );
}

function AnomalyBanner({
  anomalies,
  onLogResolution,
}: {
  anomalies: Machine[];
  onLogResolution: () => void;
}) {
  const label =
    anomalies.length === 1
      ? "1 active anomaly"
      : `${anomalies.length} active anomalies`;
  return (
    <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 flex items-center gap-3">
      <div className="shrink-0 w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-red-300 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-red-100 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-xs text-red-200/80 truncate">
          {anomalies.map((m) => m.name).join(" · ")}
          <span className="text-muted ml-2">Ask Hunter for context &rarr;</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogResolution}
        className="shrink-0 text-xs px-3 py-1.5 rounded border border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:border-red-500/60 transition-colors flex items-center gap-1.5 font-medium"
      >
        <ClipboardEdit className="w-3.5 h-3.5" />
        Log resolution
      </button>
    </div>
  );
}

function MachineCardSkeleton() {
  return (
    <div className="rounded-md p-4 border border-border bg-panel-elevated animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-32 bg-border rounded" />
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
      </div>
      <div className="h-3 w-full bg-border/60 rounded mb-1" />
      <div className="h-3 w-2/3 bg-border/60 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-border/60 rounded" />
        <div className="h-3 bg-border/60 rounded" />
        <div className="h-3 bg-border/60 rounded" />
      </div>
    </div>
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
      <span className="flex items-center gap-1.5 text-muted text-xs">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          isDeviated ? "text-amber-300" : "text-foreground",
        )}
      >
        {stringValue ?? (value !== null && value !== undefined ? `${value} ${unit}` : "-")}
      </span>
    </div>
  );
}
