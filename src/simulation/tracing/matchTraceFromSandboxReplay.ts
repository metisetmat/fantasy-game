import {
  createMatchTraceEvent,
  type MatchTraceActionType,
  type MatchTraceEvent,
  type MatchTraceOutcome,
  type MatchTracePhase,
} from "./matchTraceEvent";

export type SandboxReplayEventLike = {
  readonly sandboxEventId?: string;
  readonly sourceStepId?: string;
  readonly sandboxIndex?: number;
  readonly sandboxMinuteOffset?: number;
  readonly eventType?: string;
  readonly sourceStepType?: string;
  readonly actorId?: string;
  readonly teamCandidate?: string;
  readonly targetZone?: string;
  readonly outcome?: string;
  readonly confidence?: number;
  readonly createsOfficialMatchEvent?: false;
  readonly insertedIntoOfficialTimeline?: false;
  readonly mutatesOfficialTimeline?: false;
  readonly mutatesOfficialPossession?: false;
  readonly mutatesOfficialScore?: false;
  readonly mutatesOfficialScoringEvents?: false;
  readonly createsProductionScoringEvent?: false;
  readonly mutatesProductionRouteResolution?: false;
  readonly reasons?: readonly string[];
  readonly tags?: readonly string[];
  readonly warnings?: readonly string[];
};

function phaseForSandbox(eventType: string | undefined): MatchTracePhase {
  const normalized = eventType ?? "";

  if (normalized.includes("goalkeeper")) {
    return "GOALKEEPER_SEQUENCE";
  }
  if (normalized.includes("shot") || normalized.includes("scoring")) {
    return "FINAL_ZONE_ATTACK";
  }
  if (normalized.includes("route") || normalized.includes("continuation")) {
    return "PROGRESSION";
  }
  if (normalized.includes("rebound")) {
    return "OFFENSIVE_TRANSITION";
  }

  return "UNKNOWN";
}

function actionForSandbox(event: SandboxReplayEventLike): MatchTraceActionType {
  const combined = `${event.eventType ?? ""} ${event.sourceStepType ?? ""}`.toLowerCase();

  if (combined.includes("goalkeeper_response")) {
    return "GOALKEEPER_SAVE";
  }
  if (combined.includes("shot")) {
    return "SHOT";
  }
  if (combined.includes("rebound") || combined.includes("second")) {
    return "SECOND_BALL_CONTEST";
  }
  if (combined.includes("continuation")) {
    return "SUPPORT_RUN";
  }
  if (combined.includes("route")) {
    return "PASS";
  }

  return "TACTICAL_SHIFT";
}

function outcomeForSandbox(event: SandboxReplayEventLike): MatchTraceOutcome {
  const eventType = (event.eventType ?? "").toLowerCase();
  const outcome = (event.outcome ?? "").toLowerCase();
  const combined = `${eventType} ${outcome}`;

  if (combined.includes("save")) {
    return "SAVE_MADE";
  }
  if (
    outcome.includes("score") ||
    outcome.includes("goal") ||
    eventType.includes("scoring_event") ||
    eventType.includes("score_created")
  ) {
    return "SCORE_CREATED";
  }
  if (combined.includes("second_chance")) {
    return "SECOND_CHANCE_CREATED";
  }
  if (combined.includes("danger")) {
    return "DANGER_CREATED";
  }
  if (combined.includes("no_") || combined.includes("blocked")) {
    return "NEUTRAL";
  }

  return "UNKNOWN";
}

export function matchTraceFromSandboxReplay(input: {
  readonly event: SandboxReplayEventLike;
  readonly matchId?: string;
  readonly minute?: number;
  readonly sequenceId?: string;
  readonly teamId: string;
  readonly opponentTeamId: string;
}): MatchTraceEvent {
  const phase = phaseForSandbox(input.event.eventType);
  const actionType = actionForSandbox(input.event);
  const outcome = outcomeForSandbox(input.event);

  return createMatchTraceEvent({
    traceId: `trace-sandbox-${input.event.sandboxEventId ?? input.event.sourceStepId ?? input.event.sandboxIndex ?? "event"}`,
    ...(input.event.sandboxEventId === undefined ? {} : { sourceEventId: input.event.sandboxEventId }),
    source: "sandbox_event",
    ...(input.matchId === undefined ? {} : { matchId: input.matchId }),
    minute: input.minute ?? input.event.sandboxMinuteOffset ?? 0,
    ...(input.sequenceId === undefined ? {} : { sequenceId: input.sequenceId }),
    teamId: input.event.teamCandidate ?? input.teamId,
    opponentTeamId: input.opponentTeamId,
    phase,
    zone: input.event.targetZone ?? "SANDBOX_ZONE",
    ...(input.event.targetZone === undefined ? {} : { targetZone: input.event.targetZone }),
    actionType,
    outcome,
    ...(input.event.actorId === undefined ? {} : { primaryPlayerId: input.event.actorId }),
    pressureLevel: "UNKNOWN",
    causeTags: input.event.reasons !== undefined && input.event.reasons.length > 0 ? ["good_decision"] : ["unknown_cause"],
    impactTags: outcome === "SAVE_MADE"
      ? ["shot_prevented"]
      : outcome === "SECOND_CHANCE_CREATED"
        ? ["second_chance_allowed"]
        : outcome === "DANGER_CREATED" || outcome === "SCORE_CREATED"
          ? ["danger_created"]
          : ["no_clear_impact"],
    dangerDelta: outcome === "DANGER_CREATED" || outcome === "SECOND_CHANCE_CREATED" || outcome === "SCORE_CREATED" ? 15 : 0,
    possessionValueDelta: 0,
    coachVisible: false,
    diagnosticWeight: input.event.confidence ?? 30,
    officialTruth: false,
    tags: [
      "match_event_trace_spine",
      "match_trace_source_sandbox_event",
      ...(input.event.tags ?? []),
    ],
    warnings: [
      ...(phase === "UNKNOWN" ? ["MATCH_TRACE_UNKNOWN_PHASE"] : []),
      ...(input.event.warnings ?? []),
    ],
  });
}
