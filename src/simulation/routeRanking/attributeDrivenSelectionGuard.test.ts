import { applySpatialAttributeInfluenceToCandidates } from "./applySpatialAttributeInfluenceToCandidates";
import { guardAttributeDrivenSelection } from "./attributeDrivenSelectionGuard";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "./fixtures/attributeRankingContrast.fixture";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateAttributeDrivenSelectionGuard(): readonly string[] {
  const legalCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  });
  const closedCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  });
  const unavailableCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  });
  const legalWeakSide = legalCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const closedWeakSide = closedCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const unavailableWeakSide = unavailableCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const safeRecycle = legalCandidates.find((candidate) => candidate.candidateId === "safe-recycle");
  const missingActor = legalCandidates[0] === undefined
    ? undefined
    : {
        ...legalCandidates[0],
        actorId: "missing-actor",
      };

  assertTest(legalWeakSide !== undefined, "contrast fixture must include legal weak-side candidate.");
  assertTest(safeRecycle !== undefined, "contrast fixture must include safe recycle candidate.");
  assertTest(closedWeakSide !== undefined, "contrast fixture must include closed weak-side candidate.");
  assertTest(unavailableWeakSide !== undefined, "contrast fixture must include unavailable weak-side candidate.");

  if (legalWeakSide !== undefined && closedWeakSide !== undefined && unavailableWeakSide !== undefined && safeRecycle !== undefined) {
    const shotTargetZone = "Z5-C";
    const wrongTargetZone = "Z4-HSL";
    const { receiverId: _safeRecycleReceiverId, ...safeRecycleWithoutReceiver } = safeRecycle;
    const receiverlessWorkbench: TacticalWorkbenchFrame = {
      frameId: "receiverless-workbench",
      sequenceId: "test-sequence",
      actionId: "test-action",
      phase: "finishing",
      possessionTeamId: legalWeakSide.teamId,
      defendingTeamId: "BLITZ",
      ballCarrierId: legalWeakSide.actorId,
      ballZone: legalWeakSide.fromZone,
      attackingDirection: "left-to-right",
      playerPositions: [],
      teamShapeIntents: [],
      selectedAction: {
        actorId: legalWeakSide.actorId,
        fromZone: legalWeakSide.fromZone,
        targetZone: shotTargetZone,
        actionType: "SHOT",
      },
      rankedOptions: [],
    };
    const receiverlessMatchingCandidate: RouteCandidateAttributeContext = {
      ...safeRecycleWithoutReceiver,
      candidateId: "receiverless-shot-truth",
      actorId: legalWeakSide.actorId,
      fromZone: legalWeakSide.fromZone,
      targetZone: shotTargetZone,
      actionType: "SHOT",
    };
    const receiverlessWrongReceiverCandidate: RouteCandidateAttributeContext = {
      ...receiverlessMatchingCandidate,
      candidateId: "receiverless-shot-wrong-receiver",
      receiverId: "control-hook-link",
    };
    const receiverlessWrongTargetCandidate: RouteCandidateAttributeContext = {
      ...receiverlessMatchingCandidate,
      candidateId: "receiverless-shot-wrong-target",
      targetZone: wrongTargetZone,
    };
    const legalGuard = guardAttributeDrivenSelection({
      candidate: legalWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
    });
    const closedGuard = guardAttributeDrivenSelection({
      candidate: closedWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
    });
    const unavailableGuard = guardAttributeDrivenSelection({
      candidate: unavailableWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
      availability: "NOT_AVAILABLE_NOW",
    });
    const missingActorGuard = missingActor === undefined
      ? { valid: false, blockedReasons: [], warnings: [] }
      : guardAttributeDrivenSelection({
          candidate: missingActor,
          spatialContext: attributeRankingContrastSpatialContext,
          baseSelectedCandidateId: "safe-recycle",
          maxAttributeAdjustment: 12,
        });
    const receiverlessMatchGuard = guardAttributeDrivenSelection({
      candidate: receiverlessMatchingCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });
    const receiverlessWrongReceiverGuard = guardAttributeDrivenSelection({
      candidate: receiverlessWrongReceiverCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });
    const receiverlessWrongTargetGuard = guardAttributeDrivenSelection({
      candidate: receiverlessWrongTargetCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });

    assertTest(legalGuard.valid, "legal adjusted candidate must pass guard.");
    assertTest(
      closedGuard.blockedReasons.includes("CLOSED_LANE_NOT_OVERRIDABLE"),
      "closed lane must block attribute-driven selection flip.",
    );
    assertTest(
      unavailableGuard.blockedReasons.includes("CANDIDATE_NOT_AVAILABLE_NOW"),
      "NOT_AVAILABLE_NOW candidate must be blocked.",
    );
    assertTest(
      missingActorGuard.blockedReasons.includes("MISSING_ACTOR_IN_SPATIAL_CONTEXT"),
      "missing actor must block selection flip.",
    );
    assertTest(receiverlessMatchGuard.valid, "receiverless workbench truth candidate must pass exact guard.");
    assertTest(
      receiverlessWrongReceiverGuard.blockedReasons.includes("WORKBENCH_TRUTH_VIOLATION"),
      "receiverless workbench action must reject candidates that add a receiver.",
    );
    assertTest(
      receiverlessWrongTargetGuard.blockedReasons.includes("WORKBENCH_TRUTH_VIOLATION"),
      "receiverless workbench action must reject candidates with a different target zone.",
    );
  }

  return [
    "legal adjusted candidate passes guard",
    "closed lane cannot be overridden by attributes",
    "NOT_AVAILABLE_NOW cannot become selected by attributes",
    "missing actor blocks attribute-driven selection",
    "receiverless workbench truth requires exact receiver and target identity",
  ];
}

if (require.main === module) {
  const checks = validateAttributeDrivenSelectionGuard();

  console.log("attributeDrivenSelectionGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
