import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { TeamId } from "../../core/ids";
import {
  auditFullMatchDominanceChains,
  type FullMatchDominanceChainAudit,
} from "./fullMatchDominanceChainAudit";
import type { DominanceChainCalibrationCoverageWarningCode } from "./dominanceChainCalibrationCoverageWarnings";

export interface DominanceChainDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchDominanceChainPost6RAudit {
  readonly dominantTeamOpportunityChainMax: number;
  readonly dominantTeamOpportunityChainAverage: number;
  readonly dominantTeamOpportunityChainDistribution: readonly DominanceChainDistributionRow[];
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly sameTeamSameFamilyChainRate: number;
  readonly postEarnedDangerRepeatOpportunityRate: number;
  readonly postHighQualityDangerRepeatOpportunityRate: number;
  readonly postHalfChanceRepeatOpportunityRate: number;
  readonly postTerritorialGainRepeatOpportunityRate: number;
  readonly postForcedDefensiveActionRepeatOpportunityRate: number;
  readonly postScoringEventRepeatOpportunityRate: number;
  readonly leadingTeamOpportunityChainRate: number;
  readonly trailingTeamOpportunityChainRate: number;
  readonly chainBreakEventCount: number;
  readonly chainBreakFailureCount: number;
  readonly chainBreakReasonDistribution: readonly DominanceChainDistributionRow[];
  readonly defensiveRecoveryAfterRepeatedDangerCount: number;
  readonly neutralResetAfterRepeatedDangerCount: number;
  readonly safePossessionAfterRepeatedDangerCount: number;
  readonly fatigueCostForRepeatedDanger: number;
  readonly repeatOpportunityDampenerApplicationCount: number;
  readonly repeatOpportunityDampenerBypassedCount: number;
  readonly dominanceChainWarningCodes: readonly DominanceChainCalibrationCoverageWarningCode[];
  readonly recommendation:
    | "KEEP_DOMINANCE_CHAIN_MONITORING"
    | "REDUCE_DOMINANCE_CHAINS_MORE"
    | "IMPROVE_BREAK_EVENTS";
  readonly baseAudit: FullMatchDominanceChainAudit;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function routeFamilyForEvent(event: MatchEvent): OfficialScoringFamily | "CONTINUATION" | null {
  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }
  const families: readonly (OfficialScoringFamily | "CONTINUATION")[] = [
    "SHOT_GOAL",
    "TRY_TOUCHDOWN",
    "CONVERSION_GOAL",
    "DROP_GOAL",
    "PENALTY_SHOT",
    "UNKNOWN",
    "CONTINUATION",
  ];
  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
}

