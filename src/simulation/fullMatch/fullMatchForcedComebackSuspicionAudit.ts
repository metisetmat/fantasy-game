import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { LateGameThreatMonitoringDistributionRow } from "./fullMatchLateGameThreatAutomaticityAudit";

export interface FullMatchForcedComebackSuspicionAudit {
  readonly forcedComebackSuspicionCount: number;
  readonly forcedComebackSuspicionRate: number;
  readonly forcedComebackSuspicionExplainedCount: number;
  readonly forcedComebackSuspicionUnexplainedCount: number;
  readonly forcedComebackSuspicionByScoreState: readonly LateGameThreatMonitoringDistributionRow[];
  readonly forcedComebackSuspicionByPhase: readonly LateGameThreatMonitoringDistributionRow[];
  readonly forcedComebackSuspicionByRouteFamily: readonly LateGameThreatMonitoringDistributionRow[];
  readonly forcedComebackSuspicionByThreatType: readonly LateGameThreatMonitoringDistributionRow[];
  readonly forcedComebackSuspicionCauseDistribution: readonly LateGameThreatMonitoringDistributionRow[];
  readonly actualForcedComebackDetectedCount: number;
  readonly forcedTrailingScoreChangeCount: number;
  readonly injectedTrailingScoringEventCount: number;
  readonly trailingOpportunityForcedCount: number;
  readonly leadingTeamScoreSuppressionDetectedCount: number;
  readonly rubberBandingDetectedCount: number;
  readonly suspicionFalsePositiveCount: number;
  readonly suspicionTruePositiveCount: number;
  readonly forcedComebackSuspicionWarningCodes: readonly string[];
  readonly recommendation:
    | "KEEP_FORCED_COMEBACK_SUSPICION_MONITORING"
    | "EXPLAIN_FORCED_COMEBACK_SUSPICION"
    | "REPAIR_FORCED_COMEBACK_GUARDRAILS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function distribution(values: readonly string[]): readonly LateGameThreatMonitoringDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function routeFamily(event: MatchEvent): string {
  return event.scoringFamily ?? event.tags.find((tag) => tag.startsWith("official_route_family_"))?.replace("official_route_family_", "") ?? "UNKNOWN";
}

function threatType(event: MatchEvent): string {
  if (scoreChangePoints(event) > 0) return "NATURAL_TRAILING_SCORE";
  if (event.tags.includes("trailing_threat_scoring_opportunity_6v")) return "SCORING_OPPORTUNITY";
  if (event.tags.includes("trailing_threat_earned_danger_6v")) return "EARNED_DANGER";
  if (event.tags.includes("trailing_threat_half_chance_6v")) return "HALF_CHANCE";
  if (event.tags.includes("trailing_threat_forced_defensive_action_6v")) return "FORCED_DEFENSIVE_ACTION";
  if (event.tags.includes("trailing_threat_territorial_gain_6v")) return "TERRITORIAL_GAIN";
  return "PRESSURE_RELIEF";
}

function cause(event: MatchEvent): string {
  if (event.tags.some((tag) => tag.includes("injected"))) return "UNEXPLAINED_TRAILING_SCORE";
  if (scoreChangePoints(event) > 0 && (event.scoringFamily !== undefined || event.tags.some((tag) => tag.startsWith("official_route_family_")))) return "NATURAL_OFFICIAL_SCORE_CHANGE";
  if (event.tags.includes("late_game_threat_from_real_signal_6w")) return "FALSE_POSITIVE_GUARDRAIL_CLEAN";
  if (event.tags.includes("trailing_route_quality_to_threat_6v")) return "NATURAL_ROUTE_QUALITY_EDGE";
  if (event.tags.includes("trailing_tactical_edge_to_threat_6v")) return "NATURAL_TACTICAL_EDGE";
  if (event.tags.includes("trailing_team_risk_increase_6u")) return "NATURAL_LATE_GAME_RISK";
  if (event.tags.includes("trailing_team_pressure_relief_6u")) return "NATURAL_PRESSURE_RECOVERY";
  if (event.tags.includes("trailing_threat_earned_danger_6v")) return "NATURAL_EARNED_DANGER";
  if (event.tags.includes("late_game_threat_supported_6w")) return "FALSE_POSITIVE_GUARDRAIL_CLEAN";
  return "SCORE_STATE_ONLY_SUSPICION";
}

