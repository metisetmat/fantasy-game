import type { ChainRouteCandidateInfluence, FullMatchChainRouteCandidateInfluenceResult } from "./fullMatchChainRouteCandidateInfluence";
import {
  candidateIdentity,
  emptyShadowRouteSelection,
  type FullMatchShadowRouteSelectionResult,
  type ShadowRouteSelectionDifferenceReason,
} from "./fullMatchShadowRouteSelection";

export function eligibleForShadowSelection(candidate: ChainRouteCandidateInfluence): boolean {
  return candidate.legalBeforeInfluence && candidate.availableBeforeInfluence && candidate.selectableAfterInfluence;
}

export function assertShadowSelectionDoesNotDriveProduction(selection: FullMatchShadowRouteSelectionResult): void {
  if (selection.canDriveProductionSelection) {
    throw new Error("Shadow route selection must never drive production selection.");
  }
}

export function shadowSelectionCannotOverrideAvailability(selection: FullMatchShadowRouteSelectionResult): boolean {
  return selection.selectedCandidateLegal && selection.selectedCandidateAvailable && !selection.canDriveProductionSelection;
}

function sortEligibleCandidates(
  candidates: readonly ChainRouteCandidateInfluence[],
): readonly ChainRouteCandidateInfluence[] {
  return [...candidates].sort((a, b) =>
    b.influencedScore - a.influencedScore ||
    b.influenceDelta - a.influenceDelta ||
    b.baseScore - a.baseScore ||
    a.candidateId.localeCompare(b.candidateId),
  );
}

function differenceReasons(input: {
  readonly influence: FullMatchChainRouteCandidateInfluenceResult;
  readonly productionCandidate: ChainRouteCandidateInfluence | undefined;
  readonly shadowCandidate: ChainRouteCandidateInfluence | undefined;
}): readonly ShadowRouteSelectionDifferenceReason[] {
  if (input.shadowCandidate === undefined || input.productionCandidate?.candidateId === input.shadowCandidate.candidateId) {
    return ["NO_DIAGNOSTIC_DIFFERENCE"];
  }

  return [
    ...(input.shadowCandidate.actionType === "FORWARD_PROGRESS" || input.shadowCandidate.actionType === "WEAK_SIDE_SWITCH" || input.shadowCandidate.actionType === "CARRY_OR_HOLD"
      ? ["CHAIN_CONTEXT_FAVORED_CONTINUITY" as const]
      : []),
    ...(input.shadowCandidate.receiverId === input.influence.finalCarrierId
      ? ["CHAIN_CONTEXT_FAVORED_FINAL_CARRIER" as const]
      : []),
    ...(input.shadowCandidate.targetZone === input.influence.finalZone
      ? ["CHAIN_CONTEXT_FAVORED_FINAL_ZONE" as const]
      : []),
    "PRODUCTION_SELECTION_IGNORES_CHAIN_CONTEXT",
    "PRODUCTION_SELECTION_FROM_SEGMENT_HARNESS",
  ];
}

function explanation(input: {
  readonly productionCandidate: ChainRouteCandidateInfluence | undefined;
  readonly shadowCandidate: ChainRouteCandidateInfluence | undefined;
  readonly changed: boolean;
}): string {
  if (input.shadowCandidate === undefined) {
    return "No legal and available candidate was eligible for shadow route selection.";
  }

  if (!input.changed) {
    return `Shadow route selection matches the production proxy ${input.shadowCandidate.candidateId}; no diagnostic difference is visible.`;
  }

  return `Shadow route selection prefers ${input.shadowCandidate.actionType} via ${input.shadowCandidate.candidateId} because chain context raises its influenced score to ${input.shadowCandidate.influencedScore}. The production selection proxy remains ${input.productionCandidate?.candidateId ?? "none"}, so this is an audit difference only and cannot drive production selection.`;
}

