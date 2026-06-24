import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface LateGamePressureDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchLateGamePressureAudit {
  readonly matchCount: number;
  readonly lateGameWindowCount: number;
  readonly lateGameCloseWindowCount: number;
  readonly finalQuarterCompetitiveWindowCount: number;
  readonly trailingTeamLateGamePossessionCount: number;
  readonly trailingTeamLateGamePressureCount: number;
  readonly trailingTeamLateGameRecoveryCount: number;
  readonly trailingTeamLateGameOpportunityCount: number;
  readonly trailingTeamLateGameScoringEventCount: number;
  readonly trailingTeamLateGameHalfChanceCount: number;
  readonly trailingTeamLateGameTerritorialGainCount: number;
  readonly leadingTeamLateGameControlCount: number;
  readonly leadingTeamLateGameRunawayCount: number;
  readonly lateGamePressureRate: number;
  readonly lateGameCloseRate: number;
  readonly finalQuarterCompetitiveRate: number;
  readonly lateGamePressureCauseDistribution: readonly LateGamePressureDistributionRow[];
  readonly lateGamePressureWarningCodes: readonly string[];
  readonly recommendation:
    | "KEEP_LATE_GAME_PRESSURE_MONITORING"
    | "IMPROVE_LATE_GAME_TRAILING_PRESSURE"
    | "REPAIR_LATE_GAME_PRESSURE_GUARDRAILS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function distribution(values: readonly string[]): readonly LateGamePressureDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
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

function isOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) =>
    tag.startsWith("official_route_family_") &&
    tag !== "official_route_family_candidate" &&
    tag !== "official_route_family_CONTINUATION" &&
    !tag.startsWith("official_route_family_outcome_")
  );
}

function causeForLateEvent(event: MatchEvent): string {
  if (event.tags.includes("late_game_pressure_6u") || event.tags.includes("trailing_team_late_game_pressure_6u")) return "LATE_GAME_PRESSURE";
  if (event.tags.includes("trailing_team_earned_danger_6u")) return "ROUTE_QUALITY_EDGE";
  if (event.tags.includes("trailing_team_half_chance_6u")) return "HALF_CHANCE_CREATED";
  if (event.tags.includes("trailing_team_territorial_gain_6u")) return "TERRITORIAL_PRESSURE";
  if (event.tags.includes("trailing_team_forced_defensive_action_6u")) return "FORCED_TURNOVER";
  if (event.tags.includes("trailing_team_risk_increase_6u")) return "TACTICAL_RISK_INCREASE";
  if (event.tags.includes("official_route_family_CONTINUATION")) return "SAFE_POSSESSION_STABILIZED";
  return "PRESSURE_WINDOW";
}

export function auditFullMatchLateGamePressure(reports: readonly MatchReport[]): FullMatchLateGamePressureAudit {
  let lateGameWindowCount = 0;
  let lateGameCloseWindowCount = 0;
  let finalQuarterCompetitiveWindowCount = 0;
  let trailingPossessionCount = 0;
  let trailingPressureCount = 0;
  let trailingRecoveryCount = 0;
  let trailingOpportunityCount = 0;
  let trailingScoringCount = 0;
  let trailingHalfChanceCount = 0;
  let trailingTerritorialGainCount = 0;
  let leadingControlCount = 0;
  let leadingRunawayCount = 0;
  const causes: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    const awayTeamId = report.teamStats[1]?.teamId;
    const score60 = scoreAtMinute(report, 60);
    const score75 = scoreAtMinute(report, 75);
    const lateDiff = Math.abs(score75.home - score75.away);
    lateGameWindowCount += 1;
    if (lateDiff <= 7) lateGameCloseWindowCount += 1;
    if (Math.abs(score60.home - score60.away) <= 12 || lateDiff <= 12) finalQuarterCompetitiveWindowCount += 1;

    let home = 0;
    let away = 0;
    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
      }
      if (event.timestamp.minute < 60) continue;
      const teamPoints = event.teamId === homeTeamId ? home : away;
      const opponentPoints = event.teamId === homeTeamId ? away : home;
      const isTrailing = teamPoints < opponentPoints;
      const isLeading = teamPoints > opponentPoints;

      if (isTrailing) {
        trailingPossessionCount += 1;
        if (event.tags.includes("late_game_pressure_6u") || event.tags.includes("trailing_team_late_game_pressure_6u")) trailingPressureCount += 1;
        if (event.eventType === "turnover" || event.tags.includes("defensive_recovery_after_repeated_danger_6s")) trailingRecoveryCount += 1;
        if (isOpportunity(event)) trailingOpportunityCount += 1;
        if (points > 0) trailingScoringCount += 1;
        if (event.tags.includes("half_chance_layer_added") || event.tags.includes("trailing_team_half_chance_6u")) trailingHalfChanceCount += 1;
        if (event.tags.includes("territorial_gain_layer_added") || event.tags.includes("trailing_team_territorial_gain_6u")) trailingTerritorialGainCount += 1;
        if (event.tags.includes("late_game_pressure_6u") || event.tags.some((tag) => tag.startsWith("trailing_team_"))) causes.push(causeForLateEvent(event));
      } else if (isLeading) {
        if (event.tags.includes("official_route_family_CONTINUATION") || event.outcome === "neutral") leadingControlCount += 1;
        if (isOpportunity(event) && Math.abs(teamPoints - opponentPoints) >= 12) leadingRunawayCount += 1;
      }
      void awayTeamId;
    }
  }

  const pressureRate = percent(trailingPressureCount, trailingPossessionCount);
  const warningCodes = [
    "LATE_GAME_PRESSURE_MEASURED",
    ...(pressureRate >= 10 ? ["LATE_GAME_PRESSURE_HEALTHY"] : ["LATE_GAME_PRESSURE_TOO_LOW"]),
    ...(lateGameCloseWindowCount > 0 ? ["LATE_GAME_COMPETITION_PRESERVED"] : []),
    ...(finalQuarterCompetitiveWindowCount > 0 ? ["FINAL_QUARTER_COMPETITION_PRESERVED"] : []),
  ];

  return {
    matchCount: reports.length,
    lateGameWindowCount,
    lateGameCloseWindowCount,
    finalQuarterCompetitiveWindowCount,
    trailingTeamLateGamePossessionCount: trailingPossessionCount,
    trailingTeamLateGamePressureCount: trailingPressureCount,
    trailingTeamLateGameRecoveryCount: trailingRecoveryCount,
    trailingTeamLateGameOpportunityCount: trailingOpportunityCount,
    trailingTeamLateGameScoringEventCount: trailingScoringCount,
    trailingTeamLateGameHalfChanceCount: trailingHalfChanceCount,
    trailingTeamLateGameTerritorialGainCount: trailingTerritorialGainCount,
    leadingTeamLateGameControlCount: leadingControlCount,
    leadingTeamLateGameRunawayCount: leadingRunawayCount,
    lateGamePressureRate: pressureRate,
    lateGameCloseRate: percent(lateGameCloseWindowCount, lateGameWindowCount),
    finalQuarterCompetitiveRate: percent(finalQuarterCompetitiveWindowCount, lateGameWindowCount),
    lateGamePressureCauseDistribution: distribution(causes),
    lateGamePressureWarningCodes: warningCodes,
    recommendation: pressureRate >= 10
      ? "KEEP_LATE_GAME_PRESSURE_MONITORING"
      : "IMPROVE_LATE_GAME_TRAILING_PRESSURE",
  };
}
