import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { TeamId } from "../../core/ids";
import type { BreakEventPostScoreResetWarningCode } from "./breakEventPostScoreResetWarnings";

export interface FullMatchPostScoreResetWindow {
  readonly scoringEventId: string;
  readonly scoringTeamId: TeamId;
  readonly concedingTeamId: TeamId;
  readonly scorePoints: number;
  readonly nextOpportunityEventId?: string;
  readonly nextOpportunityTeamId?: TeamId;
  readonly protectedByReset: boolean;
  readonly resetEventId?: string;
  readonly immediateReattack: boolean;
  readonly concedingTeamFirstPossession: boolean;
  readonly reason: string;
}

export interface FullMatchPostScoreResetAudit {
  readonly matchId: string;
  readonly scoringEventCount: number;
  readonly postScoreWindowsChecked: number;
  readonly postScoreImmediateReattackCount: number;
  readonly postScoreImmediateReattackRate: number;
  readonly postScoreResetProtectedCount: number;
  readonly postScoreResetProtectedRate: number;
  readonly concedingTeamFirstPossessionCount: number;
  readonly concedingTeamFirstPossessionRate: number;
  readonly dominanceDecayEligibleCount: number;
  readonly dominanceDecayAppliedCount: number;
  readonly dominanceDecayApplicationRate: number;
  readonly defensiveRecoveryBreakCount: number;
  readonly goalkeeperSecureBreakCount: number;
  readonly neutralResetBreakCount: number;
  readonly warningCodes: readonly BreakEventPostScoreResetWarningCode[];
  readonly windows: readonly FullMatchPostScoreResetWindow[];
  readonly recommendation:
    | "KEEP_BREAK_EVENT_MONITORING"
    | "IMPROVE_POST_SCORE_RESETS_MORE"
    | "IMPROVE_DEFENSIVE_RECOVERY_BREAKS"
    | "IMPROVE_GOALKEEPER_SECURE_BREAKS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function routeFamilyForEvent(event: MatchEvent): OfficialScoringFamily | "CONTINUATION" | null {
  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }

  const families: readonly (OfficialScoringFamily | "CONTINUATION")[] = [
    "SHOT_GOAL",
    "TRY_TOUCHDOWN",
    "CONVERSION_GOAL",
    "DROP_GOAL",
    "PENALTY_SHOT",
    "UNKNOWN",
    "CONTINUATION",
  ];

  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
}

function isOpportunity(event: MatchEvent): boolean {
  const family = routeFamilyForEvent(event);
  return (family !== null && family !== "CONTINUATION") || event.eventType === "scoring";
}

function isReset(event: MatchEvent): boolean {
  return routeFamilyForEvent(event) === "CONTINUATION" ||
    event.outcome === "neutral" ||
    event.tags.includes("official_route_family_non_scoring_outcome");
}

function opposingTeamId(report: MatchReport, teamId: TeamId): TeamId {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  return teamId === homeTeamId ? (awayTeamId ?? teamId) : (homeTeamId ?? teamId);
}

