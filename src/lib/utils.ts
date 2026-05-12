import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function relativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "anomaly":
      return "text-red-400 border-red-500/40";
    case "error":
      return "text-red-300 border-red-500/30";
    case "warning":
      return "text-amber-300 border-amber-500/30";
    default:
      return "text-foreground/70 border-border";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "running":
      return "bg-status-running";
    case "alarm":
      return "bg-status-alarm";
    default:
      return "bg-status-idle";
  }
}
