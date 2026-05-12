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
];
