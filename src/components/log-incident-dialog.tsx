"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Machine } from "@/lib/types";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface LogIncidentDialogProps {
  open: boolean;
  onClose: () => void;
  machines: Machine[];
  defaultMachineId?: string;
  defaultAnomalyType?: string;
  defaultSymptom?: string;
}

const ANOMALY_TYPES = [
  { value: "speed_deviation", label: "Speed deviation" },
  { value: "temp_drift", label: "Temperature drift" },
  { value: "material_alert", label: "Material / moisture" },
  { value: "quality_hold", label: "Quality hold" },
  { value: "other", label: "Other" },
];

const OUTCOMES = [
  { value: "resolved", label: "Resolved" },
  { value: "recurred", label: "Recurred" },
  { value: "escalated", label: "Escalated" },
];

export function LogIncidentDialog({
  open,
  onClose,
  machines,
  defaultMachineId,
  defaultAnomalyType,
  defaultSymptom,
}: LogIncidentDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [machineId, setMachineId] = useState(
    defaultMachineId ?? machines[0]?.id ?? "",
  );
  const [anomalyType, setAnomalyType] = useState(
    defaultAnomalyType ?? "speed_deviation",
  );
  const [symptom, setSymptom] = useState(defaultSymptom ?? "");
  const [rootCause, setRootCause] = useState("");
  const [fixApplied, setFixApplied] = useState("");
  const [fixedBy, setFixedBy] = useState("");
  const [resolutionMinutes, setResolutionMinutes] = useState("");
  const [outcome, setOutcome] = useState("resolved");
  const [notes, setNotes] = useState("");

  // Reset prefilled fields whenever the dialog reopens with new context
  useEffect(() => {
    if (open) {
      setMachineId(defaultMachineId ?? machines[0]?.id ?? "");
      setAnomalyType(defaultAnomalyType ?? "speed_deviation");
      setSymptom(defaultSymptom ?? "");
      setError(null);
      setSuccess(false);
    }
  }, [open, defaultMachineId, defaultAnomalyType, defaultSymptom, machines]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!machineId || !symptom.trim() || !rootCause.trim() || !fixApplied.trim()) {
      setError("Please fill in machine, symptom, root cause, and fix.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("incident_memory")
      .insert({
        machine_id: machineId,
        anomaly_type: anomalyType,
        symptom: symptom.trim(),
        root_cause: rootCause.trim(),
        fix_applied: fixApplied.trim(),
        fixed_by: fixedBy.trim() || null,
        resolution_minutes: resolutionMinutes
          ? parseInt(resolutionMinutes, 10)
          : null,
        outcome,
        notes: notes.trim() || null,
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onClose();
      setRootCause("");
      setFixApplied("");
      setFixedBy("");
      setResolutionMinutes("");
      setOutcome("resolved");
      setNotes("");
    }, 1500);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Log incident resolution</h2>
            <p className="text-xs text-muted mt-0.5">
              Capture what happened so Hunter remembers it next time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-status-running/20 border border-status-running/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-status-running" />
            </div>
            <div className="text-sm font-semibold">Incident logged</div>
            <div className="text-xs text-muted max-w-[260px]">
              Hunter will include this in future answers about similar patterns.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {/* Machine */}
            <Field label="Machine">
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                required
                className="form-input"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Anomaly type */}
            <Field label="Anomaly type">
              <select
                value={anomalyType}
                onChange={(e) => setAnomalyType(e.target.value)}
                required
                className="form-input"
              >
                {ANOMALY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Symptom */}
            <Field label="Symptom" hint="What did you observe?">
              <textarea
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                required
                rows={2}
                placeholder="e.g. Line 3 speed dropped to 3.2 mpm, cooling pressure at 4.1 bar."
                className="form-input"
              />
            </Field>

            {/* Root cause */}
            <Field label="Root cause" hint="What was actually wrong?">
              <textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                required
                rows={2}
                placeholder="e.g. CL-FILTER-01 differential pressure was 0.45 bar, above the 0.4 bar threshold."
                className="form-input"
              />
            </Field>

            {/* Fix applied */}
            <Field label="Fix applied" hint="What did you do?">
              <textarea
                value={fixApplied}
                onChange={(e) => setFixApplied(e.target.value)}
                required
                rows={2}
                placeholder="e.g. Replaced CL-FILTER-01 cartridge. Cooling pressure recovered in 4 minutes."
                className="form-input"
              />
            </Field>

            {/* Two columns: fixed_by + minutes */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fixed by">
                <input
                  value={fixedBy}
                  onChange={(e) => setFixedBy(e.target.value)}
                  placeholder="Name or role"
                  className="form-input"
                />
              </Field>
              <Field label="Time spent (min)">
                <input
                  type="number"
                  min="0"
                  value={resolutionMinutes}
                  onChange={(e) => setResolutionMinutes(e.target.value)}
                  placeholder="e.g. 22"
                  className="form-input"
                />
              </Field>
            </div>

            {/* Outcome */}
            <Field label="Outcome">
              <div className="flex gap-2">
                {OUTCOMES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOutcome(o.value)}
                    className={cn(
                      "flex-1 text-xs px-3 py-2 rounded border transition-colors",
                      outcome === o.value
                        ? "border-primary-light bg-primary/20 text-primary-light"
                        : "border-border bg-panel-elevated text-muted hover:border-primary-light/50",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Notes */}
            <Field label="Notes" hint="Optional. Context for future operators.">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="form-input"
              />
            </Field>

            {error && (
              <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-xs px-3 py-2 rounded border border-border bg-panel-elevated hover:border-primary-light/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs px-3 py-2 rounded bg-primary hover:bg-primary-light text-primary-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Log resolution
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Local utility class for the form inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          background-color: hsl(220, 13%, 15%);
          border: 1px solid hsl(220, 13%, 20%);
          border-radius: 4px;
          padding: 0.5rem 0.625rem;
          font-size: 0.8125rem;
          color: hsl(210, 20%, 95%);
          font-family: inherit;
          resize: vertical;
        }
        .form-input:focus {
          outline: none;
          border-color: hsl(214, 60%, 45%);
        }
        .form-input::placeholder {
          color: hsl(220, 9%, 46%);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
