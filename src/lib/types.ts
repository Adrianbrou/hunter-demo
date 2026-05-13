// =============================================================
// Shared TypeScript types
// =============================================================

export type MachineStatus = "running" | "idle" | "alarm";

export type LogSeverity = "info" | "warning" | "error" | "anomaly";

export interface Machine {
  id: string;
  name: string;
  product: string;
  current_project: string | null;
  status: MachineStatus;
  extrusion_temp_c: number | null;
  line_speed_mpm: number | null;
  conductor_diameter_mm: number | null;
  insulation_thickness_mm: number | null;
  baseline_temp_c: number;
  baseline_speed_mpm: number;
  notes: string | null;
  updated_at: string;
}

export interface LogEntry {
  id: number;
  machine_id: string;
  ts: string;
  severity: LogSeverity;
  message: string;
  is_anomaly: boolean;
  anomaly_type: string | null;
  anomaly_score: number | null;
  sensor_snapshot: Record<string, unknown> | null;
}

export interface KnowledgeBaseDoc {
  id: number;
  doc_id: string;
  title: string;
  category: string;
  applies_to: string[];
  content: string;
  keywords: string[];
  created_at: string;
}

export interface IncidentMemory {
  id: number;
  occurred_at: string;
  machine_id: string;
  anomaly_type: string;
  symptom: string;
  root_cause: string;
  fix_applied: string;
  fixed_by: string | null;
  resolution_minutes: number | null;
  outcome: "resolved" | "recurred" | "escalated";
  notes: string | null;
}

export type IncidentInsert = Omit<IncidentMemory, "id" | "occurred_at"> & {
  occurred_at?: string;
};

export interface HunterMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ doc_id: string; title: string }>;
  matchedIncidents?: number;
}

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  question: string;
}
