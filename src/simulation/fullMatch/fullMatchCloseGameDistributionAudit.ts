import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { CloseGameDistributionWarningCode } from "./closeGameDistributionWarnings";

export type MarginBucket =
  | "DRAW"
  | "ONE_SCORE_GAME"
  | "TWO_SCORE_GAME"
  | "COMPETITIVE"
  | "MODERATE_GAP"
  | "BLOWOUT"
  | "SEVERE_BLOWOUT";

export interface CloseGameDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchCloseGameDistributionAudit {
  readonly matchCount: number;
  readonly closeGameWindowCount: number;
  readonly scoreDifferenceDistribution: readonly CloseGameDistributionRow[];
  readonly scorelineDistribution: readonly CloseGameDistributionRow[];
  readonly finalMarginDistribution: readonly CloseGameDistributionRow[];
  readonly marginBucketDistribution: readonly CloseGameDistributionRow[];
  readonly oneScoreGameCount: number;
  readonly twoScoreGameCount: number;
  readonly closeGameCount: number;
  readonly competitiveGameCount: number;
  readonly blowoutCount: number;
  readonly severeBlowoutCount: number;
  readonly shutoutCount: number;
  readonly oneSidedScoringCount: number;
  readonly drawCount: number;
  readonly lateGameCloseCount: number;
  readonly finalQuarterCompetitiveCount: number;
  readonly comebackOpportunityCount: number;
  readonly trailingTeamResponseCount: number;
  readonly leadingTeamRunAwayCount: number;
  readonly leadingTeamReattackCount: number;
  readonly leadingTeamRepeatOpportunityCount: number;
  readonly averageScoreDifference: number;
  readonly medianScoreDifference: number;
  readonly maxScoreDifference: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly oneScoreGameRate: number;
  readonly twoScoreGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly shutoutRate: number;
  readonly oneSidedScoringRate: number;
  readonly drawRate: number;
  readonly lateGameCloseRate: number;
  readonly finalQuarterCompetitiveRate: number;
  readonly comebackOpportunityRate: number;
  readonly trailingTeamResponseRate: number;
  readonly leadingTeamRunawayRate: number;
  readonly leadingTeamReattackRate: number;
  readonly leadingTeamRepeatOpportunityRate: number;
  readonly scoreGapGrowthCauseDistribution: readonly CloseGameDistributionRow[];
  readonly scoreGapShrinkCauseDistribution: readonly CloseGameDistributionRow[];
  readonly competitiveFailureCauseDistribution: readonly CloseGameDistributionRow[];
  readonly closeGameWarningCodes: readonly CloseGameDistributionWarningCode[];
  readonly recommendation:
    | "KEEP_CLOSE_GAME_MONITORING"
    | "IMPROVE_TRAILING_TEAM_RESPONSE_ACCESS"
    | "REDUCE_ARTIFICIAL_RUNAWAYS"
    | "REVIEW_COMPETITIVE_DISTRIBUTION";
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted[middle] ?? 0;
  return sorted.length % 2 === 1 ? value : round(((sorted[middle - 1] ?? value) + value) / 2);
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function distribution(values: readonly string[]): readonly CloseGameDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function marginBucket(diff: number): MarginBucket {
  if (diff === 0) return "DRAW";
  if (diff <= 5) return "ONE_SCORE_GAME";
  if (diff <= 10) return "TWO_SCORE_GAME";
  if (diff <= 12) return "COMPETITIVE";
  if (diff < 15) return "MODERATE_GAP";
  if (diff < 25) return "BLOWOUT";
  return "SEVERE_BLOWOUT";
}

function scoreline(report: MatchReport): string {
  return `${report.score.home}-${report.score.away}`;
}

function scoreAtMinute(report: MatchReport, minute: number): { readonly home: number; readonly away: number } {
  const homeTeamId = report.teamStats[0]?.teamId;
  let home = 0;
  let away = 0;
  for (const event of report.timeline) {
    if (event.timestamp.minute > minute) continue;
    const points = scoreChangePoints(event);
    if (points === 0) continue;
    if (event.teamId === homeTeamId) home += points;
    else away += points;
  }
  return { home, away };
}

function scoringTeams(report: MatchReport): number {
  return [report.score.home, report.score.away].filter((points) => points > 0).length;
}

function isOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) => tag.startsWith("official_route_family_")) &&
    !event.tags.includes("official_route_family_CONTINUATION") &&
    !event.tags.includes("official_route_family_candidate");
}

function finalWinnerTeam(report: MatchReport): string | null {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  if (report.score.home === report.score.away) return null;
  return report.score.home > report.score.away ? homeTeamId ?? null : awayTeamId ?? null;
}

function opportunityCountsByTeam(report: MatchReport): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of report.timeline.filter(isOpportunity)) {
    counts.set(event.teamId, (counts.get(event.teamId) ?? 0) + 1);
  }
  return counts;
}

