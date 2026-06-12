import type {
  ControlledRouteResolutionOutcome,
  ControlledRouteResolutionPathResult,
} from "./controlledRouteResolutionSandbox";

function blockedPath(input: {
  readonly pathId: "baseline" | "override";
  readonly segmentLabel: string;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly warning: string;
}): ControlledRouteResolutionPathResult {
  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    candidateLegal: input.candidateLegal,
    candidateAvailable: input.candidateAvailable,
    routeResolved: false,
    outcome: "failed_reception",
    possessionRetained: false,
    defensivePressure: 0,
    receptionQuality: 0,
    turnoverRisk: 100,
    dangerProbability: 0,
    scoringOpportunityProbability: 0,
    dangerCreated: false,
    scoringOpportunityCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    tags: [
      "controlled_route_resolution_sandbox",
      "sandbox_route_blocked",
      `sandbox_path_${input.pathId}`,
      `sandbox_segment_${input.segmentLabel}`,
    ],
    warnings: [input.warning],
  };
}

function resolvedPath(input: {
  readonly pathId: "baseline" | "override";
  readonly segmentLabel: string;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly outcome: ControlledRouteResolutionOutcome;
  readonly defensivePressure: number;
  readonly receptionQuality: number;
  readonly turnoverRisk: number;
  readonly dangerProbability: number;
  readonly scoringOpportunityProbability: number;
  readonly dangerCreated: boolean;
}): ControlledRouteResolutionPathResult {
  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    candidateLegal: true,
    candidateAvailable: true,
    routeResolved: true,
    outcome: input.outcome,
    possessionRetained: true,
    ...(input.receiverId === undefined ? {} : { resultingCarrierId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { resultingZone: input.targetZone }),
    defensivePressure: input.defensivePressure,
    receptionQuality: input.receptionQuality,
    turnoverRisk: input.turnoverRisk,
    dangerProbability: input.dangerProbability,
    scoringOpportunityProbability: input.scoringOpportunityProbability,
    dangerCreated: input.dangerCreated,
    scoringOpportunityCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    tags: [
      "controlled_route_resolution_sandbox",
      "sandbox_route_resolved",
      `sandbox_path_${input.pathId}`,
      `sandbox_segment_${input.segmentLabel}`,
      `sandbox_action_${input.actionType ?? "none"}`,
      `sandbox_receiver_${input.receiverId ?? "none"}`,
      `sandbox_zone_${input.targetZone ?? "none"}`,
      `sandbox_outcome_${input.outcome}`,
      "sandbox_result_isolated_only",
      "sandbox_official_match_event_forbidden",
      "sandbox_official_score_mutation_forbidden",
      "sandbox_official_scoring_event_creation_forbidden",
    ],
    warnings: [],
  };
}

export function resolveControlledRouteInSandbox(input: {
  readonly pathId: "baseline" | "override";
  readonly segmentLabel: string;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
}): ControlledRouteResolutionPathResult {
  if (!input.candidateLegal) {
    return blockedPath({
      ...input,
      warning: "CONTROLLED_ROUTE_SANDBOX_REJECTED_CLOSED_OR_ILLEGAL_CANDIDATE",
    });
  }

  if (!input.candidateAvailable) {
    return blockedPath({
      ...input,
      warning: "CONTROLLED_ROUTE_SANDBOX_REJECTED_UNAVAILABLE_CANDIDATE",
    });
  }

  if (
    input.pathId === "override" &&
    input.candidateId === "chain-context-forward-progress-sh" &&
    input.actionType === "FORWARD_PROGRESS" &&
    input.receiverId === "control-space-hunter" &&
    input.targetZone === "Z4-HSR"
  ) {
    return resolvedPath({
      ...input,
      outcome: "dangerous_progression",
      defensivePressure: 58,
      receptionQuality: 72,
      turnoverRisk: 34,
      dangerProbability: 64,
      scoringOpportunityProbability: 24,
      dangerCreated: true,
    });
  }

  if (
    input.pathId === "baseline" &&
    input.candidateId === "chain-context-safe-recycle-pv" &&
    input.actionType === "SAFE_RECYCLE" &&
    input.receiverId === "control-pivot" &&
    input.targetZone === "Z2-HSL"
  ) {
    return resolvedPath({
      ...input,
      outcome: "safe_retention",
      defensivePressure: 31,
      receptionQuality: 86,
      turnoverRisk: 12,
      dangerProbability: 18,
      scoringOpportunityProbability: 5,
      dangerCreated: false,
    });
  }

  return resolvedPath({
    ...input,
    outcome: input.actionType === "FORWARD_PROGRESS" ? "progressive_retention" : "safe_retention",
    defensivePressure: input.actionType === "FORWARD_PROGRESS" ? 52 : 34,
    receptionQuality: input.actionType === "FORWARD_PROGRESS" ? 68 : 78,
    turnoverRisk: input.actionType === "FORWARD_PROGRESS" ? 29 : 16,
    dangerProbability: input.actionType === "FORWARD_PROGRESS" ? 46 : 19,
    scoringOpportunityProbability: input.actionType === "FORWARD_PROGRESS" ? 15 : 5,
    dangerCreated: input.actionType === "FORWARD_PROGRESS",
  });
}
