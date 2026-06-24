import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { CloseGameDistributionWarningCode } from "./closeGameDistributionWarnings";

export interface ScoreGapCauseDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchScoreGapCauseAudit {
  readonly trueSkillGapSignalCount: number;
  readonly tacticalMismatchSignalCount: number;
  readonly fatigueMismatchSignalCount: number;
  readonly routeQualityMismatchSignalCount: number;
  readonly goalkeeperMismatchSignalCount: number;
  readonly opportunityVolumeGapSignalCount: number;
  readonly scoringEfficiencyGapSignalCount: number;
  readonly dominanceChainGapSignalCount: number;
  readonly recoveryFailureGapSignalCount: number;
  readonly artificialGapSuspicionCount: number;
  readonly scoreGapCauseDistribution: readonly ScoreGapCauseDistributionRow[];
  readonly competitiveFailureCauseDistribution: readonly ScoreGapCauseDistributionRow[];
  readonly scoreGapCauseWarningCodes: readonly CloseGameDistributionWarningCode[];
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function isOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) => tag.startsWith("official_route_family_")) &&
    !event.tags.includes("official_route_family_CONTINUATION") &&
    !event.tags.includes("official_route_family_candidate");
}

function distribution(values: readonly string[]): readonly ScoreGapCauseDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function finalWinnerTeam(report: MatchReport): string | null {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  if (report.score.home === report.score.away) return null;
  return report.score.home > report.score.away ? homeTeamId ?? null : awayTeamId ?? null;
}

function countByTeam(events: readonly MatchEvent[], predicate: (event: MatchEvent) => boolean): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (!predicate(event)) continue;
    counts.set(event.teamId, (counts.get(event.teamId) ?? 0) + 1);
  }
  return counts;
}

function pointsByTeam(report: MatchReport): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of report.timeline) {
    const points = scoreChangePoints(event);
    if (points === 0) continue;
    counts.set(event.teamId, (counts.get(event.teamId) ?? 0) + points);
  }
  return counts;
}

function routeQualityMismatch(report: MatchReport): boolean {
  const high = countByTeam(report.timeline, (event) => event.tags.includes("danger_quality_HIGH_QUALITY_DANGER"));
  const teams = [...high.values()].sort((a, b) => b - a);
  return (teams[0] ?? 0) >= (teams[1] ?? 0) + 3;
}

