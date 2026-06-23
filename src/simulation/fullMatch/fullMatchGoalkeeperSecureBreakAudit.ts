import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { GoalkeeperSecureResetBreakWarningCode } from "./goalkeeperSecureResetBreakWarnings";

export interface FullMatchGoalkeeperSecureBreakAudit {
  readonly matchId: string;
  readonly goalkeeperSecureEventCount: number;
  readonly goalkeeperSecureCandidateCount: number;
  readonly goalkeeperSecureOfficialEventCount: number;
  readonly goalkeeperSecureDiagnosticOnlyCount: number;
  readonly goalkeeperSecureWithPossessionChangeCount: number;
  readonly goalkeeperSecureWithResetCount: number;
  readonly goalkeeperSecureWithNeutralPhaseCount: number;
  readonly goalkeeperSecureWithContinuationBlockedCount: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly goalkeeperSecureFailedToBreakDominanceCount: number;
  readonly goalkeeperSecureFailedReasonCodes: readonly string[];
  readonly goalkeeperSecureFollowupTeamId?: TeamId;
  readonly goalkeeperSecureFollowupPossessionCount: number;
  readonly goalkeeperSecureFollowupDangerCount: number;
  readonly goalkeeperSecureFollowupTurnoverCount: number;
  readonly goalkeeperSecureFollowupResetCount: number;
  readonly sameOpponentImmediateReattackAfterGoalkeeperSecureCount: number;
  readonly sameOpponentImmediateReattackAfterGoalkeeperSecureRate: number;
  readonly goalkeeperSecureToRestartRate: number;
  readonly goalkeeperSecureToSafePossessionRate: number;
  readonly goalkeeperSecureToDangerAgainstRate: number;
  readonly goalkeeperSecureBreakWarningCodes: readonly GoalkeeperSecureResetBreakWarningCode[];
  readonly recommendation:
    | "KEEP_GOALKEEPER_SECURE_BREAK_MONITORING"
    | "CONNECT_GOALKEEPER_SECURE_TO_OFFICIAL_RESET"
    | "REDUCE_GOALKEEPER_SECURE_REATTACKS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function normalizedTags(event: MatchEvent): readonly string[] {
  return event.tags.map((tag) => tag.toLowerCase());
}

function hasTag(event: MatchEvent, value: string): boolean {
  return normalizedTags(event).some((tag) => tag.includes(value));
}

function hasExactTag(event: MatchEvent, value: string): boolean {
  return normalizedTags(event).includes(value);
}

function isGoalkeeperSecureCandidate(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    hasExactTag(event, "goalkeeper_secure_reset_break_6l") ||
    hasExactTag(event, "goalkeeper_secure_breaks_chain") ||
    hasExactTag(event, "goalkeeper_secure_possession_reset");
}

function isOfficialGoalkeeperSecureBreak(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    hasExactTag(event, "goalkeeper_secure_reset_break_6l") ||
    hasExactTag(event, "goalkeeper_secure_breaks_chain") ||
    hasExactTag(event, "goalkeeper_secure_possession_reset");
}

function isReset(event: MatchEvent): boolean {
  return hasTag(event, "official_route_family_continuation") ||
    hasTag(event, "safe_restart") ||
    hasTag(event, "neutral_restart") ||
    hasTag(event, "possession_reset") ||
    event.outcome === "neutral";
}

function isDanger(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    hasTag(event, "official_route_family_shot_goal") ||
    hasTag(event, "official_route_family_try_touchdown") ||
    hasTag(event, "official_route_family_drop_goal");
}

function isTurnover(event: MatchEvent): boolean {
  return event.eventType === "turnover" || hasTag(event, "turnover") || hasTag(event, "lost_forward");
}

