import type { EventOutcome, MatchEvent, MatchEventType } from "../../contracts/engineToCoach";
import {
  createMatchTraceEvent,
  type MatchTraceActionType,
  type MatchTraceCauseTag,
  type MatchTraceEvent,
  type MatchTraceImpactTag,
  type MatchTraceOutcome,
  type MatchTracePhase,
  type MatchTracePressureLevel,
} from "./matchTraceEvent";

function uniqueOrFallback<T extends string>(values: readonly T[], fallback: T): readonly T[] {
  return values.length === 0 ? [fallback] : [...new Set(values)];
}

function pressureLevel(value: string): MatchTracePressureLevel {
  switch (value) {
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    case "low":
      return "LOW";
    default:
      return "UNKNOWN";
  }
}

function phaseForEvent(event: MatchEvent): MatchTracePhase {
  if (event.eventType === "goalkeeper_action") {
    return "GOALKEEPER_SEQUENCE";
  }
  if (event.eventType === "scoring") {
    return "FINAL_ZONE_ATTACK";
  }
  if (event.eventType === "progression") {
    return "PROGRESSION";
  }
  if (event.eventType === "turnover" || event.eventType === "gain_possession" || event.eventType === "lose_possession") {
    return "DEFENSIVE_TRANSITION";
  }
  if (event.tags.includes("high_press") || event.tags.includes("pressure_high")) {
    return "HIGH_PRESS";
  }
  if (event.tags.includes("low_block")) {
    return "LOW_BLOCK";
  }
  if (event.tags.includes("mid_block")) {
    return "MID_BLOCK";
  }
  if (event.eventType === "kickoff" || event.eventType === "discipline") {
    return "SET_PIECE";
  }
  if (event.eventType === "tactical_shift") {
    return "BUILD_UP";
  }

  return "UNKNOWN";
}

function actionTypeForEvent(event: MatchEvent): MatchTraceActionType {
  const moveType = event.tacticalContext.moveType?.toLowerCase() ?? "";

  if (event.eventType === "scoring") {
    if (event.tags.includes("try_touchdown") || moveType.includes("try")) {
      return "TRY_ATTEMPT";
    }
    if (event.tags.includes("drop_goal") || moveType.includes("drop")) {
      return "DROP_ATTEMPT";
    }
    return "SHOT";
  }
  if (event.eventType === "goalkeeper_action") {
    return event.outcome === "success" || event.tags.some((tag) => tag.includes("save"))
      ? "GOALKEEPER_SAVE"
      : "GOALKEEPER_DISTRIBUTION";
  }
  if (event.eventType === "progression") {
    if (moveType.includes("carry")) {
      return "CARRY";
    }
    return "PASS";
  }
  if (event.eventType === "duel") {
    return "DUEL";
  }
  if (event.eventType === "defensive_action") {
    return event.tags.includes("interception") ? "INTERCEPTION" : "PRESSURE";
  }
  if (event.eventType === "turnover" || event.eventType === "gain_possession") {
    return "RECOVERY";
  }
  if (event.eventType === "fatigue_error" || event.eventType === "tactical_shift") {
    return "TACTICAL_SHIFT";
  }

  return "UNKNOWN";
}

function outcomeForEvent(event: MatchEvent): MatchTraceOutcome {
  const hasScoreChange = event.consequences.some((consequence) => consequence.type === "score_change");

  if (hasScoreChange || event.outcome === "score") {
    return "SCORE_CREATED";
  }
  if (event.eventType === "goalkeeper_action" && event.outcome === "success") {
    return "SAVE_MADE";
  }
  if (event.eventType === "turnover" || event.eventType === "lose_possession") {
    return "TURNOVER_CONCEDED";
  }
  if (event.tags.includes("second_chance_created")) {
    return "SECOND_CHANCE_CREATED";
  }
  if (event.tags.includes("shot_created")) {
    return "SHOT_CREATED";
  }
  if (event.tags.includes("danger_high") || event.tags.includes("danger_created")) {
    return "DANGER_CREATED";
  }
  if (event.eventType === "progression" && event.outcome === "success") {
    return "LINE_BREAK_CREATED";
  }

  return eventOutcome(event.outcome);
}

function eventOutcome(outcome: EventOutcome): MatchTraceOutcome {
  switch (outcome) {
    case "success":
      return "SUCCESS";
    case "failure":
      return "FAILURE";
    case "neutral":
      return "NEUTRAL";
    case "advantage":
      return "DANGER_CREATED";
    case "score":
      return "SCORE_CREATED";
  }
}