function isOpportunity(event: MatchEvent): boolean {
  const family = routeFamilyForEvent(event);
  return family !== null && family !== "CONTINUATION";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function distribution(values: readonly string[]): readonly DominanceChainDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function chainLengths(events: readonly MatchEvent[]): readonly number[] {
  const lengths: number[] = [];
  let previousTeamId: TeamId | null = null;
  let current = 0;
  for (const event of events.filter(isOpportunity)) {
    if (event.teamId === previousTeamId) {
      current += 1;
    } else {
      if (current > 0) lengths.push(current);
      current = 1;
    }
    previousTeamId = event.teamId;
  }
  if (current > 0) lengths.push(current);
  return lengths;
}

function nextOpportunitySameTeam(timeline: readonly MatchEvent[], index: number, teamId: TeamId): boolean {
  const next = timeline.slice(index + 1).find(isOpportunity);
  return next?.teamId === teamId;
}

function scoreDeltaForTeam(report: MatchReport, teamId: TeamId): number {
  const homeTeamId = report.teamStats[0]?.teamId;
  const homePoints = report.score.home;
  const awayPoints = report.score.away;
  if (teamId === homeTeamId) {
    return homePoints - awayPoints;
  }
  return awayPoints - homePoints;
}

export function auditFullMatchDominanceChainPost6R(report: MatchReport): FullMatchDominanceChainPost6RAudit {
  const timeline = [...report.timeline].sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick);
  const baseAudit = auditFullMatchDominanceChains(report);
  const opportunities = timeline.filter(isOpportunity);
  const chains = chainLengths(timeline);
  let sameTeamSameFamilyCount = 0;
  let postEarnedDangerRepeatCount = 0;
  let postHighQualityRepeatCount = 0;
  let postHalfChanceRepeatCount = 0;
  let postTerritorialGainRepeatCount = 0;
  let postForcedDefensiveActionRepeatCount = 0;
  let postScoringEventRepeatCount = 0;
  let leadingTeamRepeatCount = 0;
  let trailingTeamRepeatCount = 0;
  let previousOpportunity: MatchEvent | null = null;

  for (const event of opportunities) {
    if (previousOpportunity !== null && previousOpportunity.teamId === event.teamId) {
      if (routeFamilyForEvent(previousOpportunity) === routeFamilyForEvent(event)) sameTeamSameFamilyCount += 1;
      if (previousOpportunity.tags.includes("earned_danger_confirmed")) postEarnedDangerRepeatCount += 1;
      if (previousOpportunity.tags.includes("danger_quality_HIGH_QUALITY_DANGER")) postHighQualityRepeatCount += 1;
      if (previousOpportunity.tags.includes("danger_outcome_HALF_CHANCE")) postHalfChanceRepeatCount += 1;
      if (previousOpportunity.tags.includes("danger_outcome_TERRITORIAL_GAIN")) postTerritorialGainRepeatCount += 1;
      if (previousOpportunity.tags.includes("danger_outcome_FORCED_DEFENSIVE_ACTION")) postForcedDefensiveActionRepeatCount += 1;
      if (scoreChangePoints(previousOpportunity) > 0) postScoringEventRepeatCount += 1;
      if (scoreDeltaForTeam(report, event.teamId) > 0) leadingTeamRepeatCount += 1;
      if (scoreDeltaForTeam(report, event.teamId) < 0) trailingTeamRepeatCount += 1;
    }
    previousOpportunity = event;
  }

  const breakEvents = timeline.filter((event) => event.tags.includes("chain_break_event_6s"));
  const chainBreakFailureCount = breakEvents.filter((event, index) => nextOpportunitySameTeam(timeline, timeline.indexOf(event), event.teamId) && index >= 0).length;
  const dampenerCount = timeline.filter((event) => event.tags.includes("repeat_opportunity_dampener_6s")).length;
  const warnings: DominanceChainCalibrationCoverageWarningCode[] = [];
  if (baseAudit.dominantTeamOpportunityChainMax <= 4) warnings.push("DOMINANT_TEAM_CHAIN_MAX_HEALTHY");
  else warnings.push("DOMINANCE_CHAIN_STILL_TOO_LONG");
  if (baseAudit.sameTeamConsecutiveOpportunityRate <= 55) warnings.push("SAME_TEAM_CHAIN_REDUCED");
  else warnings.push("SAME_TEAM_CHAIN_STILL_HIGH");
  if (baseAudit.sameFamilyConsecutiveOpportunityRate <= 45) warnings.push("SAME_FAMILY_CHAIN_REDUCED");
  else warnings.push("SAME_FAMILY_CHAIN_STILL_HIGH");
  if (breakEvents.length > 0) warnings.push("CHAIN_BREAK_RESTORED");
  if (timeline.some((event) => event.tags.includes("defensive_recovery_after_repeated_danger_6s"))) warnings.push("DEFENSIVE_RECOVERY_RESTORED");
  if (chainBreakFailureCount > Math.max(2, breakEvents.length * 0.35)) warnings.push("CHAIN_BREAK_FAILURE_TOO_HIGH");

  return {
    dominantTeamOpportunityChainMax: baseAudit.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainAverage: average(chains),
    dominantTeamOpportunityChainDistribution: distribution(chains.map((chain) => String(chain))),
    sameTeamConsecutiveOpportunityRate: baseAudit.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRate: baseAudit.sameFamilyConsecutiveOpportunityRate,
    sameTeamSameFamilyChainRate: percent(sameTeamSameFamilyCount, opportunities.length),
    postEarnedDangerRepeatOpportunityRate: percent(postEarnedDangerRepeatCount, opportunities.length),
    postHighQualityDangerRepeatOpportunityRate: percent(postHighQualityRepeatCount, opportunities.length),
    postHalfChanceRepeatOpportunityRate: percent(postHalfChanceRepeatCount, opportunities.length),
    postTerritorialGainRepeatOpportunityRate: percent(postTerritorialGainRepeatCount, opportunities.length),
    postForcedDefensiveActionRepeatOpportunityRate: percent(postForcedDefensiveActionRepeatCount, opportunities.length),
    postScoringEventRepeatOpportunityRate: percent(postScoringEventRepeatCount, opportunities.length),
    leadingTeamOpportunityChainRate: percent(leadingTeamRepeatCount, opportunities.length),
    trailingTeamOpportunityChainRate: percent(trailingTeamRepeatCount, opportunities.length),
    chainBreakEventCount: breakEvents.length,
    chainBreakFailureCount,
    chainBreakReasonDistribution: distribution(breakEvents.flatMap((event) => event.tags.filter((tag) => tag.endsWith("_6s")))),
    defensiveRecoveryAfterRepeatedDangerCount: timeline.filter((event) => event.tags.includes("defensive_recovery_after_repeated_danger_6s")).length,
    neutralResetAfterRepeatedDangerCount: timeline.filter((event) => event.tags.includes("neutral_reset_after_repeated_danger_6s")).length,
    safePossessionAfterRepeatedDangerCount: timeline.filter((event) => event.tags.includes("safe_possession_layer_added")).length,
    fatigueCostForRepeatedDanger: dampenerCount,
    repeatOpportunityDampenerApplicationCount: dampenerCount,
    repeatOpportunityDampenerBypassedCount: Math.max(0, postEarnedDangerRepeatCount - dampenerCount),
    dominanceChainWarningCodes: [...new Set(warnings)],
    recommendation: warnings.includes("DOMINANCE_CHAIN_STILL_TOO_LONG")
      ? "REDUCE_DOMINANCE_CHAINS_MORE"
      : warnings.includes("CHAIN_BREAK_FAILURE_TOO_HIGH")
        ? "IMPROVE_BREAK_EVENTS"
        : "KEEP_DOMINANCE_CHAIN_MONITORING",
    baseAudit,
  };
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
