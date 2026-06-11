import type { FullMatchChainSegmentContext } from "./fullMatchChainSegmentContext";
import {
  emptyChainRouteCandidateInfluence,
  type ChainRouteCandidateInfluence,
  type ChainRouteCandidateInfluenceReason,
  type DiagnosticRouteCandidate,
  type FullMatchChainRouteCandidateInfluenceResult,
  type FullMatchChainRouteCandidateInfluenceStatus,
} from "./fullMatchChainRouteCandidateInfluence";

export function clampChainInfluenceDelta(value: number): number {
  return Math.max(-3, Math.min(5, Math.round(value)));
}

export function canCandidateReceiveChainInfluence(candidate: DiagnosticRouteCandidate): boolean {
  return candidate.laneState !== "CLOSED" && candidate.available;
}

export function chainInfluenceCannotOverrideAvailability(candidate: DiagnosticRouteCandidate): boolean {
  return candidate.laneState === "CLOSED" || !candidate.available;
}

function statusFromSegmentContext(context: FullMatchChainSegmentContext): FullMatchChainRouteCandidateInfluenceStatus {
  switch (context.status) {
    case "not_available":
      return "not_available";
    case "available":
      return "available";
    case "partial":
      return "partial";
    case "failed":
      return "failed";
  }
}

function supportsContinuity(actionType: string): boolean {
  return actionType === "FORWARD_PROGRESS" || actionType === "WEAK_SIDE_SWITCH" || actionType === "CARRY_OR_HOLD";
}

function rawDelta(input: {
  readonly segmentContext: FullMatchChainSegmentContext;
  readonly candidate: DiagnosticRouteCandidate;
}): number {
  let delta = 0;

  if (input.candidate.receiverId === input.segmentContext.finalCarrierId) {
    delta += 3;
  }

  if (input.candidate.targetZone === input.segmentContext.finalZone) {
    delta += 2;
  }

  if (supportsContinuity(input.candidate.actionType)) {
    delta += 1;
  }

  if (delta === 0 && input.candidate.actionType === "SAFE_RECYCLE") {
    delta -= 1;
  }

  return delta;
}

function reasonFor(input: {
  readonly candidate: DiagnosticRouteCandidate;
  readonly segmentContext: FullMatchChainSegmentContext;
  readonly rawDelta: number;
  readonly selectableAfterInfluence: boolean;
}): ChainRouteCandidateInfluenceReason {
  if (!input.selectableAfterInfluence && input.rawDelta > 0) {
    return "CANDIDATE_ILLEGAL_OR_UNAVAILABLE";
  }

  if (input.candidate.receiverId === input.segmentContext.finalCarrierId) {
    return "FINAL_CARRIER_ADVANCED_SUPPORT";
  }

  if (input.candidate.targetZone === input.segmentContext.finalZone) {
    return "FINAL_ZONE_RIGHT_HALF_SPACE_ACCESS";
  }

  if (supportsContinuity(input.candidate.actionType)) {
    return "CHAIN_CONTEXT_CONTINUITY";
  }

  return "CHAIN_CONTEXT_NOT_COMPATIBLE";
}

function blockedReasons(candidate: DiagnosticRouteCandidate): readonly string[] {
  return [
    ...(candidate.laneState === "CLOSED" ? ["CLOSED_LANE_NOT_OVERRIDABLE"] : []),
    ...(!candidate.available ? ["CANDIDATE_NOT_AVAILABLE_NOW"] : []),
  ];
}

function topSelectableByScore(candidates: readonly ChainRouteCandidateInfluence[], useInfluencedScore: boolean): ChainRouteCandidateInfluence | undefined {
  return candidates
    .filter((candidate) => candidate.selectableAfterInfluence)
    .sort((a, b) =>
      (useInfluencedScore ? b.influencedScore - a.influencedScore : b.baseScore - a.baseScore) ||
      b.baseScore - a.baseScore ||
      a.candidateId.localeCompare(b.candidateId),
    )[0];
}

export function buildDiagnosticRouteCandidatesForSegment(input: {
  readonly segmentLabel: string;
  readonly chainSegmentContext: FullMatchChainSegmentContext;
}): readonly DiagnosticRouteCandidate[] {
  if (input.chainSegmentContext.status === "not_available") {
    return [];
  }

  const finalCarrierId = input.chainSegmentContext.finalCarrierId ?? "control-space-hunter";
  const finalZone = input.chainSegmentContext.finalZone ?? "Z4-HSR";

  return [
    {
      candidateId: "chain-context-forward-progress-sh",
      actionType: "FORWARD_PROGRESS",
      receiverId: finalCarrierId,
      targetZone: finalZone,
      laneState: "OPEN",
      baseScore: 82,
      available: true,
    },
    {
      candidateId: "chain-context-safe-recycle-pv",
      actionType: "SAFE_RECYCLE",
      receiverId: "control-pivot",
      targetZone: "Z2-HSL",
      laneState: "OPEN",
      baseScore: 86,
      available: true,
    },
    {
      candidateId: "chain-context-closed-central-force",
      actionType: "CENTRAL_FORCE",
      receiverId: finalCarrierId,
      targetZone: finalZone,
      laneState: "CLOSED",
      baseScore: 90,
      available: true,
    },
    {
      candidateId: "chain-context-unavailable-switch",
      actionType: "WEAK_SIDE_SWITCH",
      receiverId: "control-right-piston",
      targetZone: finalZone,
      laneState: "OPEN",
      baseScore: 79,
      available: false,
    },
  ];
}

