import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { LateGameThreatMonitoringDistributionRow } from "./fullMatchLateGameThreatAutomaticityAudit";

export interface FullMatchNaturalTrailingConversionPathAudit {
  readonly naturalTrailingScoringEventCount: number;
  readonly naturalTrailingScoreChangeCount: number;
  readonly trailingScoringPathCompleteCount: number;
  readonly trailingScoringPathIncompleteCount: number;
  readonly trailingScoringPathUnsupportedCount: number;
  readonly trailingScoringPathByFamily: readonly LateGameThreatMonitoringDistributionRow[];
  readonly trailingScoringPathByPhase: readonly LateGameThreatMonitoringDistributionRow[];
  readonly trailingScoringPathByScoreState: readonly LateGameThreatMonitoringDistributionRow[];
  readonly trailingScoringPathEvidenceDistribution: readonly LateGameThreatMonitoringDistributionRow[];
  readonly injectedTrailingScoringEventCount: number;
  readonly forcedTrailingScoreChangeCount: number;
  readonly naturalTrailingConversionPathWarningCodes: readonly string[];
  readonly recommendation:
    | "KEEP_NATURAL_TRAILING_CONVERSION_PATH_MONITORING"
    | "EXPLAIN_NATURAL_TRAILING_CONVERSION_PATH_GAPS"
    | "REPAIR_NATURAL_TRAILING_CONVERSION_PATH";
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
  return event.scoringFamily ??
    event.tags.find((tag) => tag.startsWith("official_scoring_accepted_family_"))?.replace("official_scoring_accepted_family_", "") ??
    event.tags.find((tag) => tag.startsWith("official_route_family_"))?.replace("official_route_family_", "") ??
    "UNKNOWN";
}

function hasPathEvidence(event: MatchEvent): boolean {
  const officialRouteEvidence = event.scoringFamily !== undefined ||
    event.tags.includes("official_scoring_path_connected") ||
    event.tags.some((tag) => tag.startsWith("official_scoring_accepted_family_")) ||
    event.tags.some((tag) => tag.startsWith("official_route_family_"));
  const tacticalEvidence = event.tags.includes("route_economy_recheck_6q") ||
    event.tags.includes("natural_trailing_conversion_candidate_6v") ||
    event.tags.includes("natural_trailing_conversion_path_6w") ||
    event.tags.includes("earned_danger_confirmed") ||
    event.tags.includes("official_scoring_path_connected") ||
    event.tags.includes("late_game_threat_from_real_signal_6w") ||
    event.tags.includes("late_game_threat_supported_6w") ||
    event.tags.some((tag) => tag.startsWith("official_scoring_accepted_family_")) ||
    event.tags.some((tag) => tag.startsWith("danger_quality_")) ||
    event.tags.some((tag) => tag.startsWith("official_route_family_"));
  return officialRouteEvidence &&
    tacticalEvidence &&
    scoreChangePoints(event) > 0 &&
    !event.tags.some((tag) => tag.includes("injected") || tag.includes("forced_trailing"));
}

export function auditFullMatchNaturalTrailingConversionPath(reports: readonly MatchReport[]): FullMatchNaturalTrailingConversionPathAudit {
  let scoreEvents = 0;
  let scoreChanges = 0;
  let complete = 0;
  let injected = 0;
  let forced = 0;
  const families: string[] = [];
  const phases: string[] = [];
  const scoreStates: string[] = [];
  const evidence: string[] = [];

  for (const report of reports) {
    const homeTeamId = report.teamStats[0]?.teamId;
    let home = 0;
    let away = 0;
    for (const event of [...report.timeline].sort((left, right) => left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick)) {
      const points = scoreChangePoints(event);
      const teamPoints = event.teamId === homeTeamId ? home : away;
      const opponentPoints = event.teamId === homeTeamId ? away : home;
      if (points > 0 && teamPoints < opponentPoints) {
        scoreEvents += 1;
        scoreChanges += 1;
        if (hasPathEvidence(event)) complete += 1;
        if (event.tags.some((tag) => tag.includes("injected"))) injected += 1;
        if (event.tags.some((tag) => tag.includes("forced_trailing"))) forced += 1;
        families.push(routeFamily(event));
        phases.push(event.timestamp.minute >= 60 ? "LATE_GAME" : "OPEN_GAME");
        scoreStates.push(Math.abs(teamPoints - opponentPoints) <= 5 ? "ONE_SCORE_TRAILING" : "MULTI_SCORE_TRAILING");
        evidence.push(hasPathEvidence(event) ? "OFFICIAL_ROUTE_TO_SCORE_CHANGE" : "MISSING_ROUTE_OR_DANGER_EVIDENCE");
      }
      if (points > 0) {
        if (event.teamId === homeTeamId) home += points;
        else away += points;
      }
    }
  }
  const incomplete = Math.max(0, scoreEvents - complete);
  const warnings = [
    "NATURAL_TRAILING_CONVERSION_PATH_MEASURED",
    ...(incomplete === 0 ? ["NATURAL_TRAILING_CONVERSION_PATH_COMPLETE"] : ["TRAILING_CONVERSION_PATH_INCOMPLETE"]),
    ...(injected === 0 ? ["NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED"] : ["TRAILING_SCORING_EVENT_INJECTION_DETECTED"]),
  ];

  return {
    naturalTrailingScoringEventCount: scoreEvents,
    naturalTrailingScoreChangeCount: scoreChanges,
    trailingScoringPathCompleteCount: complete,
    trailingScoringPathIncompleteCount: incomplete,
    trailingScoringPathUnsupportedCount: incomplete,
    trailingScoringPathByFamily: distribution(families),
    trailingScoringPathByPhase: distribution(phases),
    trailingScoringPathByScoreState: distribution(scoreStates),
    trailingScoringPathEvidenceDistribution: distribution(evidence),
    injectedTrailingScoringEventCount: injected,
    forcedTrailingScoreChangeCount: forced,
    naturalTrailingConversionPathWarningCodes: warnings,
    recommendation: injected > 0 || forced > 0
      ? "REPAIR_NATURAL_TRAILING_CONVERSION_PATH"
      : incomplete === 0
        ? "KEEP_NATURAL_TRAILING_CONVERSION_PATH_MONITORING"
        : "EXPLAIN_NATURAL_TRAILING_CONVERSION_PATH_GAPS",
  };
}
