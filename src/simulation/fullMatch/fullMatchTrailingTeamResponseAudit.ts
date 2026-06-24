import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export type TrailingTeamResponseCause =
  | "PRESSURE_RECOVERY"
  | "FORCED_TURNOVER"
  | "FATIGUE_EDGE"
  | "TACTICAL_RISK_INCREASE"
  | "ROUTE_QUALITY_EDGE"
  | "DEFENSIVE_RECOVERY"
  | "OPPONENT_MISTAKE_FORCED"
  | "LATE_GAME_PRESSURE"
  | "REST_DEFENSE_BREAK"
  | "TERRITORIAL_PRESSURE"
  | "HALF_CHANCE_CREATED"
  | "SAFE_POSSESSION_STABILIZED";

export interface TrailingTeamResponseDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchTrailingTeamResponseAudit {
  readonly matchCount: number;
  readonly trailingTeamResponseWindowCount: number;
  readonly trailingTeamResponseCount: number;
  readonly trailingTeamNoResponseCount: number;
  readonly trailingTeamResponseRate: number;
  readonly trailingTeamOpportunityShare: number;
  readonly trailingTeamScoringShare: number;
  readonly trailingTeamRecoveryShare: number;
  readonly trailingTeamPressureReliefRate: number;
  readonly trailingTeamPossessionQualityDistribution: readonly TrailingTeamResponseDistributionRow[];
  readonly trailingTeamRouteQualityDistribution: readonly TrailingTeamResponseDistributionRow[];
  readonly trailingTeamEarnedDangerCount: number;
  readonly trailingTeamHalfChanceCount: number;
  readonly trailingTeamTerritorialGainCount: number;
  readonly trailingTeamForcedDefensiveActionCount: number;
  readonly trailingTeamSafePossessionCount: number;
  readonly trailingTeamNeutralResetCount: number;
  readonly trailingTeamRiskIncreaseCount: number;
  readonly trailingTeamLateGameRiskIncreaseCount: number;
  readonly trailingTeamFatigueEdgeUseCount: number;
  readonly trailingTeamTacticalEdgeUseCount: number;
  readonly trailingTeamPressureWinCount: number;
  readonly trailingTeamTransitionWinCount: number;
  readonly trailingTeamMistakeForcedCount: number;
  readonly trailingTeamResponseCauseDistribution: readonly TrailingTeamResponseDistributionRow[];
  readonly trailingTeamResponseWarningCodes: readonly string[];
  readonly recommendation:
    | "KEEP_TRAILING_TEAM_RESPONSE_MONITORING"
    | "IMPROVE_TRAILING_TEAM_RESPONSE_ACCESS"
    | "REPAIR_TRAILING_TEAM_RESPONSE_GUARDRAILS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function distribution(values: readonly string[]): readonly TrailingTeamResponseDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function isRouteOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) =>
    tag.startsWith("official_route_family_") &&
    tag !== "official_route_family_candidate" &&
    tag !== "official_route_family_CONTINUATION" &&
    !tag.startsWith("official_route_family_outcome_")
  );
}

function isResponseEvent(event: MatchEvent): boolean {
  return event.tags.includes("trailing_team_response_6u") ||
    event.tags.includes("trailing_team_response_opportunity_6t") ||
    event.tags.includes("trailing_team_earned_danger_6u") ||
    event.tags.includes("trailing_team_half_chance_6u") ||
    event.tags.includes("trailing_team_territorial_gain_6u") ||
    event.tags.includes("trailing_team_forced_defensive_action_6u") ||
    event.tags.includes("trailing_team_pressure_relief_6u") ||
    isRouteOpportunity(event) ||
    event.tags.includes("official_route_family_CONTINUATION");
}

