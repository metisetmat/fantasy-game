import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { FullMatchThreatDistributionRow } from "./fullMatchTrailingThreatQualityAudit";

export interface FullMatchLateGameThreatQualityAudit {
  readonly lateGameWindowCount: number;
  readonly lateGamePressureCount: number;
  readonly lateGameThreatCount: number;
  readonly lateGameThreatQualityRate: number;
  readonly trailingLateGameThreatCount: number;
  readonly trailingLateGameHalfChanceCount: number;
  readonly trailingLateGameTerritorialGainCount: number;
  readonly trailingLateGameForcedDefensiveActionCount: number;
  readonly trailingLateGameEarnedDangerCount: number;
  readonly trailingLateGameNaturalScoringEventCount: number;
  readonly leadingTeamLateGameControlCount: number;
  readonly leadingTeamLateGameRunawayCount: number;
  readonly lateGameThreatCauseDistribution: readonly FullMatchThreatDistributionRow[];
  readonly warnings: readonly string[];
  readonly recommendation:
    | "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING"
    | "IMPROVE_LATE_GAME_THREAT_QUALITY"
    | "REPAIR_LATE_GAME_THREAT_GUARDRAILS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function distribution(values: readonly string[]): readonly FullMatchThreatDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

export function auditFullMatchLateGameThreatQuality(reports: readonly MatchReport[]): FullMatchLateGameThreatQualityAudit {
  let windows = 0;
  let pressure = 0;
  let threat = 0;
  let trailingThreat = 0;
  let half = 0;
  let territorial = 0;
  let forced = 0;
  let earned = 0;
  let natural = 0;
  let leadingControl = 0;
  let leadingRunaway = 0;
  const causes: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    let home = 0;
    let away = 0;

    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      if (event.timestamp.minute < 60) {
        if (points > 0) {
          if (event.teamId === homeTeamId) home += points;
          else away += points;
        }
        continue;
      }

      windows += 1;
      const teamPoints = event.teamId === homeTeamId ? home : away;
      const opponentPoints = event.teamId === homeTeamId ? away : home;
      const isTrailing = teamPoints < opponentPoints;
      const isLeading = teamPoints > opponentPoints;
      const isThreat = event.tags.includes("trailing_late_game_threat_6v") ||
        event.tags.includes("trailing_threat_scoring_opportunity_6v") ||
        event.tags.includes("trailing_threat_earned_danger_6v") ||
        event.tags.includes("trailing_threat_half_chance_6v") ||
        event.tags.includes("trailing_threat_forced_defensive_action_6v") ||
        event.tags.includes("trailing_threat_territorial_gain_6v");

      if (event.tags.includes("late_game_threat_quality_measured_6v") || event.tags.includes("late_game_pressure_6u")) pressure += 1;
      if (isThreat) threat += 1;
      if (isTrailing && isThreat) trailingThreat += 1;
      if (isTrailing && event.tags.includes("trailing_threat_half_chance_6v")) half += 1;
      if (isTrailing && event.tags.includes("trailing_threat_territorial_gain_6v")) territorial += 1;
      if (isTrailing && event.tags.includes("trailing_threat_forced_defensive_action_6v")) forced += 1;
      if (isTrailing && (event.tags.includes("trailing_threat_earned_danger_6v") || event.tags.includes("trailing_threat_scoring_opportunity_6v"))) earned += 1;
      if (isTrailing && points > 0) natural += 1;
      if (isLeading && (event.tags.includes("official_route_family_CONTINUATION") || event.outcome === "neutral")) leadingControl += 1;
      if (isLeading && Math.abs(teamPoints - opponentPoints) >= 12 && event.tags.some((tag) => tag.startsWith("official_route_family_"))) leadingRunaway += 1;
      if (isThreat) {
        if (event.tags.includes("trailing_late_game_threat_6v")) causes.push("LATE_GAME_PRESSURE");
        if (event.tags.includes("trailing_route_quality_to_threat_6v")) causes.push("ROUTE_QUALITY_EDGE");
        if (event.tags.includes("trailing_tactical_edge_to_threat_6v")) causes.push("TACTICAL_EDGE");
      }

      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
      }
    }
  }

  const rate = percent(threat, pressure);
  const warnings = [
    "LATE_GAME_THREAT_QUALITY_MEASURED",
    ...(rate >= 12 ? ["LATE_GAME_THREAT_QUALITY_IMPROVED"] : ["LATE_GAME_THREAT_QUALITY_TOO_LOW"]),
  ];

  return {
    lateGameWindowCount: windows,
    lateGamePressureCount: pressure,
    lateGameThreatCount: threat,
    lateGameThreatQualityRate: rate,
    trailingLateGameThreatCount: trailingThreat,
    trailingLateGameHalfChanceCount: half,
    trailingLateGameTerritorialGainCount: territorial,
    trailingLateGameForcedDefensiveActionCount: forced,
    trailingLateGameEarnedDangerCount: earned,
    trailingLateGameNaturalScoringEventCount: natural,
    leadingTeamLateGameControlCount: leadingControl,
    leadingTeamLateGameRunawayCount: leadingRunaway,
    lateGameThreatCauseDistribution: distribution(causes),
    warnings,
    recommendation: rate >= 12 ? "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING" : "IMPROVE_LATE_GAME_THREAT_QUALITY",
  };
}
