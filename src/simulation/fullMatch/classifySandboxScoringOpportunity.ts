import type {
  SandboxScoringOpportunityFamily,
  SandboxScoringOpportunityPathResult,
  SandboxScoringOpportunityType,
} from "./sandboxScoringOpportunityModel";

function classifyType(input: {
  readonly actionType?: string;
  readonly routeOutcome?: string;
  readonly dangerProbability: number;
  readonly scoringOpportunityProbability: number;
  readonly turnoverRisk: number;
}): SandboxScoringOpportunityType {
  if (input.actionType === "SAFE_RECYCLE" || input.routeOutcome === "safe_retention") {
    return input.scoringOpportunityProbability >= 12 && input.dangerProbability >= 35 ? "half_chance" : "no_opportunity";
  }

  if (input.actionType === "DROP_GOAL_ATTEMPT") {
    return "drop_window";
  }

  if (input.actionType === "TRY_TOUCHDOWN_ATTEMPT") {
    return "try_window";
  }

  if (input.actionType === "SHOT") {
    return "shot_window";
  }

  if (input.scoringOpportunityProbability >= 45 && input.turnoverRisk <= 45) {
    return "clear_chance";
  }

  if (input.scoringOpportunityProbability >= 18 && input.dangerProbability >= 55) {
    return "half_chance";
  }

  return "no_opportunity";
}

function familyForType(type: SandboxScoringOpportunityType): SandboxScoringOpportunityFamily {
  switch (type) {
    case "drop_window":
      return "drop";
    case "shot_window":
      return "shot";
    case "try_window":
      return "try";
    case "clear_chance":
    case "half_chance":
      return "territorial_danger";
    case "no_opportunity":
      return "none";
  }
}

export function classifySandboxScoringOpportunity(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly routeOutcome?: string;
  readonly dangerProbability: number;
  readonly scoringOpportunityProbability: number;
  readonly turnoverRisk: number;
  readonly receptionQuality: number;
  readonly defensivePressure: number;
}): SandboxScoringOpportunityPathResult {
  const opportunityType = classifyType(input);
  const opportunityFamily = familyForType(opportunityType);
  const opportunityCreated = opportunityType !== "no_opportunity";

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.routeOutcome === undefined ? {} : { routeOutcome: input.routeOutcome }),
    sourceDangerProbability: input.dangerProbability,
    sourceScoringOpportunityProbability: input.scoringOpportunityProbability,
    turnoverRisk: input.turnoverRisk,
    receptionQuality: input.receptionQuality,
    defensivePressure: input.defensivePressure,
    opportunityType,
    opportunityFamily,
    opportunityProbability: input.scoringOpportunityProbability,
    opportunityCreated,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    tags: [
      `sandbox_opportunity_${input.pathId}_candidate_${input.candidateId ?? "none"}`,
      `sandbox_opportunity_${input.pathId}_action_${input.actionType ?? "none"}`,
      `sandbox_opportunity_${input.pathId}_receiver_${input.receiverId ?? "none"}`,
      `sandbox_opportunity_${input.pathId}_zone_${input.targetZone ?? "none"}`,
      `sandbox_opportunity_${input.pathId}_route_outcome_${input.routeOutcome ?? "none"}`,
      `sandbox_opportunity_${input.pathId}_type_${opportunityType}`,
      `sandbox_opportunity_${input.pathId}_family_${opportunityFamily}`,
      `sandbox_opportunity_${input.pathId}_probability_${input.scoringOpportunityProbability}`,
      `sandbox_opportunity_${input.pathId}_created_${opportunityCreated ? "true" : "false"}`,
      `sandbox_opportunity_${input.pathId}_source_danger_probability_${input.dangerProbability}`,
      `sandbox_opportunity_${input.pathId}_source_scoring_opportunity_probability_${input.scoringOpportunityProbability}`,
      `sandbox_opportunity_${input.pathId}_turnover_risk_${input.turnoverRisk}`,
      `sandbox_opportunity_${input.pathId}_reception_quality_${input.receptionQuality}`,
      `sandbox_opportunity_${input.pathId}_defensive_pressure_${input.defensivePressure}`,
    ],
    warnings: [],
  };
}