export function auditFullMatchForcedComebackSuspicion(reports: readonly MatchReport[]): FullMatchForcedComebackSuspicionAudit {
  let suspicion = 0;
  let explained = 0;
  let actual = 0;
  let forcedTrailing = 0;
  let injected = 0;
  let opportunityForced = 0;
  let leadingSuppressed = 0;
  let rubber = 0;
  const scoreStates: string[] = [];
  const phases: string[] = [];
  const routeFamilies: string[] = [];
  const threatTypes: string[] = [];
  const causes: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    let home = 0;
    let away = 0;
    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      const teamPoints = event.teamId === homeTeamId ? home : away;
      const opponentPoints = event.teamId === homeTeamId ? away : home;
      const trailingContext = teamPoints < opponentPoints;
      const suspicious = trailingContext && (
        points > 0 ||
        event.tags.includes("late_game_threat_supported_6w") ||
        event.tags.includes("trailing_threat_scoring_opportunity_6v") ||
        event.tags.includes("trailing_threat_earned_danger_6v")
      );
      if (event.tags.some((tag) => tag === "forced_comeback_detected" || tag === "rubber_banding_detected" || tag === "rubber_banding_applied")) actual += 1;
      if (event.tags.some((tag) => tag.includes("forced_trailing"))) forcedTrailing += 1;
      if (event.tags.some((tag) => tag.includes("injected"))) injected += 1;
      if (event.tags.some((tag) => tag.includes("opportunity_forced"))) opportunityForced += 1;
      if (event.tags.some((tag) => tag.includes("leading_team_score_suppressed"))) leadingSuppressed += 1;
      if (event.tags.some((tag) => tag === "rubber_banding_detected" || tag === "rubber_banding_applied")) rubber += 1;
      if (suspicious) {
        suspicion += 1;
        const eventCause = cause(event);
        const eventExplained = !eventCause.startsWith("SCORE_STATE_ONLY") && !eventCause.startsWith("UNEXPLAINED");
        if (eventExplained) explained += 1;
        causes.push(eventCause);
        scoreStates.push(Math.abs(teamPoints - opponentPoints) <= 5 ? "ONE_SCORE_TRAILING" : "MULTI_SCORE_TRAILING");
        phases.push(event.timestamp.minute >= 60 ? "LATE_GAME" : "OPEN_GAME");
        routeFamilies.push(routeFamily(event));
        threatTypes.push(threatType(event));
      }
      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
      }
    }
  }
  const unexplained = Math.max(0, suspicion - explained);
  const warnings = [
    "FORCED_COMEBACK_SUSPICION_MEASURED",
    ...(unexplained <= Math.max(2, Math.round(suspicion * 0.1)) ? ["FORCED_COMEBACK_SUSPICION_EXPLAINED", "FORCED_COMEBACK_FALSE_POSITIVES_CLASSIFIED"] : ["FORCED_COMEBACK_SUSPICION_UNEXPLAINED"]),
    ...(actual === 0 ? ["NO_ACTUAL_FORCED_COMEBACK_CONFIRMED"] : ["ACTUAL_FORCED_COMEBACK_DETECTED"]),
  ];

  return {
    forcedComebackSuspicionCount: suspicion,
    forcedComebackSuspicionRate: percent(suspicion, reports.flatMap((report) => report.timeline).length),
    forcedComebackSuspicionExplainedCount: explained,
    forcedComebackSuspicionUnexplainedCount: unexplained,
    forcedComebackSuspicionByScoreState: distribution(scoreStates),
    forcedComebackSuspicionByPhase: distribution(phases),
    forcedComebackSuspicionByRouteFamily: distribution(routeFamilies),
    forcedComebackSuspicionByThreatType: distribution(threatTypes),
    forcedComebackSuspicionCauseDistribution: distribution(causes),
    actualForcedComebackDetectedCount: actual,
    forcedTrailingScoreChangeCount: forcedTrailing,
    injectedTrailingScoringEventCount: injected,
    trailingOpportunityForcedCount: opportunityForced,
    leadingTeamScoreSuppressionDetectedCount: leadingSuppressed,
    rubberBandingDetectedCount: rubber,
    suspicionFalsePositiveCount: explained,
    suspicionTruePositiveCount: actual + forcedTrailing + injected + opportunityForced + leadingSuppressed + rubber,
    forcedComebackSuspicionWarningCodes: warnings,
    recommendation: actual + forcedTrailing + injected + opportunityForced + leadingSuppressed + rubber > 0
      ? "REPAIR_FORCED_COMEBACK_GUARDRAILS"
      : unexplained <= Math.max(2, Math.round(suspicion * 0.1))
        ? "KEEP_FORCED_COMEBACK_SUSPICION_MONITORING"
        : "EXPLAIN_FORCED_COMEBACK_SUSPICION",
  };
}
