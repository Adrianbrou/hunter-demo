"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn, formatTime, severityColor } from "@/lib/utils";
import type { LogEntry } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

// =============================================================
// LogFeed: Surface 2
// =============================================================
// Renders the live log stream from all machines.
//
// Phase 1 (this file, scaffold): fetches last 50, no realtime.
// Phase 2 (Tuesday): subscribe to log inserts, prepend with
// slide-in animation.
// =============================================================

const FEED_LIMIT = 50;

export function LogFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLogs() {
      const { data, error: fetchError } = await supabase
        .from("logs")
        .select("*")
        .order("ts", { ascending: false })
        .limit(FEED_LIMIT);

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to fetch logs:", fetchError);
        setError("Could not load the log feed. Live updates will appear if the connection recovers.");
      } else if (data) {
        setLogs(data as LogEntry[]);
        setError(null);
      }
      setLoading(false);
    }

    fetchLogs();

    const channel = supabase
      .channel("logs-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "logs" },
        (payload) => {
          if (!mounted) return;
          setLogs((prev) =>
            [payload.new as LogEntry, ...prev].slice(0, FEED_LIMIT),
          );
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  return (
    <section className="bg-panel border border-border rounded-lg p-6 flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Live Log Feed
        </h2>
        <span className="text-xs text-muted">
          {logs.length} entries &middot; last {FEED_LIMIT}
        </span>
      </div>

      {error && !loading && logs.length === 0 && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 mb-3">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        {loading ? (
          <ul className="space-y-1 font-mono text-xs">
            {Array.from({ length: 8 }).map((_, i) => (
              <LogRowSkeleton key={i} />
            ))}
          </ul>
        ) : logs.length === 0 ? (
          <div className="text-muted text-sm">No logs yet. New entries will stream in here.</div>
        ) : (
          <ul className="space-y-1 font-mono text-xs">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function LogRowSkeleton() {
  return (
    <li className="py-1.5 px-3 rounded border-l-2 border-border flex gap-3 items-center animate-pulse">
      <div className="h-3 w-16 bg-border rounded shrink-0" />
      <div className="h-3 w-14 bg-border/60 rounded shrink-0" />
      <div className="h-3 flex-1 bg-border/40 rounded" />
    </li>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  return (
    <li
      className={cn(
        "py-1.5 px-3 rounded border-l-2 flex gap-3 items-start animate-slide-in",
        severityColor(log.severity),
        log.is_anomaly && "bg-red-500/5",
      )}
    >
      <span className="text-muted shrink-0">{formatTime(log.ts)}</span>
      <span className="text-foreground/60 shrink-0 w-16">{log.machine_id}</span>
      {log.is_anomaly && (
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-px" />
      )}
      <span className="flex-1">{log.message}</span>
      {log.anomaly_score !== null && log.anomaly_score !== undefined && (
        <span className="text-red-400 shrink-0">
          score {log.anomaly_score.toFixed(2)}
        </span>
      )}
    </li>
  );
}