function causesForEvent(event: MatchEvent): readonly TrailingTeamResponseCause[] {
  const causes: TrailingTeamResponseCause[] = [];
  if (event.tags.includes("trailing_team_pressure_relief_6u")) causes.push("PRESSURE_RECOVERY");
  if (event.tags.includes("forced_defensive_action_layer_added") || event.tags.includes("trailing_team_forced_defensive_action_6u")) causes.push("FORCED_TURNOVER");
  if (event.tags.includes("trailing_team_fatigue_edge_6u")) causes.push("FATIGUE_EDGE");
  if (event.tags.includes("trailing_team_risk_increase_6u")) causes.push("TACTICAL_RISK_INCREASE");
  if (event.tags.includes("trailing_team_route_quality_signal_6u") || event.tags.includes("trailing_team_earned_danger_6u")) causes.push("ROUTE_QUALITY_EDGE");
  if (event.eventType === "turnover" || event.tags.includes("defensive_recovery_after_repeated_danger_6s")) causes.push("DEFENSIVE_RECOVERY");
  if (event.tags.includes("trailing_team_mistake_forced_6u")) causes.push("OPPONENT_MISTAKE_FORCED");
  if (event.tags.includes("late_game_pressure_6u") || event.tags.includes("trailing_team_late_game_pressure_6u")) causes.push("LATE_GAME_PRESSURE");
  if (event.tags.includes("rest_defense_break_6u")) causes.push("REST_DEFENSE_BREAK");
  if (event.tags.includes("territorial_gain_layer_added") || event.tags.includes("trailing_team_territorial_gain_6u")) causes.push("TERRITORIAL_PRESSURE");
  if (event.tags.includes("half_chance_layer_added") || event.tags.includes("trailing_team_half_chance_6u")) causes.push("HALF_CHANCE_CREATED");
  if (event.tags.includes("safe_possession_layer_added") || event.tags.includes("official_route_family_CONTINUATION")) causes.push("SAFE_POSSESSION_STABILIZED");
  return causes.length === 0 ? ["SAFE_POSSESSION_STABILIZED"] : [...new Set(causes)];
}

function qualityForEvent(event: MatchEvent): string {
  const quality = event.tags.find((tag) => tag.startsWith("danger_quality_"));
  return quality?.replace("danger_quality_", "") ?? (scoreChangePoints(event) > 0 ? "SCORING_ROUTE" : "POSSESSION_ROUTE");
}

function possessionQualityForEvent(event: MatchEvent): string {
  if (scoreChangePoints(event) > 0) return "SCORED";
  if (event.tags.includes("trailing_team_earned_danger_6u")) return "EARNED_DANGER";
  if (event.tags.includes("trailing_team_half_chance_6u")) return "HALF_CHANCE";
  if (event.tags.includes("trailing_team_territorial_gain_6u")) return "TERRITORIAL_GAIN";
  if (event.tags.includes("trailing_team_forced_defensive_action_6u")) return "FORCED_DEFENSIVE_ACTION";
  return "PRESSURE_RELIEF";
}

