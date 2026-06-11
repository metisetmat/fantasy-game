import { compareRealIsolatedSegmentReplayPaths } from "./compareRealIsolatedSegmentReplayPaths";
import { runRealIsolatedSegmentReplayPath } from "./realIsolatedSegmentReplayEngine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCompareRealIsolatedSegmentReplayPaths(): readonly string[] {
  const baseline = runRealIsolatedSegmentReplayPath({
    pathId: "baseline",
    segmentLabel: "segment-1",
    candidateId: "chain-context-safe-recycle-pv",
    actionType: "SAFE_RECYCLE",
    receiverId: "control-pivot",
    targetZone: "Z2-HSL",
    candidateLegal: true,
    candidateAvailable: true,
  });
  const override = runRealIsolatedSegmentReplayPath({
    pathId: "override",
    segmentLabel: "segment-1",
    candidateId: "chain-context-forward-progress-sh",
    actionType: "FORWARD_PROGRESS",
    receiverId: "control-space-hunter",
    targetZone: "Z4-HSR",
    candidateLegal: true,
    candidateAvailable: true,
  });
  const comparison = compareRealIsolatedSegmentReplayPaths({ baseline, override });

  assertTest(comparison.selectionDivergenceObserved, "SAFE_RECYCLE baseline vs FORWARD_PROGRESS override must create selection divergence.");
  assertTest(comparison.carrierDivergenceObserved, "resulting carrier divergence must be true.");
  assertTest(baseline.resultingZone !== override.resultingZone, "resulting zone divergence must be true.");
  assertTest(comparison.zoneProgressionDivergenceObserved, "zone progression divergence must be true.");
  assertTest(comparison.dangerCreationDivergenceObserved, "override must create higher danger than baseline.");
  assertTest(comparison.isolatedTimelineDivergenceObserved, "isolated timeline divergence must be true.");
  assertTest(!comparison.isolatedScoreDivergenceObserved, "isolated score divergence remains false without isolated score changes.");
  assertTest(!comparison.isolatedScoringEventDivergenceObserved, "isolated scoring event divergence remains false without isolated scoring events.");
  assertTest(comparison.explanation.length > 40, "explanation must be present and coach-readable.");

  return [
    "SAFE_RECYCLE baseline vs FORWARD_PROGRESS override creates selection divergence",
    "resulting carrier and zone divergence are true",
    "zone progression and danger creation divergence are true",
    "isolated timeline divergence is true",
    "isolated score and scoring-event divergence remain false",
    "coach-readable explanation is present",
  ];
}

if (require.main === module) {
  const checks = validateCompareRealIsolatedSegmentReplayPaths();

  console.log("compareRealIsolatedSegmentReplayPaths tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
