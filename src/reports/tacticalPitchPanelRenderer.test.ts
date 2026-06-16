import { renderTacticalPitchPanel } from "./renderTacticalPitchPanel";
import type { TacticalPitchPanelModel } from "./coachReportPhaseVisuals";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateTacticalPitchPanelRenderer(): readonly string[] {
  const panel: TacticalPitchPanelModel = {
    phase: "with_ball",
    title: "Avec ballon",
    subtitle: "Sous-titre",
    coachReading: "Lecture coach.",
    nextMatchCheck: "Verifier la zone.",
    available: true,
    source: "official_aggregates",
    zoneSignals: [
      {
        zone: "Z6-C",
        label: "Danger officiel",
        value: 4,
        kind: "danger_zone",
        source: "official_aggregates",
        confidence: "medium",
        explanation: "Z6-C concentre une menace officielle.",
      },
      {
        zone: "Z4-CL",
        label: "Progression utile",
        value: 2,
        kind: "progression_zone",
        source: "official_aggregates",
        confidence: "medium",
        explanation: "Z4-CL soutient une progression utile.",
      },
    ],
    primarySignal: {
      zone: "Z6-C",
      label: "Danger officiel",
      value: 4,
      kind: "danger_zone",
      source: "official_aggregates",
      confidence: "medium",
      explanation: "Z6-C concentre une menace officielle.",
    },
    secondarySignals: [
      {
        zone: "Z4-CL",
        label: "Progression utile",
        value: 2,
        kind: "progression_zone",
        source: "official_aggregates",
        confidence: "medium",
        explanation: "Z4-CL soutient une progression utile.",
      },
    ],
    pitchSvgAvailable: true,
    controlledEmptyStateUsed: false,
    visualTruthOnly: true,
    sandboxEventsPromotedToOfficial: false,
    inventedStatisticCount: 0,
  };

  const html = renderTacticalPitchPanel(panel);

  assertTest(html.includes("phase-pitch-grid"), "tactical pitch panel must render the SVG grid.");
  assertTest(html.includes("phase-zone--danger"), "tactical pitch panel must render the danger zone class.");
  assertTest(html.includes("phase-panel-reading"), "tactical pitch panel must render the coach reading.");
  assertTest(html.includes("&Agrave; v&eacute;rifier"), "tactical pitch panel must render the next-match check.");

  return [
    "pitch SVG grid renders",
    "danger zone class renders",
    "coach reading renders",
    "next-match check renders",
  ];
}

if (require.main === module) {
  const checks = validateTacticalPitchPanelRenderer();

  console.log("tacticalPitchPanelRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