export function selectShadowRouteFromInfluencedCandidates(input: {
  readonly influence: FullMatchChainRouteCandidateInfluenceResult;
  readonly productionSelectionCandidateId?: string;
}): FullMatchShadowRouteSelectionResult {
  if (input.influence.status === "not_available") {
    return emptyShadowRouteSelection({
      ...(input.influence.segmentLabel === undefined ? {} : { segmentLabel: input.influence.segmentLabel }),
      ...(input.influence.chainId === undefined ? {} : { chainId: input.influence.chainId }),
      warnings: input.influence.warnings,
    });
  }

  const eligible = sortEligibleCandidates(input.influence.influences.filter(eligibleForShadowSelection));
  const shadowCandidate = eligible[0];
  const productionCandidate = input.influence.influences.find((candidate) => candidate.candidateId === input.productionSelectionCandidateId);
  const productionIdentity = candidateIdentity(productionCandidate);
  const shadowSelectionChangedFromProduction = shadowCandidate?.candidateId !== input.productionSelectionCandidateId;
  const closedCandidateRejectedCount = input.influence.influences.filter((candidate) => !candidate.legalBeforeInfluence).length;
  const unavailableCandidateRejectedCount = input.influence.influences.filter((candidate) => !candidate.availableBeforeInfluence).length;
  const blockedCandidateCount = input.influence.influences.length - eligible.length;
  const reasons = differenceReasons({
    influence: input.influence,
    productionCandidate,
    shadowCandidate,
  });
  const result: FullMatchShadowRouteSelectionResult = {
    status: input.influence.status,
    scope: "diagnostic_shadow_selection",
    ...(input.influence.segmentLabel === undefined ? {} : { segmentLabel: input.influence.segmentLabel }),
    ...(input.influence.chainId === undefined ? {} : { chainId: input.influence.chainId }),
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canDriveProductionSelection: false,
    ...(productionIdentity.candidateId === undefined ? {} : { productionSelectionCandidateId: productionIdentity.candidateId }),
    ...(productionIdentity.actionType === undefined ? {} : { productionSelectionActionType: productionIdentity.actionType }),
    ...(productionIdentity.receiverId === undefined ? {} : { productionSelectionReceiverId: productionIdentity.receiverId }),
    ...(productionIdentity.targetZone === undefined ? {} : { productionSelectionTargetZone: productionIdentity.targetZone }),
    ...(shadowCandidate === undefined ? {} : {
      shadowSelectionCandidateId: shadowCandidate.candidateId,
      shadowSelectionActionType: shadowCandidate.actionType,
      shadowSelectionBaseScore: shadowCandidate.baseScore,
      shadowSelectionInfluenceDelta: shadowCandidate.influenceDelta,
      shadowSelectionInfluencedScore: shadowCandidate.influencedScore,
    }),
    ...(shadowCandidate?.receiverId === undefined ? {} : { shadowSelectionReceiverId: shadowCandidate.receiverId }),
    ...(shadowCandidate?.targetZone === undefined ? {} : { shadowSelectionTargetZone: shadowCandidate.targetZone }),
    candidateCount: input.influence.candidateCount,
    eligibleCandidateCount: eligible.length,
    blockedCandidateCount,
    closedCandidateRejectedCount,
    unavailableCandidateRejectedCount,
    shadowSelectionChangedFromProduction,
    differenceReasons: reasons,
    explanation: explanation({
      productionCandidate,
      shadowCandidate,
      changed: shadowSelectionChangedFromProduction,
    }),
    selectedCandidateLegal: shadowCandidate?.legalBeforeInfluence ?? false,
    selectedCandidateAvailable: shadowCandidate?.availableBeforeInfluence ?? false,
    tags: [
      "workbench_chain_shadow_route_selection",
      "shadow_route_selection_diagnostic_only",
      `shadow_route_selection_changed_${shadowSelectionChangedFromProduction ? "true" : "false"}`,
      ...(shadowCandidate === undefined ? [] : [
        `shadow_route_selection_candidate_${shadowCandidate.candidateId}`,
        `shadow_route_selection_action_${shadowCandidate.actionType}`,
      ]),
      ...(shadowCandidate?.receiverId === undefined ? [] : [`shadow_route_selection_receiver_${shadowCandidate.receiverId}`]),
      ...(shadowCandidate?.targetZone === undefined ? [] : [`shadow_route_selection_zone_${shadowCandidate.targetZone}`]),
      "shadow_route_selection_production_forbidden",
      "shadow_route_selection_score_mutation_forbidden",
      "shadow_route_selection_scoring_events_mutation_forbidden",
      "shadow_route_selection_closed_candidates_rejected",
      "shadow_route_selection_unavailable_candidates_rejected",
      ...(input.influence.chainId === undefined ? [] : [`shadow_route_selection_chain_id_${input.influence.chainId}`]),
    ],
    warnings: input.influence.warnings,
  };

  assertShadowSelectionDoesNotDriveProduction(result);

  return result;
}
