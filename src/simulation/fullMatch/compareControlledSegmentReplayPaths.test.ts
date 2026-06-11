import { compareControlledSegmentReplayPaths } from "./compareControlledSegmentReplayPaths";
import type { ControlledSegmentReplayPath } from "./fullMatchControlledSegmentReplayComparison";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const baseline: ControlledSegmentReplayPath = {
  pathId: "baseline",
  candidateId: "chain-context-safe-recycle-pv",
  actionType: "SAFE_RECYCLE",
  receiverId: "control-pivot",
  targetZone: "Z2-HSL",
  candidateLegal: true,
  candidateAvailable: true,
  possessionRetained: true,
  resultingCarrierId: "control-pivot",
  resultingZone: "Z2-HSL",
  zoneProgressionDelta: -1,
  dangerCreated: false,
  scoringOpportunityCreated: false,
  scoringEventCreated: false,
  scoreDelta: 0,
  timelineSignature: "baseline:safe-recycle",
  scoreSignature: "score_delta_0",
  scoringEventSignature: "no_scoring_event",
  warnings: [],
};

const override: ControlledSegmentReplayPath = {
  pathId: "override",
  candidateId: "chain-context-forward-progress-sh",
  actionType: "FORWARD_PROGRESS",
  receiverId: "control-space-hunter",
  targetZone: "Z4-HSR",
  candidateLegal: true,
  candidateAvailable: true,
  possessionRetained: true,
  resultingCarrierId: "control-space-hunter",
  resultingZone: "Z4-HSR",
  zoneProgressionDelta: 2,
  dangerCreated: true,
  scoringOpportunityCreated: false,
  scoringEventCreated: false,
  scoreDelta: 0,
  timelineSignature: "override:forward-progress",
  scoreSignature: "score_delta_0",
  scoringEventSignature: "no_scoring_event",
  warnings: [],
};

export function validateCompareControlledSegmentReplayPaths(): readonly string[] {
  const comparison = compareControlledSegmentReplayPaths({ baseline, override });

  assertTest(comparison.selectionDivergenceObserved, "SAFE_RECYCLE baseline vs FORWARD_PROGRESS override must diverge.");
  assertTest(comparison.zoneProgressionDivergenceObserved, "Z2-HSL vs Z4-HSR must create zone progression divergence.");
  assertTest(comparison.dangerCreationDivergenceObserved, "override must create higher danger than baseline.");
  assertTest(!comparison.scoringOpportunityDivergenceObserved, "scoring opportunity divergence remains false without real isolated scoring proof.");
  assertTest(comparison.timelineDivergenceObserved, "path timeline signatures must diverge.");
  assertTest(!comparison.scoreDivergenceObserved, "score divergence remains false when score signatures match.");
  assertTest(!comparison.scoringEventDivergenceObserved, "scoring event divergence remains false when scoring-event signatures match.");
  assertTest(comparison.explanation.length > 40, "comparison explanation must be present.");

  return [
    "SAFE_RECYCLE baseline vs FORWARD_PROGRESS override creates selection divergence",
    "SAFE_RECYCLE to Z2-HSL vs FORWARD_PROGRESS to Z4-HSR creates zone progression divergence",
    "override creates higher danger than baseline",
    "score divergence remains false unless score signatures differ",
    "scoring event divergence remains false unless scoring event signatures differ",
    "explanation is present and coach-readable",
  ];
}

if (require.main === module) {
  const checks = validateCompareControlledSegmentReplayPaths();

  console.log("compareControlledSegmentReplayPaths tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
