import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { FullMatchResetToDangerQualityAudit } from "./fullMatchResetToDangerQualityAudit";

export type BlowoutEconomyRootCauseCode =
  | "RESET_TO_DANGER_TOO_FAST"
  | "GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_FAST"
  | "DEFENSIVE_RECOVERY_TO_DANGER_TOO_FAST"
  | "LOSING_TEAM_RESPONSE_TOO_WEAK"
  | "LOSING_TEAM_SCORELESS_WINDOW_TOO_LONG"
  | "WINNING_TEAM_DANGER_TOO_EFFICIENT"
  | "WINNING_TEAM_POST_RESET_DANGER_TOO_HIGH"
  | "WINNING_TEAM_POST_SCORE_REATTACK_TOO_HIGH"
  | "DANGER_NOT_ATTRIBUTE_GATED_ENOUGH"
  | "DANGER_NOT_TACTICALLY_EARNED"
  | "ROUTE_SELECTION_TOO_FAVORABLE_TO_DOMINANT_TEAM"
  | "FATIGUE_NOT_LIMITING_DOMINANT_TEAM"
  | "PRESSURE_NOT_LIMITING_DOMINANT_TEAM"
  | "GOALKEEPER_SECURE_BREAK_GOOD_BUT_FOLLOWUP_TOO_DANGEROUS"
  | "RESET_BREAK_GOOD_BUT_FOLLOWUP_TOO_DANGEROUS"
  | "CLOSE_GAME_WINDOW_MISSING"
  | "COMEBACK_WINDOW_TOO_WEAK"
  | "ECONOMY_HEALTHY_BUT_SCORELINE_VARIANCE_HIGH";

