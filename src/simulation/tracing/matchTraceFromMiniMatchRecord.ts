import {
  createMatchTraceEvent,
  type MatchTraceActionType,
  type MatchTraceEvent,
  type MatchTraceOutcome,
  type MatchTracePhase,
  type MatchTracePressureLevel,
} from "./matchTraceEvent";

export type MiniMatchRecordLike = {
  readonly recordId?: string;
  readonly eventId?: string;
  readonly sequenceNumber?: number;
  readonly phase?: string;
  readonly zone?: string;
  readonly targetZone?: string;
  readonly actionType?: string;
  readonly outcome?: string;
  readonly primaryPlayerId?: string;
  readonly secondaryPlayerId?: string;
  readonly pressureLevel?: string;
  readonly officialTruth?: boolean;
  readonly tags?: readonly string[];
  readonly setup?: {
    readonly sequenceNumber?: number;
    readonly activeZone?: string;
    readonly pressureDescription?: string;
    readonly possessionTeam?: {
      readonly teamId?: string;
      readonly team?: {
        readonly teamId?: string;
      };
    };
    readonly pressingTeam?: {
      readonly teamId?: string;
      readonly team?: {
        readonly teamId?: string;
      };
    };
    readonly routeSelectionResult?: {
      readonly selectedActionType?: string;
      readonly targetZone?: string;
      readonly receiverId?: string;
    };
  };
  readonly result?: object;
};

function normalizedPhase(value: string | undefined): MatchTracePhase {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("build")) {
    return "BUILD_UP";
  }
  if (normalized.includes("progress") || normalized.includes("construction")) {
    return "PROGRESSION";
  }
  if (normalized.includes("transition") && normalized.includes("offensive")) {
    return "OFFENSIVE_TRANSITION";
  }
  if (normalized.includes("transition") && normalized.includes("defensive")) {
    return "DEFENSIVE_TRANSITION";
  }
  if (normalized.includes("finishing") || normalized.includes("shot")) {
    return "FINAL_ZONE_ATTACK";
  }

  return "UNKNOWN";
}

function normalizedAction(value: string | undefined): MatchTraceActionType {
  const normalized = value?.toUpperCase() ?? "";

  if (normalized.includes("SHOT")) {
    return "SHOT";
  }
  if (normalized.includes("TRY")) {
    return "TRY_ATTEMPT";
  }
  if (normalized.includes("DROP")) {
    return "DROP_ATTEMPT";
  }
  if (normalized.includes("CARRY") || normalized.includes("HOLD")) {
    return "CARRY";
  }
  if (normalized.includes("RECYCLE") || normalized.includes("PASS") || normalized.includes("PROGRESS")) {
    return "PASS";
  }
  if (normalized.includes("DUEL") || normalized.includes("CONTACT")) {
    return "DUEL";
  }
  if (normalized.includes("RECOVERY")) {
    return "RECOVERY";
  }

  return "TACTICAL_SHIFT";
}

function normalizedOutcome(value: string | undefined): MatchTraceOutcome {
  const normalized = value?.toUpperCase() ?? "";

  if (normalized.includes("SCORE") || normalized.includes("GOAL") || normalized.includes("TRY_TOUCHDOWN")) {
    return "SCORE_CREATED";
  }
  if (normalized.includes("SHOT")) {
    return "SHOT_CREATED";
  }
  if (normalized.includes("DANGER")) {
    return "DANGER_CREATED";
  }
  if (normalized.includes("TURNOVER") || normalized.includes("LOST")) {
    return "TURNOVER_CONCEDED";
  }
  if (normalized.includes("SUCCESS") || normalized.includes("AVAILABLE") || normalized.includes("SELECTED")) {
    return "SUCCESS";
  }
  if (normalized.includes("FAIL") || normalized.includes("REJECTED")) {
    return "FAILURE";
  }

  return "NEUTRAL";
}