function sortedTimeline(report: MatchReport): readonly MatchEvent[] {
  return [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
}

export function auditFullMatchGoalkeeperSecureBreak(report: MatchReport): FullMatchGoalkeeperSecureBreakAudit {
  const timeline = sortedTimeline(report);
  const candidates = timeline.filter(isGoalkeeperSecureCandidate);
  const officialEvents = candidates.filter(isOfficialGoalkeeperSecureBreak);
  let withPossessionChange = 0;
  let withReset = 0;
  let withNeutralPhase = 0;
  let withContinuationBlocked = 0;
  let breaksDominance = 0;
  let followupPossession = 0;
  let followupDanger = 0;
  let followupTurnover = 0;
  let followupReset = 0;
  let sameOpponentImmediateReattack = 0;
  let firstFollowupTeamId: TeamId | undefined;

  for (const event of officialEvents) {
    const index = timeline.findIndex((row) => row.eventId === event.eventId);
    const later = timeline.slice(index + 1);
    const nextTeamEvent = later.find((row) => row.teamId !== event.teamId);
    const nextDanger = later.find(isDanger);
    const nextReset = later.find(isReset);
    const nextTurnover = later.find(isTurnover);
    const goalkeeperActionSecure = event.eventType === "goalkeeper_action" && event.outcome === "neutral";
    const resetConnected = goalkeeperActionSecure || isReset(event) || nextReset !== undefined;
    const neutralConnected = goalkeeperActionSecure || event.outcome === "neutral" || hasTag(event, "neutral") || nextReset?.outcome === "neutral";

    if (nextTeamEvent !== undefined) {
      withPossessionChange += 1;
      firstFollowupTeamId ??= nextTeamEvent.teamId;
    }
    if (resetConnected) {
      withReset += 1;
      followupReset += 1;
    }
    if (neutralConnected) {
      withNeutralPhase += 1;
    }
    if (goalkeeperActionSecure || hasTag(event, "safe_restart") || hasTag(event, "possession_reset") || event.outcome === "neutral") {
      withContinuationBlocked += 1;
      followupPossession += 1;
    }
    if (goalkeeperActionSecure || hasTag(event, "breaks_dominance") || hasTag(event, "reset_breaks_dominance") || hasTag(event, "neutral_phase_breaks_momentum")) {
      breaksDominance += 1;
    }
    if (nextDanger !== undefined) {
      followupDanger += 1;
      if (nextDanger.teamId !== event.teamId) {
        sameOpponentImmediateReattack += 1;
      }
    }
    if (nextTurnover !== undefined) {
      followupTurnover += 1;
    }
  }

  const failedToBreak = Math.max(0, officialEvents.length - breaksDominance);
  const failedReasons = [
    ...(officialEvents.length === 0 && candidates.length > 0 ? ["GOALKEEPER_SECURE_DIAGNOSTIC_ONLY"] : []),
    ...(withPossessionChange < officialEvents.length ? ["GOALKEEPER_SECURE_WITHOUT_POSSESSION_CHANGE"] : []),
    ...(withReset < officialEvents.length ? ["GOALKEEPER_SECURE_WITHOUT_RESET"] : []),
    ...(breaksDominance < officialEvents.length ? ["GOALKEEPER_SECURE_DOES_NOT_BREAK_DOMINANCE"] : []),
  ];
  const warningCodes: GoalkeeperSecureResetBreakWarningCode[] = [];
  warningCodes.push("GOALKEEPER_SECURE_RESET_BREAK_CALIBRATED");
  if (officialEvents.length > 0) {
    warningCodes.push("GOALKEEPER_SECURE_BREAK_CONNECTED");
  }
  if (breaksDominance > 0) {
    warningCodes.push("GOALKEEPER_SECURE_BREAK_EFFECTIVE");
  } else if (candidates.length > 0) {
    warningCodes.push("GOALKEEPER_SECURE_BREAK_STILL_ZERO");
  }
  if (sameOpponentImmediateReattack === 0 || percent(sameOpponentImmediateReattack, officialEvents.length) <= 30) {
    warningCodes.push("GOALKEEPER_SECURE_IMMEDIATE_REATTACK_REDUCED");
  } else {
    warningCodes.push("GOALKEEPER_SECURE_BREAK_STILL_WEAK");
  }

  return {
    matchId: report.matchId,
    goalkeeperSecureEventCount: candidates.length,
    goalkeeperSecureCandidateCount: candidates.length,
    goalkeeperSecureOfficialEventCount: officialEvents.length,
    goalkeeperSecureDiagnosticOnlyCount: Math.max(0, candidates.length - officialEvents.length),
    goalkeeperSecureWithPossessionChangeCount: withPossessionChange,
    goalkeeperSecureWithResetCount: withReset,
    goalkeeperSecureWithNeutralPhaseCount: withNeutralPhase,
    goalkeeperSecureWithContinuationBlockedCount: withContinuationBlocked,
    goalkeeperSecureBreaksDominanceCount: breaksDominance,
    goalkeeperSecureBreaksDominanceRate: percent(breaksDominance, officialEvents.length),
    goalkeeperSecureFailedToBreakDominanceCount: failedToBreak,
    goalkeeperSecureFailedReasonCodes: [...new Set(failedReasons)],
    ...(firstFollowupTeamId === undefined ? {} : { goalkeeperSecureFollowupTeamId: firstFollowupTeamId }),
    goalkeeperSecureFollowupPossessionCount: followupPossession,
    goalkeeperSecureFollowupDangerCount: followupDanger,
    goalkeeperSecureFollowupTurnoverCount: followupTurnover,
    goalkeeperSecureFollowupResetCount: followupReset,
    sameOpponentImmediateReattackAfterGoalkeeperSecureCount: sameOpponentImmediateReattack,
    sameOpponentImmediateReattackAfterGoalkeeperSecureRate: percent(sameOpponentImmediateReattack, officialEvents.length),
    goalkeeperSecureToRestartRate: percent(withReset, officialEvents.length),
    goalkeeperSecureToSafePossessionRate: percent(followupPossession, officialEvents.length),
    goalkeeperSecureToDangerAgainstRate: percent(sameOpponentImmediateReattack, officialEvents.length),
    goalkeeperSecureBreakWarningCodes: [...new Set(warningCodes)],
    recommendation: officialEvents.length === 0 && candidates.length > 0
      ? "CONNECT_GOALKEEPER_SECURE_TO_OFFICIAL_RESET"
      : sameOpponentImmediateReattack > 0
        ? "REDUCE_GOALKEEPER_SECURE_REATTACKS"
        : "KEEP_GOALKEEPER_SECURE_BREAK_MONITORING",
  };
}