export interface FullMatchBlowoutEconomyAudit {
  readonly matchId: string;
  readonly finalScore: string;
  readonly scoreDifference: number;
  readonly blowoutDetected: boolean;
  readonly severeBlowoutDetected: boolean;
  readonly winningTeamId: TeamId;
  readonly losingTeamId: TeamId;
  readonly winningTeamPoints: number;
  readonly losingTeamPoints: number;
  readonly winningTeamScoringEvents: number;
  readonly losingTeamScoringEvents: number;
  readonly winningTeamScoringOpportunities: number;
  readonly losingTeamScoringOpportunities: number;
  readonly winningTeamDangerPhases: number;
  readonly losingTeamDangerPhases: number;
  readonly winningTeamResetToDangerCount: number;
  readonly losingTeamResetToDangerCount: number;
  readonly winningTeamGoalkeeperSecureToDangerAgainstCount: number;
  readonly losingTeamGoalkeeperSecureToDangerAgainstCount: number;
  readonly winningTeamDefensiveRecoveryToDangerCount: number;
  readonly losingTeamDefensiveRecoveryToDangerCount: number;
  readonly postScoreImmediateReattackCount: number;
  readonly resetToImmediateDangerCount: number;
  readonly resetToImmediateDangerRate: number;
  readonly goalkeeperSecureImmediateReattackAgainstCount: number;
  readonly goalkeeperSecureImmediateReattackAgainstRate: number;
  readonly goalkeeperSecureToDangerAgainstCount: number;
  readonly goalkeeperSecureToDangerAgainstRate: number;
  readonly losingTeamResponseAfterScoreRate: number;
  readonly losingTeamResponseAfterGoalkeeperSecureRate: number;
  readonly losingTeamResponseAfterDefensiveRecoveryRate: number;
  readonly losingTeamLongestScorelessWindow: number;
  readonly losingTeamDangerSuppressionWindow: number;
  readonly automaticDangerSuspicionCount: number;
  readonly earnedDangerCount: number;
  readonly unearnedDangerCount: number;
  readonly blowoutRootCauseCodes: readonly BlowoutEconomyRootCauseCode[];
  readonly recommendation:
    | "KEEP_MONITORING"
    | "IMPROVE_RESET_TO_DANGER_GATE"
    | "IMPROVE_LOSING_TEAM_RESPONSE"
    | "IMPROVE_DANGER_JUSTIFICATION";
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function normalizedTags(event: MatchEvent): readonly string[] {
  return event.tags.map((tag) => tag.toLowerCase());
}

function hasTag(event: MatchEvent, value: string): boolean {
  return normalizedTags(event).some((tag) => tag.includes(value));
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function isScoringEvent(event: MatchEvent): boolean {
  return scoreChangePoints(event) > 0;
}

function isDanger(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    hasTag(event, "official_route_family_shot_goal") ||
    hasTag(event, "official_route_family_try_touchdown") ||
    hasTag(event, "official_route_family_drop_goal");
}

function isOpportunity(event: MatchEvent): boolean {
  return isDanger(event);
}

function sortedTimeline(report: MatchReport): readonly MatchEvent[] {
  return [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
}

function teamIds(report: MatchReport): readonly [TeamId, TeamId] {
  const first = report.teamStats[0]?.teamId ?? "home";
  const second = report.teamStats[1]?.teamId ?? "away";
  return [first, second] as readonly [TeamId, TeamId];
}

function pointsForTeam(report: MatchReport, teamId: TeamId): number {
  const [homeTeamId] = teamIds(report);
  return teamId === homeTeamId ? report.score.home : report.score.away;
}

function responseAfterScore(input: {
  readonly timeline: readonly MatchEvent[];
  readonly losingTeamId: TeamId;
}): { readonly responses: number; readonly windows: number; readonly postScoreReattacks: number } {
  let responses = 0;
  let windows = 0;
  let postScoreReattacks = 0;
  const scoringEvents = input.timeline.filter(isScoringEvent);
  for (const event of scoringEvents) {
    const index = input.timeline.findIndex((row) => row.eventId === event.eventId);
    const nextTeamEvent = input.timeline.slice(index + 1).find((row) =>
      row.teamId === input.losingTeamId || row.teamId === event.teamId
    );
    if (nextTeamEvent === undefined) {
      continue;
    }
    windows += 1;
    if (nextTeamEvent.teamId === input.losingTeamId) {
      responses += 1;
    } else {
      postScoreReattacks += 1;
    }
  }
  return { responses, windows, postScoreReattacks };
}

function longestScorelessWindow(timeline: readonly MatchEvent[], teamId: TeamId): number {
  let current = 0;
  let longest = 0;
  for (const event of timeline) {
    if (isScoringEvent(event) && event.teamId === teamId) {
      longest = Math.max(longest, current);
      current = 0;
    } else if (isOpportunity(event) && event.teamId === teamId) {
      current += 1;
    }
  }
  return Math.max(longest, current);
}

function rootCauses(input: {
  readonly audit: Omit<FullMatchBlowoutEconomyAudit, "blowoutRootCauseCodes" | "recommendation">;
}): readonly BlowoutEconomyRootCauseCode[] {
  const causes: BlowoutEconomyRootCauseCode[] = [];
  if (input.audit.resetToImmediateDangerRate > 45) {
    causes.push("RESET_TO_DANGER_TOO_FAST");
  }
  if (input.audit.goalkeeperSecureToDangerAgainstRate > 18) {
    causes.push("GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_FAST");
  }
  if (input.audit.winningTeamResetToDangerCount > input.audit.losingTeamResetToDangerCount + 2) {
    causes.push("WINNING_TEAM_POST_RESET_DANGER_TOO_HIGH");
  }
  if (input.audit.postScoreImmediateReattackCount > 0) {
    causes.push("WINNING_TEAM_POST_SCORE_REATTACK_TOO_HIGH");
  }
  if (input.audit.losingTeamResponseAfterScoreRate < 55) {
    causes.push("LOSING_TEAM_RESPONSE_TOO_WEAK");
  }
  if (input.audit.losingTeamLongestScorelessWindow >= 4) {
    causes.push("LOSING_TEAM_SCORELESS_WINDOW_TOO_LONG");
  }
  if (input.audit.automaticDangerSuspicionCount > input.audit.earnedDangerCount) {
    causes.push("DANGER_NOT_TACTICALLY_EARNED", "DANGER_NOT_ATTRIBUTE_GATED_ENOUGH");
  }
  if (input.audit.blowoutDetected && causes.length === 0) {
    causes.push("ECONOMY_HEALTHY_BUT_SCORELINE_VARIANCE_HIGH");
  }
  return [...new Set(causes)];
}

export function auditFullMatchBlowoutEconomy(
  report: MatchReport,
  resetQuality: FullMatchResetToDangerQualityAudit,
): FullMatchBlowoutEconomyAudit {
  const timeline = sortedTimeline(report);
  const [homeTeamId, awayTeamId] = teamIds(report);
  const homePoints = pointsForTeam(report, homeTeamId);
  const awayPoints = pointsForTeam(report, awayTeamId);
  const winningTeamId = homePoints >= awayPoints ? homeTeamId : awayTeamId;
  const losingTeamId = winningTeamId === homeTeamId ? awayTeamId : homeTeamId;
  const winningPoints = Math.max(homePoints, awayPoints);
  const losingPoints = Math.min(homePoints, awayPoints);
  const scoreDifference = winningPoints - losingPoints;
  const winningRows = timeline.filter((event) => event.teamId === winningTeamId);
  const losingRows = timeline.filter((event) => event.teamId === losingTeamId);
  const response = responseAfterScore({ timeline, losingTeamId });
  const goalkeeperSecureDanger = resetQuality.rows.filter((row) => row.sourceBreakType === "GOALKEEPER_SECURE");
  const defensiveRecoveryDanger = resetQuality.rows.filter((row) => row.sourceBreakType === "DEFENSIVE_RECOVERY");
  const winningResetToDanger = resetQuality.rows.filter((row) => row.dangerTeamId === winningTeamId).length;
  const losingResetToDanger = resetQuality.rows.filter((row) => row.dangerTeamId === losingTeamId).length;
  const base = {
    matchId: report.matchId,
    finalScore: `${report.score.home} - ${report.score.away}`,
    scoreDifference,
    blowoutDetected: scoreDifference >= 12,
    severeBlowoutDetected: scoreDifference >= 24,
    winningTeamId,
    losingTeamId,
    winningTeamPoints: winningPoints,
    losingTeamPoints: losingPoints,
    winningTeamScoringEvents: winningRows.filter(isScoringEvent).length,
    losingTeamScoringEvents: losingRows.filter(isScoringEvent).length,
    winningTeamScoringOpportunities: winningRows.filter(isOpportunity).length,
    losingTeamScoringOpportunities: losingRows.filter(isOpportunity).length,
    winningTeamDangerPhases: winningRows.filter(isDanger).length,
    losingTeamDangerPhases: losingRows.filter(isDanger).length,
    winningTeamResetToDangerCount: winningResetToDanger,
    losingTeamResetToDangerCount: losingResetToDanger,
    winningTeamGoalkeeperSecureToDangerAgainstCount: goalkeeperSecureDanger.filter((row) => row.dangerTeamId === winningTeamId).length,
    losingTeamGoalkeeperSecureToDangerAgainstCount: goalkeeperSecureDanger.filter((row) => row.dangerTeamId === losingTeamId).length,
    winningTeamDefensiveRecoveryToDangerCount: defensiveRecoveryDanger.filter((row) => row.dangerTeamId === winningTeamId).length,
    losingTeamDefensiveRecoveryToDangerCount: defensiveRecoveryDanger.filter((row) => row.dangerTeamId === losingTeamId).length,
    postScoreImmediateReattackCount: response.postScoreReattacks,
    resetToImmediateDangerCount: resetQuality.resetToImmediateDangerCount,
    resetToImmediateDangerRate: resetQuality.resetToImmediateDangerRate,
    goalkeeperSecureImmediateReattackAgainstCount: goalkeeperSecureDanger.length,
    goalkeeperSecureImmediateReattackAgainstRate: percent(goalkeeperSecureDanger.length, Math.max(1, resetQuality.resetEventCount)),
    goalkeeperSecureToDangerAgainstCount: goalkeeperSecureDanger.length,
    goalkeeperSecureToDangerAgainstRate: percent(goalkeeperSecureDanger.length, Math.max(1, resetQuality.resetEventCount)),
    losingTeamResponseAfterScoreRate: percent(response.responses, response.windows),
    losingTeamResponseAfterGoalkeeperSecureRate: percent(goalkeeperSecureDanger.filter((row) => row.dangerTeamId === losingTeamId).length, goalkeeperSecureDanger.length),
    losingTeamResponseAfterDefensiveRecoveryRate: percent(defensiveRecoveryDanger.filter((row) => row.dangerTeamId === losingTeamId).length, defensiveRecoveryDanger.length),
    losingTeamLongestScorelessWindow: longestScorelessWindow(timeline, losingTeamId),
    losingTeamDangerSuppressionWindow: Math.max(0, longestScorelessWindow(timeline, losingTeamId) - losingRows.filter(isDanger).length),
    automaticDangerSuspicionCount: resetQuality.automaticDangerSuspicionCount,
    earnedDangerCount: resetQuality.earnedDangerCount,
    unearnedDangerCount: resetQuality.automaticDangerSuspicionCount,
  };
  const blowoutRootCauseCodes = rootCauses({ audit: base });
  const recommendation = blowoutRootCauseCodes.includes("RESET_TO_DANGER_TOO_FAST") ||
    blowoutRootCauseCodes.includes("WINNING_TEAM_POST_RESET_DANGER_TOO_HIGH")
    ? "IMPROVE_RESET_TO_DANGER_GATE"
    : blowoutRootCauseCodes.includes("LOSING_TEAM_RESPONSE_TOO_WEAK")
      ? "IMPROVE_LOSING_TEAM_RESPONSE"
      : blowoutRootCauseCodes.includes("DANGER_NOT_TACTICALLY_EARNED")
        ? "IMPROVE_DANGER_JUSTIFICATION"
        : "KEEP_MONITORING";

  return {
    ...base,
    blowoutRootCauseCodes,
    recommendation,
  };
}
