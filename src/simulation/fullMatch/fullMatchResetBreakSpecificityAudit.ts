import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";

export type ResetBreakSpecificityWarningCode =
  | "POST_SCORE_RESET_MISSING"
  | "POST_SCORE_RESET_UNPROTECTED"
  | "CONCEDING_TEAM_FIRST_POSSESSION_TOO_LOW"
  | "CONCEDING_TEAM_FIRST_POSSESSION_LOST_TOO_FAST"
  | "SCORING_TEAM_IMMEDIATE_REATTACK_TOO_HIGH"
  | "SCORING_TEAM_REATTACK_AFTER_PROTECTED_RESET"
  | "RESET_EXISTS_BUT_DOES_NOT_BREAK_DOMINANCE"
  | "RESET_TO_DANGER_TOO_FAST"
  | "RESET_TO_NEUTRAL_CONNECTED"
  | "RESET_TO_SAFE_POSSESSION_CONNECTED";

export interface FullMatchResetBreakSpecificityAudit {
  readonly matchId: string;
  readonly postScoreWindowsChecked: number;
  readonly resetEventCreatedCount: number;
  readonly protectedResetCount: number;
  readonly protectedResetRate: number;
  readonly unprotectedResetCount: number;
  readonly missingResetCount: number;
  readonly concedingTeamFirstPossessionCount: number;
  readonly concedingTeamFirstPossessionRate: number;
  readonly concedingTeamFirstPossessionNeutralCount: number;
  readonly concedingTeamFirstPossessionDangerCount: number;
  readonly concedingTeamFirstPossessionTurnoverCount: number;
  readonly concedingTeamFirstPossessionLostImmediatelyCount: number;
  readonly scoringTeamImmediateReattackCount: number;
  readonly scoringTeamImmediateReattackRate: number;
  readonly scoringTeamImmediateReattackAfterProtectedResetCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly resetBreaksDominanceRate: number;
  readonly resetFailedToBreakDominanceCount: number;
  readonly resetFailedReasonCodes: readonly string[];
  readonly resetToNeutralRate: number;
  readonly resetToSafePossessionRate: number;
  readonly resetToImmediateDangerRate: number;
  readonly resetBreakWarningCodes: readonly ResetBreakSpecificityWarningCode[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function normalizedTags(event: MatchEvent): readonly string[] {
  return event.tags.map((tag) => tag.toLowerCase());
}

function hasTag(event: MatchEvent, value: string): boolean {
  return normalizedTags(event).some((tag) => tag.includes(value));
}

function isReset(event: MatchEvent): boolean {
  return hasTag(event, "post_score_reset_protected") ||
    hasTag(event, "goalkeeper_secure_possession_reset") ||
    hasTag(event, "safe_restart") ||
    hasTag(event, "neutral_restart") ||
    hasTag(event, "official_route_family_continuation") ||
    event.outcome === "neutral";
}

function isOpportunity(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    hasTag(event, "official_route_family_shot_goal") ||
    hasTag(event, "official_route_family_try_touchdown") ||
    hasTag(event, "official_route_family_drop_goal");
}

function isTurnover(event: MatchEvent): boolean {
  return event.eventType === "turnover" || hasTag(event, "turnover") || hasTag(event, "lost_forward");
}

function isPossessionEvent(event: MatchEvent): boolean {
  return isReset(event) ||
    isOpportunity(event) ||
    isTurnover(event) ||
    event.eventType === "progression" ||
    event.eventType === "scoring" ||
    event.outcome === "neutral";
}

function opposingTeamId(report: MatchReport, teamId: TeamId): TeamId {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  return teamId === homeTeamId ? (awayTeamId ?? teamId) : (homeTeamId ?? teamId);
}

function sortedTimeline(report: MatchReport): readonly MatchEvent[] {
  return [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
}

export function auditFullMatchResetBreakSpecificity(report: MatchReport): FullMatchResetBreakSpecificityAudit {
  const timeline = sortedTimeline(report);
  const scoringEvents = timeline.filter((event) => scoreChangePoints(event) > 0);
  let resetEventCreatedCount = 0;
  let protectedResetCount = 0;
  let unprotectedResetCount = 0;
  let missingResetCount = 0;
  let concedingFirst = 0;
  let concedingNeutral = 0;
  let concedingDanger = 0;
  let concedingTurnover = 0;
  let concedingLostImmediately = 0;
  let scoringReattack = 0;
  let scoringReattackAfterProtected = 0;
  let resetBreaksDominance = 0;
  let resetFailed = 0;
  let resetToImmediateDanger = 0;
  let resetToSafe = 0;
  let resetToNeutral = 0;

  for (const scoringEvent of scoringEvents) {
    const scoringIndex = timeline.findIndex((event) => event.eventId === scoringEvent.eventId);
    const later = timeline.slice(scoringIndex + 1);
    const scoringTeamId = scoringEvent.teamId;
    const concedingTeamId = opposingTeamId(report, scoringTeamId);
    const firstReset = later.find(isReset);
    const firstOpportunity = later.find(isOpportunity);
    const firstTeamEvent = later.find((event) =>
      isPossessionEvent(event) &&
      (event.teamId === scoringTeamId || event.teamId === concedingTeamId)
    );
    const concedingHasFirstPossession = firstTeamEvent?.teamId === concedingTeamId;
    const protectedReset = firstReset !== undefined &&
      (
        firstOpportunity === undefined ||
        firstReset.timestamp.minute < firstOpportunity.timestamp.minute ||
        (
          firstReset.timestamp.minute === firstOpportunity.timestamp.minute &&
          firstReset.timestamp.tick < firstOpportunity.timestamp.tick
        )
      );

    if (firstReset === undefined) {
      missingResetCount += 1;
    } else {
      resetEventCreatedCount += 1;
      if (protectedReset) {
        protectedResetCount += 1;
      } else {
        unprotectedResetCount += 1;
      }
      if (hasTag(firstReset, "reset_breaks_dominance") || hasTag(firstReset, "neutral_phase_breaks_momentum")) {
        resetBreaksDominance += 1;
      } else {
        resetFailed += 1;
      }
      if (firstReset.outcome === "neutral" || hasTag(firstReset, "neutral_restart")) {
        resetToNeutral += 1;
      }
      if (hasTag(firstReset, "safe_restart") || hasTag(firstReset, "possession_reset")) {
        resetToSafe += 1;
      }
    }

    if (concedingHasFirstPossession && firstTeamEvent !== undefined) {
      concedingFirst += 1;
      if (firstTeamEvent.outcome === "neutral" || isReset(firstTeamEvent)) {
        concedingNeutral += 1;
      }
      if (isOpportunity(firstTeamEvent)) {
        concedingDanger += 1;
      }
      if (isTurnover(firstTeamEvent)) {
        concedingTurnover += 1;
        concedingLostImmediately += 1;
      }
    }
    if (firstOpportunity?.teamId === scoringTeamId && !protectedReset) {
      scoringReattack += 1;
    }
    if (firstOpportunity?.teamId === scoringTeamId && protectedReset) {
      scoringReattackAfterProtected += 1;
    }
    if (firstOpportunity !== undefined && firstOpportunity.teamId === scoringTeamId && firstReset !== undefined) {
      resetToImmediateDanger += 1;
    }
  }

  const failedReasons = [
    ...(missingResetCount > 0 ? ["POST_SCORE_RESET_MISSING"] : []),
    ...(unprotectedResetCount > 0 ? ["POST_SCORE_RESET_UNPROTECTED"] : []),
    ...(resetFailed > 0 ? ["RESET_EXISTS_BUT_DOES_NOT_BREAK_DOMINANCE"] : []),
    ...(scoringReattack > 0 ? ["SCORING_TEAM_IMMEDIATE_REATTACK_TOO_HIGH"] : []),
  ];
  const warnings: ResetBreakSpecificityWarningCode[] = [];
  if (missingResetCount > 0) {
    warnings.push("POST_SCORE_RESET_MISSING");
  }
  if (unprotectedResetCount > 0) {
    warnings.push("POST_SCORE_RESET_UNPROTECTED");
  }
  if (percent(concedingFirst, scoringEvents.length) < 35) {
    warnings.push("CONCEDING_TEAM_FIRST_POSSESSION_TOO_LOW");
  }
  if (concedingLostImmediately > 0) {
    warnings.push("CONCEDING_TEAM_FIRST_POSSESSION_LOST_TOO_FAST");
  }
  if (percent(scoringReattack, scoringEvents.length) > 45) {
    warnings.push("SCORING_TEAM_IMMEDIATE_REATTACK_TOO_HIGH");
  }
  if (scoringReattackAfterProtected > 0) {
    warnings.push("SCORING_TEAM_REATTACK_AFTER_PROTECTED_RESET");
  }
  if (resetFailed > 0) {
    warnings.push("RESET_EXISTS_BUT_DOES_NOT_BREAK_DOMINANCE");
  }
  if (percent(resetToImmediateDanger, scoringEvents.length) > 35) {
    warnings.push("RESET_TO_DANGER_TOO_FAST");
  }
  if (resetToNeutral > 0) {
    warnings.push("RESET_TO_NEUTRAL_CONNECTED");
  }
  if (resetToSafe > 0) {
    warnings.push("RESET_TO_SAFE_POSSESSION_CONNECTED");
  }

  return {
    matchId: report.matchId,
    postScoreWindowsChecked: scoringEvents.length,
    resetEventCreatedCount,
    protectedResetCount,
    protectedResetRate: percent(protectedResetCount, scoringEvents.length),
    unprotectedResetCount,
    missingResetCount,
    concedingTeamFirstPossessionCount: concedingFirst,
    concedingTeamFirstPossessionRate: percent(concedingFirst, scoringEvents.length),
    concedingTeamFirstPossessionNeutralCount: concedingNeutral,
    concedingTeamFirstPossessionDangerCount: concedingDanger,
    concedingTeamFirstPossessionTurnoverCount: concedingTurnover,
    concedingTeamFirstPossessionLostImmediatelyCount: concedingLostImmediately,
    scoringTeamImmediateReattackCount: scoringReattack,
    scoringTeamImmediateReattackRate: percent(scoringReattack, scoringEvents.length),
    scoringTeamImmediateReattackAfterProtectedResetCount: scoringReattackAfterProtected,
    resetBreaksDominanceCount: resetBreaksDominance,
    resetBreaksDominanceRate: percent(resetBreaksDominance, resetEventCreatedCount),
    resetFailedToBreakDominanceCount: resetFailed,
    resetFailedReasonCodes: [...new Set(failedReasons)],
    resetToNeutralRate: percent(resetToNeutral, resetEventCreatedCount),
    resetToSafePossessionRate: percent(resetToSafe, resetEventCreatedCount),
    resetToImmediateDangerRate: percent(resetToImmediateDanger, resetEventCreatedCount),
    resetBreakWarningCodes: [...new Set(warnings)],
  };
}