function pressureLevel(value: string | undefined): MatchTracePressureLevel {
  const normalized = value?.toUpperCase() ?? "";

  if (normalized.includes("HIGH")) {
    return "HIGH";
  }
  if (normalized.includes("MEDIUM")) {
    return "MEDIUM";
  }
  if (normalized.includes("LOW")) {
    return "LOW";
  }

  return "UNKNOWN";
}

export function matchTraceFromMiniMatchRecord(input: {
  readonly record: MiniMatchRecordLike;
  readonly matchId?: string;
  readonly minute?: number;
  readonly sequenceId?: string;
  readonly teamId: string;
  readonly opponentTeamId: string;
}): MatchTraceEvent {
  const sequenceNumber = input.record.sequenceNumber ?? input.record.setup?.sequenceNumber ?? 0;
  const selectedAction = input.record.actionType ?? input.record.setup?.routeSelectionResult?.selectedActionType;
  const zone = input.record.zone ?? input.record.setup?.activeZone ?? "UNKNOWN_ZONE";
  const resultEventType = input.record.result !== undefined && "eventType" in input.record.result && typeof input.record.result.eventType === "string"
    ? input.record.result.eventType
    : undefined;
  const resultOutcome = input.record.result !== undefined && "outcome" in input.record.result && typeof input.record.result.outcome === "string"
    ? input.record.result.outcome
    : undefined;
  const phase = normalizedPhase(input.record.phase ?? resultEventType ?? selectedAction);
  const targetZone = input.record.targetZone ?? input.record.setup?.routeSelectionResult?.targetZone;
  const secondaryPlayerId = input.record.secondaryPlayerId ?? input.record.setup?.routeSelectionResult?.receiverId;

  return createMatchTraceEvent({
    traceId: `trace-mini-${input.record.recordId ?? input.record.eventId ?? `sequence-${sequenceNumber}`}`,
    ...(input.record.eventId === undefined ? {} : { sourceEventId: input.record.eventId }),
    source: "mini_match_record",
    ...(input.matchId === undefined ? {} : { matchId: input.matchId }),
    minute: input.minute ?? sequenceNumber,
    ...(input.sequenceId === undefined ? {} : { sequenceId: input.sequenceId }),
    teamId: input.record.setup?.possessionTeam?.teamId ?? input.record.setup?.possessionTeam?.team?.teamId ?? input.teamId,
    opponentTeamId: input.record.setup?.pressingTeam?.teamId ?? input.record.setup?.pressingTeam?.team?.teamId ?? input.opponentTeamId,
    phase,
    zone,
    ...(targetZone === undefined
      ? {}
      : { targetZone }),
    actionType: normalizedAction(selectedAction),
    outcome: normalizedOutcome(input.record.outcome ?? resultOutcome ?? selectedAction),
    ...(input.record.primaryPlayerId === undefined ? {} : { primaryPlayerId: input.record.primaryPlayerId }),
    ...(secondaryPlayerId === undefined
      ? {}
      : { secondaryPlayerId }),
    pressureLevel: pressureLevel(input.record.pressureLevel ?? input.record.setup?.pressureDescription),
    causeTags: selectedAction === undefined ? ["unknown_cause"] : ["good_decision"],
    impactTags: selectedAction === undefined ? ["no_clear_impact"] : ["possession_secured"],
    dangerDelta: normalizedAction(selectedAction) === "SHOT" || normalizedAction(selectedAction) === "TRY_ATTEMPT" ? 15 : 5,
    possessionValueDelta: 4,
    coachVisible: false,
    diagnosticWeight: 35,
    officialTruth: input.record.officialTruth ?? false,
    tags: [
      "match_event_trace_spine",
      "match_trace_source_mini_match_record",
      `match_trace_sequence_${sequenceNumber}`,
      ...(input.record.tags ?? []),
    ],
    warnings: phase === "UNKNOWN" ? ["MATCH_TRACE_UNKNOWN_PHASE"] : [],
  });
}