export function applyChainContextToRouteCandidates(input: {
  readonly segmentContext: FullMatchChainSegmentContext;
  readonly candidates: readonly DiagnosticRouteCandidate[];
}): FullMatchChainRouteCandidateInfluenceResult {
  if (input.segmentContext.status === "not_available" || input.candidates.length === 0) {
    return emptyChainRouteCandidateInfluence(input.segmentContext);
  }

  const influences = input.candidates.map((candidate): ChainRouteCandidateInfluence => {
    const theoreticalDelta = rawDelta({ segmentContext: input.segmentContext, candidate });
    const selectableAfterInfluence = canCandidateReceiveChainInfluence(candidate);
    const influenceDelta = selectableAfterInfluence ? clampChainInfluenceDelta(theoreticalDelta) : 0;
    const legalBeforeInfluence = candidate.laneState !== "CLOSED";
    const availableBeforeInfluence = candidate.available;

    return {
      candidateId: candidate.candidateId,
      actionType: candidate.actionType,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      ...(candidate.targetZone === undefined ? {} : { targetZone: candidate.targetZone }),
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      baseScore: candidate.baseScore,
      influenceDelta,
      influencedScore: candidate.baseScore + influenceDelta,
      reason: reasonFor({
        candidate,
        segmentContext: input.segmentContext,
        rawDelta: theoreticalDelta,
        selectableAfterInfluence,
      }),
      legalBeforeInfluence,
      availableBeforeInfluence,
      selectableAfterInfluence,
      blockedReasons: blockedReasons(candidate),
    };
  });
  const selectedBefore = topSelectableByScore(influences, false);
  const selectedAfter = topSelectableByScore(influences, true);
  const illegalCandidateBoostBlockedCount = input.candidates.filter((candidate) =>
    candidate.laneState === "CLOSED" && rawDelta({ segmentContext: input.segmentContext, candidate }) > 0
  ).length;
  const unavailableCandidateBoostBlockedCount = input.candidates.filter((candidate) =>
    !candidate.available && rawDelta({ segmentContext: input.segmentContext, candidate }) > 0
  ).length;

  return {
    status: statusFromSegmentContext(input.segmentContext),
    scope: "diagnostic_shadow_ranking",
    ...(input.segmentContext.segmentLabel === undefined ? {} : { segmentLabel: input.segmentContext.segmentLabel }),
    ...(input.segmentContext.chainId === undefined ? {} : { chainId: input.segmentContext.chainId }),
    ...(input.segmentContext.finalCarrierId === undefined ? {} : { finalCarrierId: input.segmentContext.finalCarrierId }),
    ...(input.segmentContext.finalZone === undefined ? {} : { finalZone: input.segmentContext.finalZone }),
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canDriveProductionSelection: false,
    candidateCount: input.candidates.length,
    influencedCandidateCount: influences.filter((candidate) => candidate.influenceDelta !== 0).length,
    positiveDeltaCount: influences.filter((candidate) => candidate.influenceDelta > 0).length,
    negativeDeltaCount: influences.filter((candidate) => candidate.influenceDelta < 0).length,
    illegalCandidateBoostBlockedCount,
    unavailableCandidateBoostBlockedCount,
    ...(selectedBefore === undefined ? {} : { selectedCandidateBefore: selectedBefore.candidateId }),
    ...(selectedAfter === undefined ? {} : { selectedCandidateAfterDiagnostic: selectedAfter.candidateId }),
    diagnosticSelectionChanged: selectedBefore?.candidateId !== selectedAfter?.candidateId,
    influences,
    tags: [
      "workbench_chain_route_candidate_influence",
      "route_candidate_influence_diagnostic_only",
      "route_candidate_influence_segment_1",
      "route_candidate_influence_score_mutation_forbidden",
      "route_candidate_influence_scoring_events_mutation_forbidden",
      "route_candidate_influence_closed_override_blocked",
      "route_candidate_influence_unavailable_override_blocked",
      ...(input.segmentContext.chainId === undefined ? [] : [`route_candidate_influence_chain_id_${input.segmentContext.chainId}`]),
      ...(input.segmentContext.finalCarrierId === undefined ? [] : [`route_candidate_influence_final_carrier_${input.segmentContext.finalCarrierId}`]),
      ...(input.segmentContext.finalZone === undefined ? [] : [`route_candidate_influence_final_zone_${input.segmentContext.finalZone}`]),
      `route_candidate_influence_candidate_count_${input.candidates.length}`,
      `route_candidate_influence_influenced_count_${influences.filter((candidate) => candidate.influenceDelta !== 0).length}`,
    ],
    warnings: input.segmentContext.warnings,
  };
}
