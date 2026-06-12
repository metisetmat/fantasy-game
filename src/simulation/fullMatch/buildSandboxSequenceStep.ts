import type {
  SandboxSequenceStep,
  SandboxSequenceStepSource,
  SandboxSequenceStepType,
  SandboxSequenceTeamCandidate,
} from "./sandboxSequenceReplay";

export function buildSandboxSequenceStep(input: {
  readonly stepIndex: number;
  readonly stepType: SandboxSequenceStepType;
  readonly source: SandboxSequenceStepSource;
  readonly pathId: "baseline" | "override";
  readonly actorId?: string | undefined;
  readonly teamCandidate?: SandboxSequenceTeamCandidate | undefined;
  readonly targetZone?: string | undefined;
  readonly outcome?: string | undefined;
  readonly confidence?: number | undefined;
  readonly createsSandboxContinuation?: boolean | undefined;
  readonly reasons?: readonly string[] | undefined;
  readonly warnings?: readonly string[] | undefined;
}): SandboxSequenceStep {
  const stepId = `${input.pathId}-${input.stepIndex}-${input.stepType.toLowerCase()}`;
  const confidence = Math.max(0, Math.min(100, Math.round(input.confidence ?? 0)));

  return {
    stepId,
    stepIndex: input.stepIndex,
    stepType: input.stepType,
    source: input.source,
    pathId: input.pathId,
    ...(input.actorId === undefined ? {} : { actorId: input.actorId }),
    ...(input.teamCandidate === undefined ? {} : { teamCandidate: input.teamCandidate }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.outcome === undefined ? {} : { outcome: input.outcome }),
    confidence,
    createsSandboxContinuation: input.createsSandboxContinuation ?? false,
    createsSandboxMatchEvent: false,
    createsSandboxScoringEvent: false,
    createsOfficialMatchEvent: false,
    mutatesOfficialTimeline: false,
    mutatesOfficialPossession: false,
    mutatesOfficialScore: false,
    mutatesOfficialScoringEvents: false,
    createsProductionScoringEvent: false,
    reasons: input.reasons ?? ["SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [
      "sandbox_sequence_replay_step",
      `sandbox_sequence_${input.pathId}_step_${input.stepIndex}`,
      `sandbox_sequence_${input.pathId}_step_type_${input.stepType}`,
      `sandbox_sequence_${input.pathId}_step_source_${input.source}`,
      `sandbox_sequence_${input.pathId}_step_confidence_${confidence}`,
      ...(input.outcome === undefined ? [] : [`sandbox_sequence_${input.pathId}_step_outcome_${input.outcome}`]),
      ...(input.targetZone === undefined ? [] : [`sandbox_sequence_${input.pathId}_step_zone_${input.targetZone}`]),
      ...(input.actorId === undefined ? [] : [`sandbox_sequence_${input.pathId}_step_actor_${input.actorId}`]),
      ...(input.teamCandidate === undefined ? [] : [`sandbox_sequence_${input.pathId}_step_team_${input.teamCandidate}`]),
      `sandbox_sequence_${input.pathId}_step_creates_continuation_${input.createsSandboxContinuation === true ? "true" : "false"}`,
      "sandbox_sequence_step_match_event_created_false",
      "sandbox_sequence_step_scoring_event_created_false",
      "sandbox_sequence_step_official_match_event_created_false",
      "sandbox_sequence_step_official_timeline_mutation_false",
      "sandbox_sequence_step_official_possession_mutation_false",
      "sandbox_sequence_step_official_score_mutation_false",
      "sandbox_sequence_step_official_scoring_event_mutation_false",
      "sandbox_sequence_step_production_scoring_event_creation_false",
    ],
    warnings: input.warnings ?? [],
  };
}