function firstTrailingResponseAfterScore(report: MatchReport): boolean {
  const homeTeamId = report.teamStats[0]?.teamId;
  let home = 0;
  let away = 0;
  for (const event of [...report.timeline].sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick)) {
    const points = scoreChangePoints(event);
    if (points > 0) {
      if (event.teamId === homeTeamId) home += points;
      else away += points;
      continue;
    }
    if (!isOpportunity(event)) continue;
    const teamPoints = event.teamId === homeTeamId ? home : away;
    const opponentPoints = event.teamId === homeTeamId ? away : home;
    if (teamPoints < opponentPoints) return true;
  }
  return false;
}

export function auditFullMatchCloseGameDistribution(reports: readonly MatchReport[]): FullMatchCloseGameDistributionAudit {
  const diffs = reports.map((report) => Math.abs(report.score.home - report.score.away));
  const buckets = diffs.map(marginBucket);
  let lateGameCloseCount = 0;
  let finalQuarterCompetitiveCount = 0;
  let comebackOpportunityCount = 0;
  let trailingTeamResponseCount = 0;
  let leadingTeamRunAwayCount = 0;
  let leadingTeamReattackCount = 0;
  let leadingTeamRepeatOpportunityCount = 0;
  const growthCauses: string[] = [];
  const shrinkCauses: string[] = [];
  const failureCauses: string[] = [];

  for (const report of reports) {
    const finalDiff = Math.abs(report.score.home - report.score.away);
    const minute60 = scoreAtMinute(report, 60);
    const minute75 = scoreAtMinute(report, 75);
    const diff60 = Math.abs(minute60.home - minute60.away);
    const diff75 = Math.abs(minute75.home - minute75.away);
    if (diff75 <= 7) lateGameCloseCount += 1;
    if (diff60 <= 12 || diff75 <= 12) finalQuarterCompetitiveCount += 1;
    if (diff60 > finalDiff) comebackOpportunityCount += 1;
    if (firstTrailingResponseAfterScore(report)) trailingTeamResponseCount += 1;

    const winner = finalWinnerTeam(report);
    const opportunitiesByTeam = opportunityCountsByTeam(report);
    const winnerOpportunities = winner === null ? 0 : opportunitiesByTeam.get(winner) ?? 0;
    const loserOpportunities = [...opportunitiesByTeam.entries()]
      .filter(([teamId]) => teamId !== winner)
      .reduce((sum, [, count]) => sum + count, 0);
    if (finalDiff >= 15 && winnerOpportunities > loserOpportunities + 3) {
      leadingTeamRunAwayCount += 1;
      growthCauses.push("OPPORTUNITY_VOLUME_GAP");
    }
    if (report.timeline.some((event) => event.tags.includes("leading_team_runaway_window_6t"))) {
      leadingTeamReattackCount += 1;
      growthCauses.push("LEADING_TEAM_REATTACK_WINDOW");
    }
    if (report.timeline.some((event) => event.tags.includes("leading_team_repeat_opportunity_dampened_6t"))) {
      leadingTeamRepeatOpportunityCount += 1;
      shrinkCauses.push("REPEAT_OPPORTUNITY_DAMPENED");
    }
    if (report.timeline.some((event) => event.tags.includes("trailing_team_response_opportunity_6t"))) {
      shrinkCauses.push("TRAILING_TEAM_RESPONSE_WINDOW");
    }
    if (finalDiff > 12 && winnerOpportunities <= loserOpportunities + 1) {
      failureCauses.push("SCORING_EFFICIENCY_GAP");
    } else if (finalDiff > 12) {
      failureCauses.push("OPPORTUNITY_ACCESS_GAP");
    }
  }

  const closeGameCount = diffs.filter((diff) => diff <= 7).length;
  const competitiveGameCount = reports.filter((report, index) => {
    const minute75 = scoreAtMinute(report, 75);
    return (diffs[index] ?? 0) <= 12 || Math.abs(minute75.home - minute75.away) <= 12;
  }).length;
  const blowoutCount = diffs.filter((diff) => diff >= 15).length;
  const severeBlowoutCount = diffs.filter((diff) => diff >= 25).length;
  const shutoutCount = reports.filter((report) => report.score.home === 0 || report.score.away === 0).length;
  const oneSidedScoringCount = reports.filter((report) => scoringTeams(report) === 1).length;
  const warnings: CloseGameDistributionWarningCode[] = ["CLOSE_GAME_DISTRIBUTION_MEASURED"];
  warnings.push(percent(closeGameCount, reports.length) >= 25 ? "CLOSE_GAME_RATE_HEALTHY" : "CLOSE_GAME_RATE_TOO_LOW");
  warnings.push(percent(competitiveGameCount, reports.length) >= 50 ? "COMPETITIVE_GAME_RATE_HEALTHY" : "COMPETITIVE_GAME_RATE_TOO_LOW");
  warnings.push(percent(blowoutCount, reports.length) <= 35 ? "BLOWOUT_RATE_HEALTHY" : "BLOWOUT_RATE_TOO_HIGH");
  warnings.push(percent(severeBlowoutCount, reports.length) <= 8 ? "SEVERE_BLOWOUT_RATE_HEALTHY" : "SEVERE_BLOWOUT_RATE_TOO_HIGH");
  warnings.push(lateGameCloseCount > 0 ? "LATE_GAME_COMPETITION_PRESENT" : "CLOSE_GAME_RATE_TOO_LOW");
  warnings.push(percent(trailingTeamResponseCount, reports.length) >= 20 ? "TRAILING_TEAM_RESPONSE_HEALTHY" : "TRAILING_TEAM_RESPONSE_TOO_LOW");
  warnings.push(percent(leadingTeamRunAwayCount, reports.length) <= 30 ? "LEADING_TEAM_RUNAWAY_CONTROLLED" : "LEADING_TEAM_RUNAWAY_TOO_HIGH");

  return {
    matchCount: reports.length,
    closeGameWindowCount: closeGameCount,
    scoreDifferenceDistribution: distribution(diffs.map((diff) => String(diff))),
    scorelineDistribution: distribution(reports.map(scoreline)),
    finalMarginDistribution: distribution(diffs.map((diff) => String(diff))),
    marginBucketDistribution: distribution(buckets),
    oneScoreGameCount: diffs.filter((diff) => diff <= 5).length,
    twoScoreGameCount: diffs.filter((diff) => diff <= 10).length,
    closeGameCount,
    competitiveGameCount,
    blowoutCount,
    severeBlowoutCount,
    shutoutCount,
    oneSidedScoringCount,
    drawCount: diffs.filter((diff) => diff === 0).length,
    lateGameCloseCount,
    finalQuarterCompetitiveCount,
    comebackOpportunityCount,
    trailingTeamResponseCount,
    leadingTeamRunAwayCount,
    leadingTeamReattackCount,
    leadingTeamRepeatOpportunityCount,
    averageScoreDifference: diffs.length === 0 ? 0 : round(diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length),
    medianScoreDifference: median(diffs),
    maxScoreDifference: Math.max(0, ...diffs),
    closeGameRate: percent(closeGameCount, reports.length),
    competitiveGameRate: percent(competitiveGameCount, reports.length),
    oneScoreGameRate: percent(diffs.filter((diff) => diff <= 5).length, reports.length),
    twoScoreGameRate: percent(diffs.filter((diff) => diff <= 10).length, reports.length),
    blowoutRate: percent(blowoutCount, reports.length),
    severeBlowoutRate: percent(severeBlowoutCount, reports.length),
    shutoutRate: percent(shutoutCount, reports.length),
    oneSidedScoringRate: percent(oneSidedScoringCount, reports.length),
    drawRate: percent(diffs.filter((diff) => diff === 0).length, reports.length),
    lateGameCloseRate: percent(lateGameCloseCount, reports.length),
    finalQuarterCompetitiveRate: percent(finalQuarterCompetitiveCount, reports.length),
    comebackOpportunityRate: percent(comebackOpportunityCount, reports.length),
    trailingTeamResponseRate: percent(trailingTeamResponseCount, reports.length),
    leadingTeamRunawayRate: percent(leadingTeamRunAwayCount, reports.length),
    leadingTeamReattackRate: percent(leadingTeamReattackCount, reports.length),
    leadingTeamRepeatOpportunityRate: percent(leadingTeamRepeatOpportunityCount, reports.length),
    scoreGapGrowthCauseDistribution: distribution(growthCauses.length === 0 ? ["TRUE_TACTICAL_SUPERIORITY_OR_FINISHING"] : growthCauses),
    scoreGapShrinkCauseDistribution: distribution(shrinkCauses.length === 0 ? ["NO_ARTIFICIAL_SHRINK_CAUSE"] : shrinkCauses),
    competitiveFailureCauseDistribution: distribution(failureCauses.length === 0 ? ["COMPETITIVE_FAILURE_NOT_DOMINANT"] : failureCauses),
    closeGameWarningCodes: [...new Set(warnings)],
    recommendation: warnings.includes("BLOWOUT_RATE_TOO_HIGH") || warnings.includes("LEADING_TEAM_RUNAWAY_TOO_HIGH")
      ? "REDUCE_ARTIFICIAL_RUNAWAYS"
      : warnings.includes("TRAILING_TEAM_RESPONSE_TOO_LOW")
        ? "IMPROVE_TRAILING_TEAM_RESPONSE_ACCESS"
        : warnings.includes("CLOSE_GAME_RATE_TOO_LOW") || warnings.includes("COMPETITIVE_GAME_RATE_TOO_LOW")
          ? "REVIEW_COMPETITIVE_DISTRIBUTION"
          : "KEEP_CLOSE_GAME_MONITORING",
  };
}