function causeTagsForEvent(event: MatchEvent): readonly MatchTraceCauseTag[] {
  const tags: MatchTraceCauseTag[] = [];
  const eventTags = event.tags;

  if (eventTags.some((tag) =>
    tag.includes("speed") ||
    tag.includes("_tempo_fast") ||
    tag.includes("_transition_fast_break")
  )) {
    tags.push("speed_advantage");
  }
  if (eventTags.some((tag) =>
    tag.includes("power") ||
    tag.includes("_attacking_direct_pressure") ||
    tag.includes("_risk_high")
  )) {
    tags.push("power_advantage");
  }
  if (
    event.eventType === "fatigue_error" ||
    eventTags.some((tag) => tag.includes("fatigue")) ||
    (event.fatigueContext.primaryPlayerCondition ?? event.fatigueContext.teamCondition) <= 78 ||
    (event.fatigueContext.fatiguePressure ?? 0) >= 70
  ) {
    tags.push("fatigue_drop");
  }
  if (
    eventTags.includes("pressure_high") ||
    eventTags.some((tag) => tag.includes("_pressing_high") || tag.includes("_defensive_high_press")) ||
    event.eventType === "turnover"
  ) {
    tags.push("pressure_forced_error");
  }
  if (event.tags.some((tag) => tag.includes("support_good") || tag.includes("good_support"))) {
    tags.push("good_support");
  }
  if (event.tags.some((tag) => tag.includes("support_lack") || tag.includes("lack_of_support"))) {
    tags.push("lack_of_support");
  }
  if (event.eventType === "goalkeeper_action" || eventTags.some((tag) => tag.includes("goalkeeper"))) {
    tags.push("goalkeeper_quality");
  }
  if (event.outcome === "success" || event.outcome === "advantage" || event.outcome === "score") {
    tags.push("good_decision");
  }
  if (event.outcome === "failure") {
    tags.push("poor_decision");
  }
  if (eventTags.some((tag) => tag.includes("space"))) {
    tags.push("space_behind");
  }
  if (eventTags.some((tag) =>
    tag.includes("defensive_recovery") ||
    tag.includes("_defensive_low_block") ||
    tag.includes("_transition_delay_and_recover") ||
    tag.includes("_rest_defense_high")
  )) {
    tags.push("defensive_recovery");
  }
  if (event.tags.some((tag) => tag.includes("second_ball"))) {
    tags.push("second_ball_presence");
  }

  return uniqueOrFallback(tags, "unknown_cause");
}

function impactTagsForEvent(event: MatchEvent): readonly MatchTraceImpactTag[] {
  const tags: MatchTraceImpactTag[] = [];
  const consequenceTypes = new Set(event.consequences.map((consequence) => consequence.type));

  if (event.tags.includes("danger_high") || event.tags.includes("danger_created") || event.outcome === "advantage") {
    tags.push("danger_created");
  }
  if (event.eventType === "progression" && event.outcome === "success") {
    tags.push("line_broken");
  }
  if (consequenceTypes.has("fatigue_change") || event.eventType === "fatigue_error") {
    tags.push("fatigue_generated");
  }
  if (event.outcome === "success" && (event.eventType === "progression" || event.eventType === "gain_possession")) {
    tags.push("possession_secured");
  }
  if (event.eventType === "turnover" || event.eventType === "lose_possession" || consequenceTypes.has("possession_change")) {
    tags.push("possession_lost");
  }
  if (event.eventType === "fatigue_error" || event.tags.includes("chance_conceded")) {
    tags.push("chance_conceded");
  }
  if (event.eventType === "goalkeeper_action" && event.outcome === "success") {
    tags.push("shot_prevented");
  }
  if (event.tags.includes("second_chance_created")) {
    tags.push("second_chance_allowed");
  }
  if (event.tags.includes("rest_defense_exposed")) {
    tags.push("rest_defense_exposed");
  }

  return uniqueOrFallback(tags, "no_clear_impact");
}

export function matchTraceFromMatchEvent(input: {
  readonly event: MatchEvent;
}): MatchTraceEvent {
  const phase = phaseForEvent(input.event);
  const fatigueImpact = Math.max(
    0,
    Math.round((100 - input.event.fatigueContext.teamCondition) / 10) +
      Math.round((input.event.fatigueContext.fatiguePressure ?? 0) / 40),
  );

  return createMatchTraceEvent({
    traceId: `trace-official-${input.event.eventId}`,
    sourceEventId: input.event.eventId,
    source: "official_match_event",
    matchId: input.event.matchId,
    minute: input.event.timestamp.minute,
    sequenceId: input.event.sequenceId,
    teamId: input.event.teamId,
    opponentTeamId: input.event.opponentTeamId,
    phase,
    zone: input.event.zone,
    ...(input.event.tacticalContext.targetZone === undefined ? {} : { targetZone: input.event.tacticalContext.targetZone }),
    actionType: actionTypeForEvent(input.event),
    outcome: outcomeForEvent(input.event),
    ...(input.event.primaryPlayerId === undefined ? {} : { primaryPlayerId: input.event.primaryPlayerId }),
    ...(input.event.secondaryPlayerId === undefined ? {} : { secondaryPlayerId: input.event.secondaryPlayerId }),
    ...(input.event.opposingPlayerId === undefined ? {} : { opponentPlayerId: input.event.opposingPlayerId }),
    pressureLevel: pressureLevel(input.event.tacticalContext.pressureLevel),
    ...(input.event.fatigueContext.primaryPlayerCondition === undefined ? {} : { fatigueBefore: input.event.fatigueContext.primaryPlayerCondition }),
    ...(input.event.fatigueContext.teamCondition === undefined ? {} : { fatigueAfter: input.event.fatigueContext.teamCondition }),
    ...(fatigueImpact <= 0 ? {} : { fatigueImpact }),
    causeTags: causeTagsForEvent(input.event),
    impactTags: impactTagsForEvent(input.event),
    dangerDelta: input.event.tags.includes("danger_high") ? 20 : 0,
    possessionValueDelta: input.event.eventType === "turnover" ? -15 : input.event.outcome === "success" ? 8 : 0,
    coachVisible: input.event.narrativeWeight >= 55 || input.event.eventType === "scoring",
    diagnosticWeight: input.event.narrativeWeight,
    officialTruth: true,
    tags: [
      "match_event_trace_spine",
      "match_trace_source_official_match_event",
      `match_trace_action_${actionTypeForEvent(input.event).toLowerCase()}`,
      `match_trace_outcome_${outcomeForEvent(input.event).toLowerCase()}`,
    ],
    warnings: phase === "UNKNOWN" ? ["MATCH_TRACE_UNKNOWN_PHASE"] : [],
  });
}
