import type { MatchId, PlayerId, SequenceId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type MatchTraceSource =
  | "official_match_event"
  | "mini_match_record"
  | "sandbox_event";

export type MatchTracePhase =
  | "BUILD_UP"
  | "PROGRESSION"
  | "OFFENSIVE_TRANSITION"
  | "DEFENSIVE_TRANSITION"
  | "FINAL_ZONE_ATTACK"
  | "HIGH_PRESS"
  | "MID_BLOCK"
  | "LOW_BLOCK"
  | "SET_PIECE"
  | "GOALKEEPER_SEQUENCE"
  | "UNKNOWN";

export type MatchTraceActionType =
  | "PASS"
  | "CARRY"
  | "DUEL"
  | "CONTACT"
  | "PRESSURE"
  | "SHOT"
  | "TRY_ATTEMPT"
  | "DROP_ATTEMPT"
  | "RECOVERY"
  | "INTERCEPTION"
  | "GOALKEEPER_SAVE"
  | "GOALKEEPER_DISTRIBUTION"
  | "SUPPORT_RUN"
  | "SECOND_BALL_CONTEST"
  | "TACTICAL_SHIFT"
  | "UNKNOWN";

export type MatchTraceOutcome =
  | "SUCCESS"
  | "FAILURE"
  | "NEUTRAL"
  | "LINE_BREAK_CREATED"
  | "DANGER_CREATED"
  | "SHOT_CREATED"
  | "SCORE_CREATED"
  | "TURNOVER_CONCEDED"
  | "RECOVERY_WON"
  | "SAVE_MADE"
  | "SECOND_CHANCE_CREATED"
  | "UNKNOWN";

export type MatchTraceCauseTag =
  | "speed_advantage"
  | "power_advantage"
  | "pressure_forced_error"
  | "fatigue_drop"
  | "lack_of_support"
  | "good_support"
  | "goalkeeper_quality"
  | "poor_decision"
  | "good_decision"
  | "space_behind"
  | "defensive_recovery"
  | "second_ball_presence"
  | "unknown_cause";

export type MatchTraceImpactTag =
  | "danger_created"
  | "line_broken"
  | "fatigue_generated"
  | "possession_secured"
  | "possession_lost"
  | "chance_conceded"
  | "shot_prevented"
  | "second_chance_allowed"
  | "rest_defense_exposed"
  | "no_clear_impact";

export type MatchTracePressureLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "UNKNOWN";

export type MatchTraceEvent = {
  readonly traceId: string;
  readonly sourceEventId?: string;
  readonly source: MatchTraceSource;
  readonly matchId?: MatchId;
  readonly minute: number;
  readonly sequenceId?: SequenceId;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly phase: MatchTracePhase;
  readonly zone: ZoneId | string;
  readonly targetZone?: ZoneId | string;
  readonly actionType: MatchTraceActionType;
  readonly outcome: MatchTraceOutcome;
  readonly primaryPlayerId?: PlayerId | string;
  readonly secondaryPlayerId?: PlayerId | string;
  readonly opponentPlayerId?: PlayerId | string;
  readonly goalkeeperId?: PlayerId | string;
  readonly pressureLevel: MatchTracePressureLevel;
  readonly fatigueBefore?: number;
  readonly fatigueAfter?: number;
  readonly fatigueImpact?: number;
  readonly causeTags: readonly MatchTraceCauseTag[];
  readonly impactTags: readonly MatchTraceImpactTag[];
  readonly dangerDelta?: number;
  readonly possessionValueDelta?: number;
  readonly coachVisible: boolean;
  readonly diagnosticWeight: number;
  readonly officialTruth: boolean;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type MatchTraceEventInput = Omit<
  MatchTraceEvent,
  | "canMutateTimeline"
  | "canMutateScore"
  | "canMutatePossession"
  | "canCreateScoringEvent"
  | "canDriveCoachInstruction"
  | "canDriveLiveSelection"
  | "canDriveProductionRouteResolution"
  | "canClaimGlobalEconomy"
>;

export function createMatchTraceEvent(input: MatchTraceEventInput): MatchTraceEvent {
  return {
    ...input,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
  };
}

export function matchTraceCannotMutateOfficialState(trace: MatchTraceEvent): boolean {
  return !trace.canMutateTimeline &&
    !trace.canMutateScore &&
    !trace.canMutatePossession &&
    !trace.canCreateScoringEvent;
}

export function matchTraceCannotDriveProduction(trace: MatchTraceEvent): boolean {
  return !trace.canDriveCoachInstruction &&
    !trace.canDriveLiveSelection &&
    !trace.canDriveProductionRouteResolution &&
    !trace.canClaimGlobalEconomy;
}

export function validateMatchTraceEvent(trace: MatchTraceEvent): readonly string[] {
  return [
    ...(trace.traceId.length === 0 ? ["MATCH_TRACE_MISSING_TRACE_ID"] : []),
    ...(trace.source.length === 0 ? ["MATCH_TRACE_MISSING_SOURCE"] : []),
    ...(trace.phase === "UNKNOWN" && !trace.warnings.includes("MATCH_TRACE_UNKNOWN_PHASE")
      ? ["MATCH_TRACE_UNKNOWN_PHASE_NOT_EXPLAINED"]
      : []),
    ...(trace.zone.length === 0 ? ["MATCH_TRACE_MISSING_ZONE"] : []),
    ...(trace.causeTags.length === 0 ? ["MATCH_TRACE_MISSING_CAUSE_TAGS"] : []),
    ...(trace.impactTags.length === 0 ? ["MATCH_TRACE_MISSING_IMPACT_TAGS"] : []),
    ...(trace.diagnosticWeight < 0 || trace.diagnosticWeight > 100 ? ["MATCH_TRACE_DIAGNOSTIC_WEIGHT_OUT_OF_RANGE"] : []),
    ...(!matchTraceCannotMutateOfficialState(trace) ? ["MATCH_TRACE_MUTATION_GUARD_BREACH"] : []),
    ...(!matchTraceCannotDriveProduction(trace) ? ["MATCH_TRACE_PRODUCTION_GUARD_BREACH"] : []),
    ...(trace.source === "sandbox_event" && trace.officialTruth ? ["MATCH_TRACE_SANDBOX_MARKED_OFFICIAL"] : []),
  ];
}
