import type { FullMatchLiveSelectionOverrideGuard } from "./fullMatchLiveSelectionOverrideGuard";
import {
  isolatedMiniMatchOverrideCannotClaimGlobalEconomy,
  isolatedMiniMatchOverrideCannotMutateNormalFullMatch,
  isolatedMiniMatchOverrideExperimentFromGuard,
  validateIsolatedMiniMatchOverrideExperiment,
} from "./isolatedMiniMatchOverrideExperimentFromGuard";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function liveOverrideGuard(
  overrides: Partial<FullMatchLiveSelectionOverrideGuard>,
): FullMatchLiveSelectionOverrideGuard {
  return {
    status: "available",
    scope: "experimental_live_selection_override_guard",
    origin: "controlled_minimatch_route_source",
    segmentLabel: "segment-1",
    chainId: "sequence-1-multi-action-chain",
    overrideCandidateId: "chain-context-forward-progress-sh",
    overrideActionType: "FORWARD_PROGRESS",
    overrideReceiverId: "control-space-hunter",
    overrideTargetZone: "Z4-HSR",
    sourceBaseScore: 82,
    sourceInfluenceDelta: 5,
    sourceInfluencedScore: 87,
    candidateLegal: true,
    candidateAvailable: true,
    rejectedClosedCandidateCount: 1,
    rejectedUnavailableCandidateCount: 1,
    experimentalOverridePrepared: true,
    overrideAppliedToLiveSelection: false,
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveNormalLiveMiniMatchResolution: false,
    canCreateScoringEvents: false,
    tags: [],
    warnings: [],
    ...overrides,
  };
}

export function validateFullMatchIsolatedMiniMatchOverrideExperimentGuard(): readonly string[] {
  const legalExperiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard: liveOverrideGuard({}),
    baselineCandidateId: "chain-context-safe-recycle-pv",
    baselineActionType: "SAFE_RECYCLE",
    baselineReceiverId: "control-pivot",
    baselineTargetZone: "Z2-HSL",
  });
  const illegalExperiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard: liveOverrideGuard({
      overrideCandidateId: "chain-context-closed-central-force",
      candidateLegal: false,
    }),
    baselineCandidateId: "chain-context-safe-recycle-pv",
  });
  const unavailableExperiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard: liveOverrideGuard({
      overrideCandidateId: "chain-context-unavailable-switch",
      candidateAvailable: false,
    }),
    baselineCandidateId: "chain-context-safe-recycle-pv",
  });
  const { overrideCandidateId: _removedCandidateId, ...missingCandidateGuard } = liveOverrideGuard({});
  const missingExperiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard: missingCandidateGuard,
    baselineCandidateId: "chain-context-safe-recycle-pv",
  });

  assertTest(legalExperiment.status === "available", "legal live override guard must create available isolated experiment.");
  assertTest(illegalExperiment.status !== "available", "CLOSED/illegal candidate cannot become isolated override experiment.");
  assertTest(unavailableExperiment.status !== "available", "unavailable candidate cannot become isolated override experiment.");
  assertTest(missingExperiment.status !== "available", "missing override candidate cannot become isolated override experiment.");
  assertTest(validateIsolatedMiniMatchOverrideExperiment(legalExperiment).length === 0, "legal isolated experiment validation must pass.");
  assertTest(validateIsolatedMiniMatchOverrideExperiment(illegalExperiment).length > 0, "illegal isolated experiment validation must warn.");
  assertTest(isolatedMiniMatchOverrideCannotMutateNormalFullMatch(legalExperiment), "isolated experiment cannot mutate normal full-match surfaces.");
  assertTest(isolatedMiniMatchOverrideCannotClaimGlobalEconomy(legalExperiment), "isolated experiment cannot claim global economy.");
  assertTest(!legalExperiment.canCreateProductionScoringEvents, "isolated experiment cannot create production scoring events.");
  assertTest(!legalExperiment.canMutateProductionRouteResolution, "isolated experiment cannot mutate production route resolution.");
  assertTest(!legalExperiment.canMutateGlobalRouteSuccessRates, "isolated experiment cannot mutate global route success rates.");

  return [
    "CLOSED candidate cannot become isolated override experiment",
    "unavailable candidate cannot become isolated override experiment",
    "missing override candidate returns blocked or failed",
    "candidate must be legal and available",
    "isolated experiment cannot mutate normal full-match score",
    "isolated experiment cannot mutate normal full-match scoring events",
    "isolated experiment cannot create production scoring events",
    "isolated experiment cannot mutate production route resolution",
    "isolated experiment cannot mutate global route success rates",
    "isolated experiment cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchIsolatedMiniMatchOverrideExperimentGuard();

  console.log("fullMatchIsolatedMiniMatchOverrideExperimentGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
