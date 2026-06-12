import { compareControlledRouteResolutionSandbox } from "./compareControlledRouteResolutionSandbox";
import { resolveControlledRouteInSandbox } from "./resolveControlledRouteInSandbox";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCompareControlledRouteResolutionSandbox(): readonly string[] {
  const baseline = resolveControlledRouteInSandbox({
    pathId: "baseline",
    segmentLabel: "segment-1",
    candidateId: "chain-context-safe-recycle-pv",
    actionType: "SAFE_RECYCLE",
    receiverId: "control-pivot",
    targetZone: "Z2-HSL",
    candidateLegal: true,
    candidateAvailable: true,
  });
  const override = resolveControlledRouteInSandbox({
    pathId: "override",
    segmentLabel: "segment-1",
    candidateId: "chain-context-forward-progress-sh",
    actionType: "FORWARD_PROGRESS",
    receiverId: "control-space-hunter",
    targetZone: "Z4-HSR",
    candidateLegal: true,
    candidateAvailable: true,
  });
  const comparison = compareControlledRouteResolutionSandbox({ baseline, override });

  assertTest(comparison.selectionDivergenceObserved, "selection divergence must be true.");
  assertTest(comparison.carrierDivergenceObserved, "carrier divergence must be true.");
  assertTest(comparison.zoneProgressionDivergenceObserved, "zone progression divergence must be true.");
  assertTest(comparison.dangerCreationDivergenceObserved, "danger creation divergence must be true.");
  assertTest(override.dangerProbability > baseline.dangerProbability, "override must create higher danger than baseline.");
  assertTest(!comparison.scoringOpportunityDivergenceObserved, "scoring opportunity divergence remains false.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence remains false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence remains false.");
  assertTest(comparison.explanation.length > 20, "comparison explanation must be present.");

  return [
    "SAFE_RECYCLE baseline vs FORWARD_PROGRESS override creates selection divergence",
    "resulting carrier divergence is true",
    "resulting zone divergence is true",
    "zone progression divergence is true",
    "override creates higher danger than baseline",
    "scoring opportunity divergence remains false",
    "sandbox score divergence remains false",
    "sandbox scoring event divergence remains false",
    "explanation is present and coach-readable",
  ];
}

if (require.main === module) {
  const checks = validateCompareControlledRouteResolutionSandbox();

  console.log("compareControlledRouteResolutionSandbox tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
