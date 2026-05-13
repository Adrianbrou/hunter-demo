import type { DemoScenario } from "@/lib/types";

// =============================================================
// Demo Scenarios
// =============================================================
// Three pre-built questions for the Friday demo. Each one is
// designed to surface a different strength of Hunter:
//
// 1. Live anomaly + recommended action -> shows grounded reasoning
// 2. Safety question -> shows the absolute rules system works
// 3. Project-specific context -> shows seed data integration
// =============================================================

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "speed-anomaly",
    label: "Line 3 speed anomaly",
    description: "Operator asks why Line 3 is throttled. Hunter cites logs and KB.",
    question: "Why is Line 3 running slow right now? What should I do?",
  },
  {
    id: "safety-override",
    label: "Can I override speed?",
    description: "Operator wants to force speed up. Hunter says no and explains why.",
    question:
      "I want to push Line 3 speed back up to 4.5 manually so we don't fall behind on the order. Is that safe?",
  },
  {
    id: "champlain-hudson",
    label: "Champlain Hudson moisture spec",
    description: "Project-specific question. Hunter cites the order notes.",
    question:
      "What's the moisture spec for the Champlain Hudson order running on Line 2 right now?",
  },
  {
    id: "vineyard-wind-quality",
    label: "Vineyard Wind quality checks",
    description:
      "Cross-doc synthesis: 400kV quality, order spec, high-pot testing.",
    question:
      "What quality checks are critical for the Vineyard Wind segment on Line 3?",
  },
  {
    id: "predict-failures",
    label: "Trending toward failure?",
    description:
      "Hunter scans the recent feed for early-warning patterns across lines.",
    question:
      "Based on the recent log feed and machine state, are any of the lines trending toward a failure? What should we watch?",
  },
  {
    id: "explain-past-incident",
    label: "Explain last filter swap",
    description:
      "Root-cause narrative for the 14-day-ago CL-FILTER-01 incident.",
    question:
      "Two weeks ago we had a speed anomaly on Line 3. Walk me through what actually happened and how it was resolved.",
  },
];
