import type {
  SandboxScoringCandidateFamily,
  SandboxScoringCandidateReason,
  SandboxScoringCandidateType,
  SandboxScoringEventCandidatePathResult,
} from "./sandboxScoringEventCandidate";

function candidateType(input: {
  readonly opportunityType?: string;
  readonly opportunityFamily?: string;
  readonly opportunityProbability: number;
}): SandboxScoringCandidateType {
  if (input.opportunityType === "no_opportunity" || input.opportunityProbability < 12) {
    return "NO_SCORING_EVENT";
  }

  if (input.opportunityType === "try_window" || input.opportunityFamily === "try") {
    return "TRY_CANDIDATE";
  }

  if (input.opportunityType === "drop_window" || input.opportunityFamily === "drop") {
    return "DROP_CANDIDATE";
  }

  if (input.opportunityType === "shot_window" || input.opportunityFamily === "shot") {
    return "SHOT_CANDIDATE";
  }

  if (input.opportunityType === "half_chance" || input.opportunityFamily === "territorial_danger") {
    return "SHOT_CANDIDATE";
  }

  return "MIXED_CANDIDATE";
}

function familyForCandidate(type: SandboxScoringCandidateType): SandboxScoringCandidateFamily {
  switch (type) {
    case "NO_SCORING_EVENT":
      return "none";
    case "SHOT_CANDIDATE":
      return "shot";
    case "TRY_CANDIDATE":
      return "try";
    case "DROP_CANDIDATE":
      return "drop";
    case "MIXED_CANDIDATE":
      return "mixed";
  }
}

function conversionProbability(input: {
  readonly type: SandboxScoringCandidateType;
  readonly opportunityProbability: number;
  readonly dangerProbability: number;
}): number {
  if (input.type === "NO_SCORING_EVENT") {
    return 0;
  }

  const raw = Math.round(input.opportunityProbability * 0.45 + input.dangerProbability * 0.05);

  return Math.max(8, Math.min(15, raw));
}

function reasons(input: {
  readonly type: SandboxScoringCandidateType;
  readonly opportunityType?: string;
  readonly opportunityFamily?: string;
  readonly targetZone?: string;
}): readonly SandboxScoringCandidateReason[] {
  if (input.type === "NO_SCORING_EVENT") {
    return ["NO_OPPORTUNITY", "LOW_OPPORTUNITY_PROBABILITY", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"];
  }

  const opportunityReasons: SandboxScoringCandidateReason[] = input.opportunityType === "half_chance"
    ? ["HALF_CHANCE_TERRITORIAL_DANGER"]
    : input.opportunityType === "clear_chance"
      ? ["CLEAR_CHANCE"]
      : input.opportunityType === "try_window"
        ? ["TRY_WINDOW"]
        : input.opportunityType === "drop_window"
          ? ["DROP_WINDOW"]
          : input.opportunityType === "shot_window"
            ? ["SHOT_WINDOW"]
            : [];
  const targetReasons: SandboxScoringCandidateReason[] = input.targetZone?.startsWith("Z4") === true
    ? ["TARGET_ZONE_SUPPORTS_SHOT"]
    : [];

  return [...opportunityReasons, ...targetReasons, "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"];
}

export function createSandboxScoringEventCandidate(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly opportunityType?: string;
  readonly opportunityFamily?: string;
  readonly opportunityProbability: number;
  readonly routeOutcome?: string;
  readonly dangerProbability: number;
}): SandboxScoringEventCandidatePathResult {
  const scoringCandidateType = candidateType(input);
  const scoringCandidateFamily = familyForCandidate(scoringCandidateType);
  const scoringCandidateCreated = scoringCandidateType !== "NO_SCORING_EVENT";
  const scoringCandidateProbability = scoringCandidateCreated ? input.opportunityProbability : 0;
  const candidateConversionProbability = conversionProbability({
    type: scoringCandidateType,
    opportunityProbability: input.opportunityProbability,
    dangerProbability: input.dangerProbability,
  });
  const candidateReasons = reasons({
    type: scoringCandidateType,
    ...(input.opportunityType === undefined ? {} : { opportunityType: input.opportunityType }),
    ...(input.opportunityFamily === undefined ? {} : { opportunityFamily: input.opportunityFamily }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
  });

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.opportunityType === undefined ? {} : { sourceOpportunityType: input.opportunityType }),
    ...(input.opportunityFamily === undefined ? {} : { sourceOpportunityFamily: input.opportunityFamily }),
    sourceOpportunityProbability: input.opportunityProbability,
    ...(input.routeOutcome === undefined ? {} : { sourceRouteOutcome: input.routeOutcome }),
    sourceDangerProbability: input.dangerProbability,
    scoringCandidateType,
    scoringCandidateFamily,
    scoringCandidateCreated,
    scoringCandidateProbability,
    conversionProbability: candidateConversionProbability,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: candidateReasons,
    tags: [
      `sandbox_scoring_candidate_${input.pathId}_candidate_${input.candidateId ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_action_${input.actionType ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_receiver_${input.receiverId ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_zone_${input.targetZone ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_source_opportunity_type_${input.opportunityType ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_source_opportunity_family_${input.opportunityFamily ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_source_opportunity_probability_${input.opportunityProbability}`,
      `sandbox_scoring_candidate_${input.pathId}_source_route_outcome_${input.routeOutcome ?? "none"}`,
      `sandbox_scoring_candidate_${input.pathId}_source_danger_probability_${input.dangerProbability}`,
      `sandbox_scoring_candidate_${input.pathId}_type_${scoringCandidateType}`,
      `sandbox_scoring_candidate_${input.pathId}_family_${scoringCandidateFamily}`,
      `sandbox_scoring_candidate_${input.pathId}_probability_${scoringCandidateProbability}`,
      `sandbox_scoring_candidate_${input.pathId}_conversion_probability_${candidateConversionProbability}`,
      `sandbox_scoring_candidate_${input.pathId}_created_${scoringCandidateCreated ? "true" : "false"}`,
      ...candidateReasons.map((reason) => `sandbox_scoring_candidate_${input.pathId}_reason_${reason}`),
    ],
    warnings: [],
  };
}
