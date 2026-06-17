import { renderTacticalPitchPanel } from "./renderTacticalPitchPanel";
import type { TacticalPitchPanelModel } from "./coachReportPhaseVisuals";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function samplePanel(controlledEmptyStateUsed: boolean): TacticalPitchPanelModel {
  const primarySignal = controlledEmptyStateUsed
    ? undefined
    : {
        zone: "Z6-C",
        label: "Danger officiel",
        value: 4,
        kind: "danger_zone" as const,
        source: "official_aggregates" as const,
        confidence: "medium" as const,
        explanation: "Z6-C concentre une menace officielle.",
      };
  const secondarySignals = controlledEmptyStateUsed
    ? []
    : [
        {
          zone: "Z4-CL",
          label: "Progression utile",
          value: 2,
          kind: "progression_zone" as const,
          source: "official_aggregates" as const,
          confidence: "medium" as const,
          explanation: "Z4-CL soutient une progression utile.",
        },
      ];

  return {
    phase: "with_ball",
    title: "Avec ballon",
    subtitle: "Lecture prioritaire du danger offensif.",
    coachReading: "Lecture coach.",
    nextMatchCheck: "Verifier la zone.",
    available: true,
    source: "official_aggregates",
    zoneSignals: controlledEmptyStateUsed
      ? []
      : [
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
    ...(primarySignal === undefined ? {} : { primarySignal }),
    secondarySignals,
    pitchSvgAvailable: !controlledEmptyStateUsed,
    controlledEmptyStateUsed,
    ...(controlledEmptyStateUsed ? { emptyStateReason: "Donn&eacute;e insuffisante dans ce run." } : {}),
    visualTruthOnly: true,
    sandboxEventsPromotedToOfficial: false,
    inventedStatisticCount: 0,
  };
}

export function validateTacticalPitchPanelReadabilityRenderer(): readonly string[] {
  const readableHtml = renderTacticalPitchPanel(samplePanel(false));
  const emptyHtml = renderTacticalPitchPanel(samplePanel(true));

  assertTest(readableHtml.includes("phase-pitch"), "readable panel must contain the pitch SVG.");
  assertTest(readableHtml.includes("phase-zone--primary"), "readable panel must contain primary zone emphasis.");
  assertTest(readableHtml.includes("phase-panel-summary"), "readable panel must contain the summary block.");
  assertTest(readableHtml.includes("phase-panel-why"), "readable panel must contain the why block.");
  assertTest(readableHtml.includes("phase-panel-next-check"), "readable panel must contain the next-check block.");
  assertTest(readableHtml.includes("phase-panel-limitation"), "readable panel must contain the limitation block.");
  assertTest(emptyHtml.includes("report-pitch-placeholder") && emptyHtml.includes("Donn&eacute;e insuffisante"), "controlled empty panel must remain readable.");

  return [
    "rendered panel contains phase-pitch",
    "rendered panel contains phase-zone--primary",
    "rendered panel contains phase-panel-summary",
    "rendered panel contains phase-panel-why",
    "rendered panel contains phase-panel-next-check",
    "rendered panel contains phase-panel-limitation",
    "controlled empty panel remains readable",
  ];
}

if (require.main === module) {
  const checks = validateTacticalPitchPanelReadabilityRenderer();

  console.log("tacticalPitchPanelReadabilityRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
