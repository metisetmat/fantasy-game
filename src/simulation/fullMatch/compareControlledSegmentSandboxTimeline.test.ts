import { compareControlledSegmentSandboxTimeline } from "./compareControlledSegmentSandboxTimeline";
import {
  emptyControlledSegmentSandboxTimelinePath,
  type ControlledSegmentSandboxTimelinePath,
} from "./controlledSegmentSandboxTimeline";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: Partial<ControlledSegmentSandboxTimelinePath> & Pick<ControlledSegmentSandboxTimelinePath, "pathId">): ControlledSegmentSandboxTimelinePath {
  return {
    ...emptyControlledSegmentSandboxTimelinePath(input.pathId),
    status: "available",
    eventCount: input.eventCount ?? 9,
    finalOutcome: input.finalOutcome ?? "none",
    finalTeamCandidate: input.finalTeamCandidate ?? "none",
    finalZoneCandidate: input.finalZoneCandidate ?? "none",
  };
}

export function validateCompareControlledSegmentSandboxTimeline(): readonly string[] {
  const comparison = compareControlledSegmentSandboxTimeline({
    baseline: path({ pathId: "baseline" }),
    override: path({
      pathId: "override",
      finalOutcome: "secured_by_goalkeeper_team",
      finalTeamCandidate: "goalkeeper_team",
      finalZoneCandidate: "Z3-HSR",
    }),
  });

  assertTest(!comparison.sandboxTimelineEventCountDivergenceObserved, "equal event counts should not diverge.");
  assertTest(comparison.sandboxTimelineOutcomeDivergenceObserved, "different outcomes should diverge.");
  assertTest(comparison.sandboxTimelineFinalTeamDivergenceObserved, "different final teams should diverge.");
  assertTest(comparison.sandboxTimelineFinalZoneDivergenceObserved, "different final zones should diverge.");
  assertTest(!comparison.officialTimelineDivergenceObserved, "official timeline divergence must remain false.");
  assertTest(!comparison.officialPossessionDivergenceObserved, "official possession divergence must remain false.");
  assertTest(!comparison.officialScoreDivergenceObserved, "official score divergence must remain false.");
  assertTest(!comparison.officialScoringEventDivergenceObserved, "official scoring event divergence must remain false.");

  return [
    "controlled segment sandbox timeline comparison observes sandbox outcome/team/zone divergence",
    "controlled segment sandbox timeline event counts remain equal at 9",
    "official timeline, possession, score, and scoring-event divergence remain false",
  ];
}

if (require.main === module) {
  const checks = validateCompareControlledSegmentSandboxTimeline();

  console.log("compareControlledSegmentSandboxTimeline tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
