import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface FullMatchThreatDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchTrailingThreatQualityAudit {
  readonly trailingThreatWindowCount: number;
  readonly trailingThreatCount: number;
  readonly trailingThreatQualityRate: number;
  readonly trailingSafePossessionCount: number;
  readonly trailingSafePossessionToThreatCount: number;
  readonly trailingSafePossessionToThreatRate: number;
  readonly trailingPressureReliefCount: number;
  readonly trailingPressureReliefToThreatCount: number;
  readonly trailingPressureReliefToThreatRate: number;
  readonly trailingHalfChanceCount: number;
  readonly trailingTerritorialGainCount: number;
  readonly trailingForcedDefensiveActionCount: number;
  readonly trailingEarnedDangerCount: number;
  readonly trailingNaturalScoringEventCount: number;
  readonly trailingThreatConversionRate: number;
  readonly trailingThreatWithoutScoreCount: number;
  readonly trailingThreatWithScoreCount: number;
  readonly trailingThreatCauseDistribution: readonly FullMatchThreatDistributionRow[];
  readonly trailingThreatQualityDistribution: readonly FullMatchThreatDistributionRow[];
  readonly warnings: readonly string[];
  readonly recommendation:
    | "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING"
    | "IMPROVE_TRAILING_THREAT_QUALITY"
    | "REPAIR_TRAILING_THREAT_QUALITY_GUARDRAILS";
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

function isThreat(event: MatchEvent): boolean {
  return event.tags.includes("trailing_threat_territorial_gain_6v") ||
    event.tags.includes("trailing_threat_forced_defensive_action_6v") ||
    event.tags.includes("trailing_threat_half_chance_6v") ||
    event.tags.includes("trailing_threat_earned_danger_6v") ||
    event.tags.includes("trailing_threat_scoring_opportunity_6v") ||
    scoreChangePoints(event) > 0;
}

function quality(event: MatchEvent): string {
  if (scoreChangePoints(event) > 0) return "NATURAL_SCORING_EVENT";
  if (event.tags.includes("trailing_threat_scoring_opportunity_6v")) return "SCORING_OPPORTUNITY";
  if (event.tags.includes("trailing_threat_earned_danger_6v")) return "EARNED_DANGER";
  if (event.tags.includes("trailing_threat_half_chance_6v")) return "HALF_CHANCE";
  if (event.tags.includes("trailing_threat_forced_defensive_action_6v")) return "FORCED_DEFENSIVE_ACTION";
  if (event.tags.includes("trailing_threat_territorial_gain_6v")) return "TERRITORIAL_GAIN";
  if (event.tags.includes("trailing_team_pressure_relief_6u")) return "PRESSURE_RELIEF";
  return "SAFE_POSSESSION";
}

function causes(event: MatchEvent): readonly string[] {
  const result: string[] = [];
  if (event.tags.includes("trailing_route_quality_to_threat_6v")) result.push("ROUTE_QUALITY_EDGE");
  if (event.tags.includes("trailing_tactical_edge_to_threat_6v")) result.push("TACTICAL_EDGE");
  if (event.tags.includes("trailing_late_game_threat_6v")) result.push("LATE_GAME_PRESSURE");
  if (event.tags.includes("trailing_safe_possession_to_threat_6v")) result.push("SAFE_POSSESSION_TO_THREAT");
  if (event.tags.includes("trailing_pressure_relief_to_threat_6v")) result.push("PRESSURE_RELIEF_TO_THREAT");
  if (scoreChangePoints(event) > 0) result.push("NATURAL_CONVERSION");
  return result.length === 0 ? ["SAFE_POSSESSION_STABILIZED"] : result;
}

function isResponseEvent(event: MatchEvent): boolean {
  return event.tags.includes("trailing_threat_quality_measured_6v") ||
    event.tags.includes("trailing_team_response_6u") ||
    event.tags.includes("trailing_team_response_opportunity_6t");
}

export function auditFullMatchTrailingThreatQuality(reports: readonly MatchReport[]): FullMatchTrailingThreatQualityAudit {
  let windows = 0;
  let threatCount = 0;
  let safe = 0;
  let safeToThreat = 0;
  let relief = 0;
  let reliefToThreat = 0;
  let halfChance = 0;
  let territorial = 0;
  let forced = 0;
  let earned = 0;
  let naturalScores = 0;
  const qualityRows: string[] = [];
  const causeRows: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    const awayTeamId = report.teamStats[1]?.teamId;
    let home = 0;
    let away = 0;
    let trailingTeam: string | null = null;
    let waiting = false;

    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      if (points > 0) {
        if (waiting && trailingTeam !== null && event.teamId === trailingTeam) {
          naturalScores += 1;
          threatCount += 1;
          qualityRows.push(quality(event));
          causeRows.push(...causes(event));
          waiting = false;
        }
        if (event.teamId === homeTeamId) home += points;
        else away += points;
        const nextTrailing: string | null = home === away ? null : home < away ? homeTeamId ?? null : awayTeamId ?? null;
        if (nextTrailing !== null) {
          trailingTeam = nextTrailing;
          waiting = true;
          windows += 1;
        }
        continue;
      }

      if (!waiting || trailingTeam === null || event.teamId !== trailingTeam || !isResponseEvent(event)) continue;
      waiting = false;
      const eventQuality = quality(event);
      const eventThreat = isThreat(event);
      if (event.tags.includes("trailing_threat_safe_possession_6v") || event.tags.includes("safe_possession_layer_added")) safe += 1;
      if (event.tags.includes("trailing_team_pressure_relief_6u")) relief += 1;
      if (event.tags.includes("trailing_safe_possession_to_threat_6v")) safeToThreat += 1;
      if (event.tags.includes("trailing_pressure_relief_to_threat_6v")) reliefToThreat += 1;
      if (eventQuality === "HALF_CHANCE") halfChance += 1;
      if (eventQuality === "TERRITORIAL_GAIN") territorial += 1;
      if (eventQuality === "FORCED_DEFENSIVE_ACTION") forced += 1;
      if (eventQuality === "EARNED_DANGER" || eventQuality === "SCORING_OPPORTUNITY") earned += 1;
      if (eventThreat) threatCount += 1;
      qualityRows.push(eventQuality);
      causeRows.push(...causes(event));
    }
  }

  const warnings = [
    "TRAILING_THREAT_QUALITY_MEASURED",
    ...(percent(threatCount, windows) >= 18 ? ["TRAILING_THREAT_QUALITY_IMPROVED"] : ["TRAILING_THREAT_QUALITY_TOO_LOW"]),
    ...(territorial > 0 ? ["TRAILING_TERRITORIAL_GAIN_RESTORED"] : ["TRAILING_TERRITORIAL_GAIN_STILL_ZERO"]),
    ...(forced > 0 ? ["TRAILING_FORCED_DEFENSIVE_ACTION_RESTORED"] : ["TRAILING_FORCED_DEFENSIVE_ACTION_STILL_ZERO"]),
    ...(halfChance > 0 ? ["TRAILING_HALF_CHANCE_IMPROVED"] : []),
    ...(earned > 0 ? ["TRAILING_EARNED_DANGER_IMPROVED"] : []),
    ...(naturalScores > 0 ? ["TRAILING_SCORING_SHARE_RESTORED_NATURALLY"] : ["TRAILING_SCORING_SHARE_STILL_ZERO"]),
  ];

  return {
    trailingThreatWindowCount: windows,
    trailingThreatCount: threatCount,
    trailingThreatQualityRate: percent(threatCount, windows),
    trailingSafePossessionCount: safe,
    trailingSafePossessionToThreatCount: safeToThreat,
    trailingSafePossessionToThreatRate: percent(safeToThreat, safe),
    trailingPressureReliefCount: relief,
    trailingPressureReliefToThreatCount: reliefToThreat,
    trailingPressureReliefToThreatRate: percent(reliefToThreat, relief),
    trailingHalfChanceCount: halfChance,
    trailingTerritorialGainCount: territorial,
    trailingForcedDefensiveActionCount: forced,
    trailingEarnedDangerCount: earned,
    trailingNaturalScoringEventCount: naturalScores,
    trailingThreatConversionRate: percent(naturalScores, threatCount),
    trailingThreatWithoutScoreCount: Math.max(0, threatCount - naturalScores),
    trailingThreatWithScoreCount: naturalScores,
    trailingThreatCauseDistribution: distribution(causeRows),
    trailingThreatQualityDistribution: distribution(qualityRows),
    warnings,
    recommendation: percent(threatCount, windows) >= 18
      ? "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING"
      : "IMPROVE_TRAILING_THREAT_QUALITY",
  };
}