export function auditFullMatchScoreGapCauses(reports: readonly MatchReport[]): FullMatchScoreGapCauseAudit {
  let trueSkillGapSignalCount = 0;
  let tacticalMismatchSignalCount = 0;
  let fatigueMismatchSignalCount = 0;
  let routeQualityMismatchSignalCount = 0;
  let goalkeeperMismatchSignalCount = 0;
  let opportunityVolumeGapSignalCount = 0;
  let scoringEfficiencyGapSignalCount = 0;
  let dominanceChainGapSignalCount = 0;
  let recoveryFailureGapSignalCount = 0;
  let artificialGapSuspicionCount = 0;
  const causes: string[] = [];
  const failures: string[] = [];

  for (const report of reports) {
    const diff = Math.abs(report.score.home - report.score.away);
    const winner = finalWinnerTeam(report);
    const opportunityCounts = countByTeam(report.timeline, isOpportunity);
    const scoringCounts = countByTeam(report.timeline, (event) => scoreChangePoints(event) > 0);
    const points = pointsByTeam(report);
    const winnerOpportunities = winner === null ? 0 : opportunityCounts.get(winner) ?? 0;
    const otherOpportunities = [...opportunityCounts.entries()]
      .filter(([teamId]) => teamId !== winner)
      .reduce((sum, [, count]) => sum + count, 0);
    const winnerScores = winner === null ? 0 : scoringCounts.get(winner) ?? 0;
    const otherScores = [...scoringCounts.entries()]
      .filter(([teamId]) => teamId !== winner)
      .reduce((sum, [, count]) => sum + count, 0);
    const winnerPoints = winner === null ? 0 : points.get(winner) ?? 0;
    const otherPoints = [...points.entries()]
      .filter(([teamId]) => teamId !== winner)
      .reduce((sum, [, count]) => sum + count, 0);

    if (diff >= 15 && winnerOpportunities >= otherOpportunities + 4) {
      opportunityVolumeGapSignalCount += 1;
      causes.push("OPPORTUNITY_VOLUME_GAP");
    }
    if (diff >= 15 && winnerScores >= otherScores + 2 && winnerOpportunities <= otherOpportunities + 2) {
      scoringEfficiencyGapSignalCount += 1;
      causes.push("SCORING_EFFICIENCY_GAP");
    }
    if (routeQualityMismatch(report)) {
      routeQualityMismatchSignalCount += 1;
      causes.push("ROUTE_QUALITY_MISMATCH");
    }
    if (report.timeline.some((event) => event.tags.includes("leading_team_repeat_opportunity_dampened_6t") || event.tags.includes("repeat_opportunity_dampener_6s"))) {
      dominanceChainGapSignalCount += 1;
      causes.push("DOMINANCE_CHAIN_OR_MOMENTUM");
    }
    if (report.timeline.some((event) => event.tags.includes("defensive_recovery_after_repeated_danger_6s") || event.tags.includes("trailing_team_response_opportunity_6t"))) {
      recoveryFailureGapSignalCount += 1;
      causes.push("RECOVERY_RESPONSE_SIGNAL");
    }
    if (report.timeline.some((event) => event.tags.includes("goalkeeper_secure_reset_break_6l") || event.tags.includes("goalkeeper_secure_to_safe_possession"))) {
      goalkeeperMismatchSignalCount += 1;
      causes.push("GOALKEEPER_RESET_OR_WEAKNESS");
    }
    if (report.timeline.some((event) => event.tags.includes("fatigue_cost_for_repeated_danger") || event.tags.includes("pressure_fatigue_context"))) {
      fatigueMismatchSignalCount += 1;
      causes.push("FATIGUE_OR_PRESSURE_MISMATCH");
    }
    if (winnerPoints > otherPoints && winnerOpportunities > otherOpportunities && routeQualityMismatch(report)) {
      trueSkillGapSignalCount += 1;
      tacticalMismatchSignalCount += 1;
      causes.push("TRUE_TACTICAL_SUPERIORITY");
    }
    if (diff >= 15 && winnerOpportunities <= otherOpportunities + 1 && winnerScores >= otherScores + 3) {
      artificialGapSuspicionCount += 1;
      failures.push("EFFICIENCY_WITHOUT_VOLUME_CAUTION");
    }
    if (diff >= 15 && !report.timeline.some((event) => event.tags.includes("close_game_distribution_6t") || event.tags.includes("dominance_chain_calibration_coverage_6s"))) {
      artificialGapSuspicionCount += 1;
      failures.push("MISSING_CALIBRATION_CONTEXT");
    }
  }

  const warnings: CloseGameDistributionWarningCode[] = ["SCORE_GAP_CAUSES_MEASURED", "COMPETITIVE_FAILURE_CAUSES_MEASURED"];
  if (artificialGapSuspicionCount > Math.max(2, reports.length * 0.15)) warnings.push("LEADING_TEAM_RUNAWAY_TOO_HIGH");
  else warnings.push("LEADING_TEAM_RUNAWAY_CONTROLLED");

  return {
    trueSkillGapSignalCount,
    tacticalMismatchSignalCount,
    fatigueMismatchSignalCount,
    routeQualityMismatchSignalCount,
    goalkeeperMismatchSignalCount,
    opportunityVolumeGapSignalCount,
    scoringEfficiencyGapSignalCount,
    dominanceChainGapSignalCount,
    recoveryFailureGapSignalCount,
    artificialGapSuspicionCount,
    scoreGapCauseDistribution: distribution(causes.length === 0 ? ["NO_DOMINANT_GAP_CAUSE"] : causes),
    competitiveFailureCauseDistribution: distribution(failures.length === 0 ? ["NO_ARTIFICIAL_FAILURE_DOMINANT"] : failures),
    scoreGapCauseWarningCodes: [...new Set(warnings)],
  };
}
