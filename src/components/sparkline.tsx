"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// =============================================================
// Sparkline
// =============================================================
// Tiny inline SVG line chart of one metric from logs.sensor_snapshot
// for a given machine. Subscribes to Realtime so new log inserts
// extend the line in real time.
// =============================================================

interface SparklineProps {
  machineId: string;
  metric?: string;
  className?: string;
  width?: number;
  height?: number;
  windowSize?: number;
}

export function Sparkline({
  machineId,
  metric = "speed_mpm",
  className,
  width = 64,
  height = 18,
  windowSize = 30,
}: SparklineProps) {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchHistory() {
      const { data } = await supabase
        .from("logs")
        .select("ts, sensor_snapshot")
        .eq("machine_id", machineId)
        .not("sensor_snapshot", "is", null)
        .order("ts", { ascending: false })
        .limit(windowSize);

      if (!mounted || !data) return;

      const pts = data
        .map((row) => {
          const snap = row.sensor_snapshot as Record<string, unknown> | null;
          const raw = snap?.[metric];
          if (typeof raw === "number") return raw;
          if (typeof raw === "string") {
            const n = Number(raw);
            return Number.isFinite(n) ? n : null;
          }
          return null;
        })
        .filter((n): n is number => n !== null)
        .reverse();

      setPoints(pts);
    }

    fetchHistory();

    const channel = supabase
      .channel(`sparkline-${machineId}-${metric}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "logs",
          filter: `machine_id=eq.${machineId}`,
        },
        (payload) => {
          if (!mounted) return;
          const snap = (payload.new as { sensor_snapshot?: Record<string, unknown> })
            ?.sensor_snapshot;
          const raw = snap?.[metric];
          let val: number | null = null;
          if (typeof raw === "number") val = raw;
          else if (typeof raw === "string") {
            const n = Number(raw);
            val = Number.isFinite(n) ? n : null;
          }
          if (val === null) return;
          setPoints((prev) => [...prev, val as number].slice(-windowSize));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [machineId, metric, windowSize]);

  if (points.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-label="Trend data loading"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeDasharray="2,2"
          strokeWidth="1"
        />
      </svg>
    );
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 0.0001;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = points[points.length - 1];
  const lastX = width;
  const lastY = height - ((last - min) / range) * (height - 2) - 1;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-label={`Trend of ${metric} (${points.length} samples)`}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="1.5" fill="currentColor" />
    </svg>
  );
}
