import type {
  SandboxGoalkeeperResponse,
  SandboxScoringEventResolutionPathResult,
  SandboxScoringResolutionReason,
  SandboxScoringResolutionType,
} from "./sandboxScoringEventResolution";

function bounded(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function defensivePressure(input: {
  readonly candidateType?: string;
  readonly routeOutcome?: string;
  readonly defensivePressure?: number;
}): number {
  if (input.defensivePressure !== undefined) {
    return bounded(input.defensivePressure, 0, 100);
  }

  if (input.candidateType === "NO_SCORING_EVENT") {
    return 18;
  }

  if (input.routeOutcome === "dangerous_progression") {
    return 58;
  }

  return 45;
}

function receptionQuality(input: {
  readonly candidateType?: string;
  readonly routeOutcome?: string;
  readonly receptionQuality?: number;
}): number {
  if (input.receptionQuality !== undefined) {
    return bounded(input.receptionQuality, 0, 100);
  }

  if (input.candidateType === "NO_SCORING_EVENT") {
    return 86;
  }

  if (input.routeOutcome === "dangerous_progression") {
    return 72;
  }

  return 60;
}

function resolutionType(input: {
  readonly candidateType?: string;
  readonly conversionProbability: number;
}): SandboxScoringResolutionType {
  if (input.candidateType === "NO_SCORING_EVENT" || input.conversionProbability <= 0) {
    return "NO_SCORE_ATTEMPT";
  }

  if (input.candidateType === "TRY_CANDIDATE") {
    return "TRY_ATTEMPT_WINDOW";
  }

  if (input.candidateType === "DROP_CANDIDATE") {
    return "DROP_ATTEMPT_WINDOW";
  }

  if (input.candidateType === "SHOT_CANDIDATE") {
    return "SHOT_ON_TARGET";
  }

  return "NO_SCORE";
}

function shotQuality(input: {
  readonly candidateType?: string;
  readonly candidateProbability: number;
  readonly conversionProbability: number;
  readonly defensivePressure: number;
  readonly receptionQuality: number;
}): number {
  if (input.candidateType === "NO_SCORING_EVENT" || input.conversionProbability <= 0) {
    return 0;
  }

  const raw =
    input.candidateProbability +
    input.conversionProbability +
    Math.round(input.receptionQuality * 0.25) -
    Math.round(input.defensivePressure * 0.2);

  return bounded(raw, 42, 60);
}

function goalkeeperResponse(input: {
  readonly resolutionType: SandboxScoringResolutionType;
  readonly conversionProbability: number;
}): SandboxGoalkeeperResponse {
  if (input.resolutionType === "NO_SCORE_ATTEMPT") {
    return "not_applicable";
  }

  if (input.resolutionType === "SHOT_ON_TARGET" && input.conversionProbability < 18) {
    return "not_evaluated";
  }

  if (input.resolutionType === "SAVED_BY_GK") {
    return "save_success";
  }

  return "not_evaluated";
}

function reasons(input: {
  readonly candidateType?: string;
  readonly resolutionType: SandboxScoringResolutionType;
  readonly conversionProbability: number;
  readonly targetZone?: string;
  readonly defensivePressure: number;
  readonly receptionQuality: number;
  readonly goalkeeperResponse: SandboxGoalkeeperResponse;
}): readonly SandboxScoringResolutionReason[] {
  if (input.resolutionType === "NO_SCORE_ATTEMPT") {
    return ["NO_SCORING_CANDIDATE", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"];
  }

  const conversionReasons: SandboxScoringResolutionReason[] = input.conversionProbability < 18
    ? ["CONVERSION_PROBABILITY_LOW"]
    : ["CONVERSION_PROBABILITY_MEDIUM"];
  const targetReasons: SandboxScoringResolutionReason[] = input.targetZone?.startsWith("Z4") === true
    ? ["TARGET_ZONE_SUPPORTS_SHOT"]
    : [];
  const pressureReasons: SandboxScoringResolutionReason[] = input.defensivePressure >= 50
    ? ["DEFENSIVE_PRESSURE_LIMITS_FINISH"]
    : [];
  const receptionReasons: SandboxScoringResolutionReason[] = input.receptionQuality >= 60
    ? ["RECEPTION_QUALITY_SUPPORTS_ATTEMPT"]
    : [];
  const goalkeeperReasons: SandboxScoringResolutionReason[] = input.goalkeeperResponse === "not_evaluated"
    ? ["GOALKEEPER_RESPONSE_NOT_READY"]
    : input.goalkeeperResponse === "save_candidate"
      ? ["GOALKEEPER_SAVE_CANDIDATE"]
      : [];

  return [
    ...(input.candidateType === "SHOT_CANDIDATE" ? ["SHOT_CANDIDATE_AVAILABLE" as const] : []),
    ...conversionReasons,
    ...targetReasons,
    ...pressureReasons,
    ...receptionReasons,
    ...goalkeeperReasons,
    "SANDBOX_ONLY",
    "PRODUCTION_SCORING_FORBIDDEN",
  ];
}

export function resolveSandboxScoringEventCandidate(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly scoringCandidateType?: string;
  readonly scoringCandidateFamily?: string;
  readonly scoringCandidateProbability: number;
  readonly conversionProbability: number;
  readonly opportunityType?: string;
  readonly routeOutcome?: string;
  readonly defensivePressure?: number;
  readonly receptionQuality?: number;
}): SandboxScoringEventResolutionPathResult {
  const pressure = defensivePressure({
    ...(input.scoringCandidateType === undefined ? {} : { candidateType: input.scoringCandidateType }),
    ...(input.routeOutcome === undefined ? {} : { routeOutcome: input.routeOutcome }),
    ...(input.defensivePressure === undefined ? {} : { defensivePressure: input.defensivePressure }),
  });
  const reception = receptionQuality({
    ...(input.scoringCandidateType === undefined ? {} : { candidateType: input.scoringCandidateType }),
    ...(input.routeOutcome === undefined ? {} : { routeOutcome: input.routeOutcome }),
    ...(input.receptionQuality === undefined ? {} : { receptionQuality: input.receptionQuality }),
  });
  const type = resolutionType({
    ...(input.scoringCandidateType === undefined ? {} : { candidateType: input.scoringCandidateType }),
    conversionProbability: input.conversionProbability,
  });
  const quality = shotQuality({
    ...(input.scoringCandidateType === undefined ? {} : { candidateType: input.scoringCandidateType }),
    candidateProbability: input.scoringCandidateProbability,
    conversionProbability: input.conversionProbability,
    defensivePressure: pressure,
    receptionQuality: reception,
  });
  const keeperResponse = goalkeeperResponse({
    resolutionType: type,
    conversionProbability: input.conversionProbability,
  });
  const resultReasons = reasons({
    ...(input.scoringCandidateType === undefined ? {} : { candidateType: input.scoringCandidateType }),
    resolutionType: type,
    conversionProbability: input.conversionProbability,
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    defensivePressure: pressure,
    receptionQuality: reception,
    goalkeeperResponse: keeperResponse,
  });
  const shotAttemptCreated = type !== "NO_SCORE_ATTEMPT" && type !== "NO_SCORE";

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.scoringCandidateType === undefined ? {} : { sourceScoringCandidateType: input.scoringCandidateType }),
    ...(input.scoringCandidateFamily === undefined ? {} : { sourceScoringCandidateFamily: input.scoringCandidateFamily }),
    sourceScoringCandidateProbability: input.scoringCandidateProbability,
    sourceConversionProbability: input.conversionProbability,
    ...(input.opportunityType === undefined ? {} : { sourceOpportunityType: input.opportunityType }),
    ...(input.routeOutcome === undefined ? {} : { sourceRouteOutcome: input.routeOutcome }),
    resolutionType: type,
    shotAttemptCreated,
    shotQuality: quality,
    defensivePressure: pressure,
    receptionQuality: reception,
    goalkeeperResponse: keeperResponse,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: resultReasons,
    tags: [
      `sandbox_scoring_resolution_${input.pathId}_candidate_${input.candidateId ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_action_${input.actionType ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_receiver_${input.receiverId ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_zone_${input.targetZone ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_source_candidate_type_${input.scoringCandidateType ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_source_candidate_family_${input.scoringCandidateFamily ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_source_candidate_probability_${input.scoringCandidateProbability}`,
      `sandbox_scoring_resolution_${input.pathId}_conversion_probability_${input.conversionProbability}`,
      `sandbox_scoring_resolution_${input.pathId}_source_opportunity_type_${input.opportunityType ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_source_route_outcome_${input.routeOutcome ?? "none"}`,
      `sandbox_scoring_resolution_${input.pathId}_type_${type}`,
      `sandbox_scoring_resolution_${input.pathId}_shot_attempt_${shotAttemptCreated ? "true" : "false"}`,
      `sandbox_scoring_resolution_${input.pathId}_shot_quality_${quality}`,
      `sandbox_scoring_resolution_${input.pathId}_defensive_pressure_${pressure}`,
      `sandbox_scoring_resolution_${input.pathId}_reception_quality_${reception}`,
      `sandbox_scoring_resolution_${input.pathId}_goalkeeper_response_${keeperResponse}`,
      `sandbox_scoring_resolution_${input.pathId}_score_delta_0`,
      ...resultReasons.map((reason) => `sandbox_scoring_resolution_${input.pathId}_reason_${reason}`),
    ],
    warnings: [],
  };
}