export function auditFullMatchPostScoreReset(report: MatchReport): FullMatchPostScoreResetAudit {
  const sortedTimeline = [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
  const scoringEvents = sortedTimeline.filter((event) => scoreChangePoints(event) > 0);
  const windows: FullMatchPostScoreResetWindow[] = [];
  let dominanceDecayAppliedCount = 0;
  let defensiveRecoveryBreakCount = 0;
  let goalkeeperSecureBreakCount = 0;
  let neutralResetBreakCount = 0;

  for (const event of sortedTimeline) {
    if (
      event.tags.includes("break_event_post_score_reset_6k") ||
      event.tags.includes("post_score_dominance_decay_applied") ||
      event.tags.includes("dominance_decay_applied")
    ) {
      dominanceDecayAppliedCount += 1;
    }
    if (event.tags.some((tag) => tag.includes("recovery") || tag.includes("blocked") || tag.includes("defensive"))) {
      defensiveRecoveryBreakCount += 1;
    }
    if (event.tags.some((tag) => tag.includes("goalkeeper") || tag.includes("keeper") || tag.includes("gk"))) {
      goalkeeperSecureBreakCount += 1;
    }
    if (isReset(event)) {
      neutralResetBreakCount += 1;
    }
  }

  for (const scoringEvent of scoringEvents) {
    const scoringIndex = sortedTimeline.findIndex((event) => event.eventId === scoringEvent.eventId);
    const laterEvents = sortedTimeline.slice(scoringIndex + 1);
    const resetBeforeNextOpportunity = laterEvents.find((event) =>
      isReset(event) &&
      (event.tags.includes("post_score_reset_protected") || event.tags.includes("break_event_post_score_reset_6k"))
    );
    const nextOpportunity = laterEvents.find(isOpportunity);
    const scoringTeamId = scoringEvent.teamId;
    const concedingTeamId = opposingTeamId(report, scoringTeamId);
    const protectedByReset =
      resetBeforeNextOpportunity !== undefined &&
      (nextOpportunity === undefined ||
        resetBeforeNextOpportunity.timestamp.minute < nextOpportunity.timestamp.minute ||
        (
          resetBeforeNextOpportunity.timestamp.minute === nextOpportunity.timestamp.minute &&
          resetBeforeNextOpportunity.timestamp.tick < nextOpportunity.timestamp.tick
        ));
    const immediateReattack = nextOpportunity?.teamId === scoringTeamId && !protectedByReset;
    const concedingTeamFirstPossession = nextOpportunity?.teamId === concedingTeamId;

    windows.push({
      scoringEventId: scoringEvent.eventId,
      scoringTeamId,
      concedingTeamId,
      scorePoints: scoreChangePoints(scoringEvent),
      protectedByReset,
      immediateReattack,
      concedingTeamFirstPossession,
      ...(nextOpportunity === undefined
        ? {}
        : {
            nextOpportunityEventId: nextOpportunity.eventId,
            nextOpportunityTeamId: nextOpportunity.teamId,
          }),
      ...(resetBeforeNextOpportunity === undefined
        ? {}
        : { resetEventId: resetBeforeNextOpportunity.eventId }),
      reason: protectedByReset
        ? "A neutral reset is inserted before the scoring team can create another dangerous opportunity."
        : immediateReattack
          ? "The scoring team creates the next dangerous opportunity before a protected restart is observed."
          : concedingTeamFirstPossession
            ? "The conceding team receives the next dangerous opportunity window."
            : "No follow-up opportunity is available in the remaining timeline.",
    });
  }

  const postScoreImmediateReattackCount = windows.filter((window) => window.immediateReattack).length;
  const postScoreResetProtectedCount = windows.filter((window) => window.protectedByReset).length;
  const concedingTeamFirstPossessionCount = windows.filter((window) => window.concedingTeamFirstPossession).length;
  const warningCodes: BreakEventPostScoreResetWarningCode[] = [];
  const postScoreImmediateReattackRate = percent(postScoreImmediateReattackCount, windows.length);
  const postScoreResetProtectedRate = percent(postScoreResetProtectedCount, windows.length);
  const concedingTeamFirstPossessionRate = percent(concedingTeamFirstPossessionCount, windows.length);
  const dominanceDecayApplicationRate = percent(dominanceDecayAppliedCount, Math.max(1, scoringEvents.length));

  if (postScoreImmediateReattackRate > 45) {
    warningCodes.push("POST_SCORE_IMMEDIATE_REATTACK_TOO_HIGH");
  } else {
    warningCodes.push("POST_SCORE_IMMEDIATE_REATTACK_REDUCED");
  }
  warningCodes.push(postScoreResetProtectedCount > 0 ? "POST_SCORE_RESET_PROTECTED" : "POST_SCORE_RESET_NOT_PROTECTED");
  if (concedingTeamFirstPossessionCount === 0 && windows.length > 0) {
    warningCodes.push("CONCEDING_TEAM_FIRST_POSSESSION_MISSING");
  }
  warningCodes.push(defensiveRecoveryBreakCount > 0 ? "DEFENSIVE_RECOVERY_BREAKS_IMPROVED" : "DEFENSIVE_RECOVERY_BREAKS_TOO_WEAK");
  warningCodes.push(goalkeeperSecureBreakCount > 0 ? "GOALKEEPER_SECURE_BREAKS_JUSTIFIED_ABSENT" : "GOALKEEPER_SECURE_BREAKS_MISSING");
  warningCodes.push(dominanceDecayAppliedCount > 0 ? "DOMINANCE_DECAY_APPLIED" : "DOMINANCE_DECAY_APPLICATION_ZERO");

  return {
    matchId: report.matchId,
    scoringEventCount: scoringEvents.length,
    postScoreWindowsChecked: windows.length,
    postScoreImmediateReattackCount,
    postScoreImmediateReattackRate,
    postScoreResetProtectedCount,
    postScoreResetProtectedRate,
    concedingTeamFirstPossessionCount,
    concedingTeamFirstPossessionRate,
    dominanceDecayEligibleCount: scoringEvents.length,
    dominanceDecayAppliedCount,
    dominanceDecayApplicationRate,
    defensiveRecoveryBreakCount,
    goalkeeperSecureBreakCount,
    neutralResetBreakCount,
    warningCodes: [...new Set(warningCodes)],
    windows,
    recommendation: postScoreImmediateReattackRate > 45
      ? "IMPROVE_POST_SCORE_RESETS_MORE"
      : defensiveRecoveryBreakCount === 0
        ? "IMPROVE_DEFENSIVE_RECOVERY_BREAKS"
        : goalkeeperSecureBreakCount === 0
          ? "IMPROVE_GOALKEEPER_SECURE_BREAKS"
          : "KEEP_BREAK_EVENT_MONITORING",
  };
}