export function auditFullMatchTrailingTeamResponse(reports: readonly MatchReport[]): FullMatchTrailingTeamResponseAudit {
  let responseWindowCount = 0;
  let responseCount = 0;
  let trailingOpportunityCount = 0;
  let trailingScoreCount = 0;
  let trailingRecoveryCount = 0;
  let pressureReliefCount = 0;
  let earnedDangerCount = 0;
  let halfChanceCount = 0;
  let territorialGainCount = 0;
  let forcedDefensiveActionCount = 0;
  let safePossessionCount = 0;
  let neutralResetCount = 0;
  let riskIncreaseCount = 0;
  let lateGameRiskIncreaseCount = 0;
  let fatigueEdgeUseCount = 0;
  let tacticalEdgeUseCount = 0;
  let pressureWinCount = 0;
  let transitionWinCount = 0;
  let mistakeForcedCount = 0;
  let totalOpportunityCount = 0;
  let totalScoreCount = 0;
  let totalRecoveryCount = 0;
  const causes: TrailingTeamResponseCause[] = [];
  const possessionQuality: string[] = [];
  const routeQuality: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    let home = 0;
    let away = 0;
    let currentTrailingTeam: string | null = null;
    let waitingForResponse = false;

    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      if (isRouteOpportunity(event)) totalOpportunityCount += 1;
      if (points > 0) totalScoreCount += 1;
      if (event.eventType === "turnover" || event.tags.includes("defensive_recovery_after_repeated_danger_6s")) totalRecoveryCount += 1;

      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
        const nextTrailingTeam = home === away ? null : home < away ? homeTeamId ?? null : report.teamStats[1]?.teamId ?? null;
        if (nextTrailingTeam !== null) {
          currentTrailingTeam = nextTrailingTeam;
          waitingForResponse = true;
          responseWindowCount += 1;
        }
        continue;
      }

      if (!waitingForResponse || currentTrailingTeam === null || event.teamId !== currentTrailingTeam) continue;
      if (!isResponseEvent(event)) continue;

      responseCount += 1;
      waitingForResponse = false;
      if (isRouteOpportunity(event)) trailingOpportunityCount += 1;
      if (scoreChangePoints(event) > 0) trailingScoreCount += 1;
      if (event.eventType === "turnover" || event.tags.includes("defensive_recovery_after_repeated_danger_6s")) trailingRecoveryCount += 1;
      if (event.tags.includes("trailing_team_pressure_relief_6u") || event.tags.includes("official_route_family_CONTINUATION")) pressureReliefCount += 1;
      if (event.tags.includes("trailing_team_earned_danger_6u")) earnedDangerCount += 1;
      if (event.tags.includes("trailing_team_half_chance_6u")) halfChanceCount += 1;
      if (event.tags.includes("trailing_team_territorial_gain_6u")) territorialGainCount += 1;
      if (event.tags.includes("trailing_team_forced_defensive_action_6u")) forcedDefensiveActionCount += 1;
      if (event.tags.includes("safe_possession_layer_added") || event.tags.includes("official_route_family_CONTINUATION")) safePossessionCount += 1;
      if (event.tags.includes("neutral_phase_layer_added") || event.outcome === "neutral") neutralResetCount += 1;
      if (event.tags.includes("trailing_team_risk_increase_6u")) riskIncreaseCount += 1;
      if (event.tags.includes("trailing_team_late_game_pressure_6u")) lateGameRiskIncreaseCount += 1;
      if (event.tags.includes("trailing_team_fatigue_edge_6u")) fatigueEdgeUseCount += 1;
      if (event.tags.includes("trailing_team_tactical_response_6u")) tacticalEdgeUseCount += 1;
      if (event.tags.includes("late_game_pressure_6u") || event.tags.includes("trailing_team_pressure_relief_6u")) pressureWinCount += 1;
      if (event.tags.includes("territorial_gain_layer_added") || event.tags.includes("trailing_team_territorial_gain_6u")) transitionWinCount += 1;
      if (event.tags.includes("trailing_team_mistake_forced_6u")) mistakeForcedCount += 1;
      causes.push(...causesForEvent(event));
      possessionQuality.push(possessionQualityForEvent(event));
      routeQuality.push(qualityForEvent(event));
    }
  }

  const responseRate = percent(responseCount, responseWindowCount);
  const warningCodes = [
    "TRAILING_TEAM_RESPONSE_MEASURED",
    ...(responseRate >= 35 ? ["TRAILING_TEAM_RESPONSE_RESTORED", "TRAILING_TEAM_RESPONSE_HEALTHY"] : ["TRAILING_TEAM_RESPONSE_TOO_LOW"]),
    ...(causes.length > 0 ? ["TRAILING_TEAM_RESPONSE_CAUSES_MEASURED"] : []),
    ...(trailingOpportunityCount === 0 && responseWindowCount > 0 ? ["TRAILING_TEAM_OPPORTUNITY_SHARE_TOO_LOW"] : []),
    ...(pressureReliefCount === 0 && responseWindowCount > 0 ? ["TRAILING_TEAM_PRESSURE_RELIEF_TOO_LOW"] : []),
  ];

  return {
    matchCount: reports.length,
    trailingTeamResponseWindowCount: responseWindowCount,
    trailingTeamResponseCount: responseCount,
    trailingTeamNoResponseCount: Math.max(0, responseWindowCount - responseCount),
    trailingTeamResponseRate: responseRate,
    trailingTeamOpportunityShare: percent(trailingOpportunityCount, totalOpportunityCount),
    trailingTeamScoringShare: percent(trailingScoreCount, totalScoreCount),
    trailingTeamRecoveryShare: percent(trailingRecoveryCount, totalRecoveryCount),
    trailingTeamPressureReliefRate: percent(pressureReliefCount, responseWindowCount),
    trailingTeamPossessionQualityDistribution: distribution(possessionQuality),
    trailingTeamRouteQualityDistribution: distribution(routeQuality),
    trailingTeamEarnedDangerCount: earnedDangerCount,
    trailingTeamHalfChanceCount: halfChanceCount,
    trailingTeamTerritorialGainCount: territorialGainCount,
    trailingTeamForcedDefensiveActionCount: forcedDefensiveActionCount,
    trailingTeamSafePossessionCount: safePossessionCount,
    trailingTeamNeutralResetCount: neutralResetCount,
    trailingTeamRiskIncreaseCount: riskIncreaseCount,
    trailingTeamLateGameRiskIncreaseCount: lateGameRiskIncreaseCount,
    trailingTeamFatigueEdgeUseCount: fatigueEdgeUseCount,
    trailingTeamTacticalEdgeUseCount: tacticalEdgeUseCount,
    trailingTeamPressureWinCount: pressureWinCount,
    trailingTeamTransitionWinCount: transitionWinCount,
    trailingTeamMistakeForcedCount: mistakeForcedCount,
    trailingTeamResponseCauseDistribution: distribution(causes),
    trailingTeamResponseWarningCodes: warningCodes,
    recommendation: warningCodes.includes("TRAILING_TEAM_RESPONSE_FORCED_SUSPECTED")
      ? "REPAIR_TRAILING_TEAM_RESPONSE_GUARDRAILS"
      : responseRate >= 35
        ? "KEEP_TRAILING_TEAM_RESPONSE_MONITORING"
        : "IMPROVE_TRAILING_TEAM_RESPONSE_ACCESS",
  };
}
