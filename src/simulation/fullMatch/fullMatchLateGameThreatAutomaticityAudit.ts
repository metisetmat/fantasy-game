import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface LateGameThreatMonitoringDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchLateGameThreatAutomaticityAudit {
  readonly lateGameWindowCount: number;
  readonly lateGamePressureCount: number;
  readonly lateGameThreatCount: number;
  readonly lateGameThreatQualityRate: number;
  readonly lateGameAutomaticThreatCount: number;
  readonly lateGameAutomaticThreatRate: number;
  readonly lateGameThreatWithoutSignalCount: number;
  readonly lateGameThreatWithoutSignalRate: number;
  readonly lateGameThreatFromRealSignalCount: number;
  readonly lateGameThreatFromRealSignalRate: number;
  readonly lateGameThreatDeniedCount: number;
  readonly lateGameThreatDowngradedCount: number;
  readonly lateGamePressureToThreatRate: number;
  readonly lateGamePressureToNoThreatRate: number;
  readonly lateGameThreatEligibilityDistribution: readonly LateGameThreatMonitoringDistributionRow[];
  readonly lateGameThreatCauseDistribution: readonly LateGameThreatMonitoringDistributionRow[];
  readonly lateGameAutomaticityWarningCodes: readonly string[];
  readonly recommendation:
    | "KEEP_LATE_GAME_THREAT_MONITORING"
    | "EXPLAIN_LATE_GAME_THREAT_AUTOMATICITY"
    | "REPAIR_LATE_GAME_THREAT_AUTOMATICITY";
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

function isLatePressure(event: MatchEvent): boolean {
  return event.tags.includes("late_game_threat_automaticity_measured_6w") ||
    event.tags.includes("late_game_threat_quality_measured_6v") ||
    event.tags.includes("late_game_pressure_6u");
}

function isThreat(event: MatchEvent): boolean {
  return event.tags.includes("late_game_threat_supported_6w") ||
    event.tags.includes("trailing_threat_scoring_opportunity_6v") ||
    event.tags.includes("trailing_threat_earned_danger_6v") ||
    event.tags.includes("trailing_threat_half_chance_6v") ||
    event.tags.includes("trailing_threat_forced_defensive_action_6v") ||
    event.tags.includes("trailing_threat_territorial_gain_6v") ||
    scoreChangePoints(event) > 0;
}

function hasRealSignal(event: MatchEvent): boolean {
  return event.tags.includes("late_game_threat_from_real_signal_6w") ||
    event.tags.includes("trailing_route_quality_to_threat_6v") ||
    event.tags.includes("trailing_tactical_edge_to_threat_6v") ||
    event.tags.includes("trailing_team_route_quality_signal_6u") ||
    event.tags.includes("trailing_team_risk_increase_6u") ||
    event.tags.includes("earned_danger_confirmed") ||
    event.tags.some((tag) => tag.startsWith("danger_quality_"));
}

function causeForEvent(event: MatchEvent): string {
  if (event.tags.includes("trailing_route_quality_to_threat_6v")) return "ROUTE_QUALITY_EDGE";
  if (event.tags.includes("trailing_tactical_edge_to_threat_6v")) return "TACTICAL_EDGE";
  if (event.tags.includes("late_game_threat_from_real_signal_6w")) return "REAL_SIGNAL";
  if (event.tags.includes("late_game_threat_downgraded_6w")) return "UNSUPPORTED_DOWNGRADED";
  return "LATE_GAME_STATE_ONLY";
}

export function auditFullMatchLateGameThreatAutomaticity(reports: readonly MatchReport[]): FullMatchLateGameThreatAutomaticityAudit {
  let windows = 0;
  let pressure = 0;
  let threat = 0;
  let automatic = 0;
  let withoutSignal = 0;
  let realSignal = 0;
  let denied = 0;
  let downgraded = 0;
  const eligibility: string[] = [];
  const causes: string[] = [];

  for (const report of reports) {
    for (const event of report.timeline) {
      if (event.timestamp.minute < 60) continue;
      windows += 1;
      const latePressure = isLatePressure(event);
      const eventThreat = isThreat(event);
      const real = hasRealSignal(event);
      if (latePressure) pressure += 1;
      if (eventThreat) threat += 1;
      if (eventThreat && real) realSignal += 1;
      if (eventThreat && !real) {
        automatic += 1;
        withoutSignal += 1;
      }
      if (latePressure && !eventThreat) denied += 1;
      if (event.tags.includes("late_game_threat_downgraded_6w")) downgraded += 1;
      if (latePressure || eventThreat) {
        eligibility.push(eventThreat ? (real ? "THREAT_WITH_REAL_SIGNAL" : "AUTOMATIC_THREAT") : "PRESSURE_DENIED");
        causes.push(causeForEvent(event));
      }
    }
  }

  const automaticRate = percent(automatic, threat);
  const withoutSignalRate = percent(withoutSignal, threat);
  const warnings = [
    "LATE_GAME_THREAT_AUTOMATICITY_MEASURED",
    ...(automaticRate <= 15 ? ["LATE_GAME_THREAT_AUTOMATICITY_REDUCED"] : ["LATE_GAME_THREAT_AUTOMATICITY_TOO_HIGH"]),
    ...(withoutSignalRate <= 10 ? ["LATE_GAME_THREAT_FROM_REAL_SIGNAL_CONFIRMED"] : ["LATE_GAME_THREAT_WITHOUT_SIGNAL_TOO_HIGH"]),
    ...(downgraded > 0 ? ["LATE_GAME_THREAT_DOWNGRADED_WHEN_UNSUPPORTED"] : []),
  ];

  return {
    lateGameWindowCount: windows,
    lateGamePressureCount: pressure,
    lateGameThreatCount: threat,
    lateGameThreatQualityRate: percent(threat, pressure),
    lateGameAutomaticThreatCount: automatic,
    lateGameAutomaticThreatRate: automaticRate,
    lateGameThreatWithoutSignalCount: withoutSignal,
    lateGameThreatWithoutSignalRate: withoutSignalRate,
    lateGameThreatFromRealSignalCount: realSignal,
    lateGameThreatFromRealSignalRate: percent(realSignal, threat),
    lateGameThreatDeniedCount: denied,
    lateGameThreatDowngradedCount: downgraded,
    lateGamePressureToThreatRate: percent(threat, pressure),
    lateGamePressureToNoThreatRate: percent(denied, pressure),
    lateGameThreatEligibilityDistribution: distribution(eligibility),
    lateGameThreatCauseDistribution: distribution(causes),
    lateGameAutomaticityWarningCodes: warnings,
    recommendation: automaticRate <= 15 && withoutSignalRate <= 10
      ? "KEEP_LATE_GAME_THREAT_MONITORING"
      : "EXPLAIN_LATE_GAME_THREAT_AUTOMATICITY",
  };
}
