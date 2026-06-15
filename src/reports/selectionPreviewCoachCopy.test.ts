import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildSelectionPreviewCoachCopyModel } from "./buildSelectionPreviewCoachCopy";
import type { SelectionPreviewTraceBackingModel } from "../simulation/fullMatch/selectionPreviewTraceBacking";

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

  assertTest(fact !== undefined, "trace backing fact must exist.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_status_available"), "trace backing must be available.");

  const supports = ["support_near_z4_hsr", "second_ball_presence", "strong_goalkeeper_response"].map((previewId) => ({
    previewId: previewId as "support_near_z4_hsr" | "second_ball_presence" | "strong_goalkeeper_response",
    linkedCoachTestId: previewId,
    previousBackingStatus: "sandbox_only" as const,
    newBackingStatus: fact.internalTags.some((tag) => tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`))
      ? "trace_supported" as const
      : "sandbox_only" as const,
    supportStrength: "medium" as const,
    supportReasons: [],
    officialAggregateTraceCount: 1,
    matchedDangerZones: ["Z5-HSR"],
    matchedRecoveryZones: ["Z4-HSR"],
    matchedCauseLabels: [],
    matchedImpactLabels: [],
    matchedPlayerIds: [],
    traceSupported: fact.internalTags.some((tag) => tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`)),
    officiallyConfirmed: false as const,
    previewStillNonApplied: true as const,
    canChangeLineup: false as const,
    canChangeStarters: false as const,
    canChangeBench: false as const,
    canDriveCoachInstruction: false as const,
    canDriveLiveSelection: false as const,
    canDriveProductionRouteResolution: false as const,
    canMutateTimeline: false as const,
    canMutateScore: false as const,
    canMutatePossession: false as const,
    canCreateScoringEvent: false as const,
    canClaimGlobalEconomy: false as const,
    confidenceUpgradeAllowed: false as const,
    warnings: [],
  }));

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

export function validateSelectionPreviewCoachCopy(): readonly string[] {
  const model = buildSelectionPreviewCoachCopyModel({
    traceBackingModel: traceBackingModelFromReport(),
  });

  assertTest(model.status === "available", "coach copy model must be available.");
  assertTest(model.cardCount === 3, "coach copy must build 3 cards.");
  assertTest(model.originLabelCount === 3, "all cards must expose origin labels.");
  assertTest(model.traceSupportLabelCount === 3, "all cards must expose support labels.");
  assertTest(model.decisionLabelCount === 3, "all cards must expose decision labels.");
  assertTest(model.confirmationLabelCount === 3, "all cards must expose confirmation labels.");
  assertTest(model.officiallyConfirmedCount === 0, "coach copy must not create official confirmation.");
  assertTest(model.confidenceUpgradeCount === 0, "coach copy must not upgrade confidence.");
  assertTest(model.previewAppliedCount === 0, "coach copy must not apply preview.");
  assertTest(model.tags.includes("selection_preview_coach_copy_status_available"), "status tag must be emitted.");
  assertTest(model.tags.includes("selection_preview_coach_copy_card_count_3"), "card count tag must be emitted.");
  assertTest(model.cards.every((card) => card.confirmationLabel === "Confirmation : non confirmée comme recommandation officielle"), "confirmation wording must be non-official.");

  return [
    "coach copy model available",
    "three coach copy cards built",
    "origin, support, decision, and confirmation labels present",
    "official confirmation count remains 0",
    "confidence is not upgraded",
    "preview remains non-applied",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopy();

  console.log("selectionPreviewCoachCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
