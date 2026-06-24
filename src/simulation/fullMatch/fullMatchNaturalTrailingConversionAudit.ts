import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface FullMatchNaturalTrailingConversionAudit {
  readonly naturalTrailingScoringWindowCount: number;
  readonly naturalTrailingScoringEventCount: number;
  readonly naturalTrailingScoringShare: number;
  readonly trailingScoringFromEarnedDangerCount: number;
  readonly trailingScoringFromHalfChanceCount: number;
  readonly trailingScoringFromRouteQualityCount: number;
  readonly trailingScoringFromLatePressureCount: number;
  readonly trailingScoringFromFatigueEdgeCount: number;
  readonly trailingScoringFromTacticalEdgeCount: number;
  readonly injectedTrailingScoringEventCount: number;
  readonly forcedTrailingScoreChangeCount: number;
  readonly forcedComebackSuspicionCount: number;
  readonly warnings: readonly string[];
  readonly recommendation:
    | "KEEP_NATURAL_TRAILING_CONVERSION_MONITORING"
    | "IMPROVE_NATURAL_TRAILING_CONVERSION"
    | "REPAIR_TRAILING_CONVERSION_GUARDRAILS";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function auditFullMatchNaturalTrailingConversion(reports: readonly MatchReport[]): FullMatchNaturalTrailingConversionAudit {
  let windows = 0;
  let naturalScores = 0;
  let earned = 0;
  let halfChance = 0;
  let routeQuality = 0;
  let latePressure = 0;
  let fatigue = 0;
  let tactical = 0;
  let injected = 0;
  let forcedScore = 0;
  let forcedComeback = 0;

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    const awayTeamId = report.teamStats[1]?.teamId;
    let home = 0;
    let away = 0;

    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      const teamPointsBefore = event.teamId === homeTeamId ? home : away;
      const opponentPointsBefore = event.teamId === homeTeamId ? away : home;
      const isTrailingScore = points > 0 && teamPointsBefore < opponentPointsBefore;

      if (event.tags.some((tag) => tag.includes("injected") || tag.includes("forced_trailing"))) injected += 1;
      if (event.tags.some((tag) => tag.includes("forced_score") || tag.includes("score_cap"))) forcedScore += 1;
      if (event.tags.some((tag) => tag.includes("rubber") || tag.includes("forced_comeback"))) forcedComeback += 1;

      if (event.tags.includes("natural_trailing_conversion_candidate_6v")) windows += 1;
      if (isTrailingScore) {
        naturalScores += 1;
        if (event.tags.includes("trailing_threat_earned_danger_6v") || event.tags.includes("trailing_threat_scoring_opportunity_6v")) earned += 1;
        if (event.tags.includes("trailing_threat_half_chance_6v")) halfChance += 1;
        if (event.tags.includes("trailing_route_quality_to_threat_6v")) routeQuality += 1;
        if (event.tags.includes("trailing_late_game_threat_6v")) latePressure += 1;
        if (event.tags.includes("trailing_fatigue_edge_6v")) fatigue += 1;
        if (event.tags.includes("trailing_tactical_edge_to_threat_6v")) tactical += 1;
      }

      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
      }
    }
  }

  const warnings = [
    "NATURAL_TRAILING_CONVERSION_MEASURED",
    ...(naturalScores > 0 ? ["TRAILING_SCORING_SHARE_RESTORED_NATURALLY"] : ["TRAILING_SCORING_SHARE_STILL_ZERO"]),
    ...(injected === 0 ? ["NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED"] : ["TRAILING_SCORING_EVENT_INJECTION_DETECTED"]),
    ...(forcedScore === 0 ? ["NO_FORCED_SCORE_CONFIRMED"] : ["FORCED_SCORE_DETECTED"]),
    ...(forcedComeback === 0 ? ["NO_FORCED_COMEBACK_CONFIRMED"] : ["FORCED_COMEBACK_DETECTED"]),
  ];

  return {
    naturalTrailingScoringWindowCount: windows,
    naturalTrailingScoringEventCount: naturalScores,
    naturalTrailingScoringShare: percent(naturalScores, reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0).length),
    trailingScoringFromEarnedDangerCount: earned,
    trailingScoringFromHalfChanceCount: halfChance,
    trailingScoringFromRouteQualityCount: routeQuality,
    trailingScoringFromLatePressureCount: latePressure,
    trailingScoringFromFatigueEdgeCount: fatigue,
    trailingScoringFromTacticalEdgeCount: tactical,
    injectedTrailingScoringEventCount: injected,
    forcedTrailingScoreChangeCount: forcedScore,
    forcedComebackSuspicionCount: forcedComeback,
    warnings,
    recommendation: injected > 0 || forcedScore > 0 || forcedComeback > 0
      ? "REPAIR_TRAILING_CONVERSION_GUARDRAILS"
      : naturalScores > 0
        ? "KEEP_NATURAL_TRAILING_CONVERSION_MONITORING"
        : "IMPROVE_NATURAL_TRAILING_CONVERSION",
  };
}
