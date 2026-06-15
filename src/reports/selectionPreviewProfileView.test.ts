import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import type {
  SelectionPreviewTraceBackingModel,
  SelectionPreviewTraceSupport,
} from "../simulation/fullMatch/selectionPreviewTraceBacking";
import { buildSelectionPreviewCoachCopyModel } from "./buildSelectionPreviewCoachCopy";
import { buildSelectionPreviewProfileView } from "./buildSelectionPreviewProfileView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function traceBackingModelFromReport(): SelectionPreviewTraceBackingModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING"
  );
  const previewIds: readonly SelectionPreviewTraceSupport["previewId"][] = [
    "support_near_z4_hsr",
    "second_ball_presence",
    "strong_goalkeeper_response",
  ];

  assertTest(fact !== undefined, "trace backing fact must exist.");

  const supports: readonly SelectionPreviewTraceSupport[] = previewIds.map((previewId) => {
    const traceSupported = fact.internalTags.some((tag) =>
      tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`)
    );

    return {
      previewId,
      linkedCoachTestId: previewId,
      previousBackingStatus: "sandbox_only",
      newBackingStatus: traceSupported ? "trace_supported" : "sandbox_only",
      supportStrength: "medium",
      supportReasons: [],
      officialAggregateTraceCount: 1,
      matchedDangerZones: ["Z5-HSR"],
      matchedRecoveryZones: ["Z4-HSR"],
      matchedCauseLabels: [],
      matchedImpactLabels: [],
      matchedPlayerIds: [],
      traceSupported,
      officiallyConfirmed: false,
      previewStillNonApplied: true,
      canChangeLineup: false,
      canChangeStarters: false,
      canChangeBench: false,
      canDriveCoachInstruction: false,
      canDriveLiveSelection: false,
      canDriveProductionRouteResolution: false,
      canMutateTimeline: false,
      canMutateScore: false,
      canMutatePossession: false,
      canCreateScoringEvent: false,
      canClaimGlobalEconomy: false,
      confidenceUpgradeAllowed: false,
      warnings: [],
    };
  });

  return {
    status: "available",
    origin: "selection_preview_from_coach_test_plan_and_trace_aggregates",
    previewCount: supports.length,
    sandboxOnlyCount: supports.filter((support) => support.newBackingStatus === "sandbox_only").length,
    traceSupportedCount: supports.filter((support) => support.newBackingStatus === "trace_supported").length,
    officiallyConfirmedCount: 0,
    supports,
    selectionPreviewStillNonApplied: true,
    selectionPreviewStillSandboxAware: true,
    selectionPreviewConfidenceUpgraded: false,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewProfileView(): readonly string[] {
  const traceBackingModel = traceBackingModelFromReport();
  const coachCopy = buildSelectionPreviewCoachCopyModel({ traceBackingModel });
  const profileView = buildSelectionPreviewProfileView({
    coachCopyCards: coachCopy.cards,
    traceBackingModel,
  });

  assertTest(profileView.status === "available", "profile view model must exist.");
  assertTest(profileView.profileCardCount === 3, "profile view must build 3 profile cards.");
  assertTest(profileView.cards.every((card) => card.roleFamilies.length > 0), "each card must have a role family.");
  assertTest(profileView.cards.every((card) => card.usefulAttributes.length > 0), "each card must have useful attributes.");
  assertTest(profileView.cards.every((card) => card.whyObserve.length > 0), "each card must have why-observe content.");
  assertTest(profileView.cards.every((card) => card.officialTraceSupport.length > 0), "each card must have official trace support.");
  assertTest(profileView.cards.every((card) => card.expectedBenefit.length > 0), "each card must have expected benefit.");
  assertTest(profileView.cards.every((card) => card.tacticalRisk.length > 0), "each card must have tactical risk.");
  assertTest(profileView.cards.every((card) => card.nextMatchSignalToVerify.length > 0), "each card must have next-match signal.");
  assertTest(profileView.previewAppliedCount === 0, "profile view must remain non-applied.");
  assertTest(profileView.officiallyConfirmedCount === 0, "profile view must not officially confirm previews.");
  assertTest(profileView.confidenceUpgradeCount === 0, "profile view must not upgrade confidence.");
  assertTest(profileView.tags.includes("selection_preview_profile_view_status_available"), "profile view status tag must be emitted.");
  assertTest(profileView.tags.includes("selection_preview_profile_view_card_count_3"), "profile view card count tag must be emitted.");

  return [
    "profile view model exists",
    "three profile cards exist",
    "role families, useful attributes, why-observe, trace support, benefits, risks, and signals are present",
    "preview remains non-applied",
    "officially confirmed count is 0",
    "confidence upgrade count is 0",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileView();

  console.log("selectionPreviewProfileView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
