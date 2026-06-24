import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { EarnedDangerOutcomeDistributionWarningCode } from "./earnedDangerOutcomeDistributionWarnings";

export interface EarnedDangerOutcomeDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchEarnedDangerOutcomeDistributionAudit {
  readonly earnedDangerWindowCount: number;
  readonly borderlineDangerWindowCount: number;
  readonly highQualityDangerCount: number;
  readonly mediumQualityDangerCount: number;
  readonly lowQualityDangerCount: number;
  readonly scoringOpportunityOutcomeCount: number;
  readonly halfChanceOutcomeCount: number;
  readonly forcedDefensiveActionOutcomeCount: number;
  readonly territorialGainOutcomeCount: number;
  readonly momentumGainOutcomeCount: number;
  readonly safePossessionOutcomeCount: number;
  readonly neutralOutcomeCount: number;
  readonly highQualityToScoringOpportunityCount: number;
  readonly highQualityToHalfChanceCount: number;
  readonly highQualityToTerritorialGainCount: number;
  readonly highQualityToForcedDefensiveActionCount: number;
  readonly mediumQualityToScoringOpportunityCount: number;
  readonly mediumQualityToHalfChanceCount: number;
  readonly mediumQualityToTerritorialGainCount: number;
  readonly mediumQualityToForcedDefensiveActionCount: number;
  readonly lowQualityToScoringOpportunityCount: number;
  readonly lowQualityToHalfChanceCount: number;
  readonly lowQualityToTerritorialGainCount: number;
  readonly lowQualityToNeutralCount: number;
  readonly routeQualityScoreDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly opportunityQualityScoreDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly pressureQualityDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly spacingQualityDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly supportQualityDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly defensiveRecoveryQualityDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly restDefenseQualityDistribution: readonly EarnedDangerOutcomeDistributionRow[];
  readonly outcomeWarningCodes: readonly EarnedDangerOutcomeDistributionWarningCode[];
  readonly recommendation:
    | "KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION"
    | "MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION"
    | "REPAIR_EARNED_DANGER_OUTCOME_DISTRIBUTION";
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function count(events: readonly MatchEvent[], predicate: (event: MatchEvent) => boolean): number {
  return events.filter(predicate).length;
}

function distribution(events: readonly MatchEvent[], classify: (event: MatchEvent) => string): readonly EarnedDangerOutcomeDistributionRow[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    const label = classify(event);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  if (counts.size === 0) {
    return [{ label: "NONE", count: 0 }];
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, rowCount]) => ({ label, count: rowCount }));
}

function quality(event: MatchEvent): "HIGH_QUALITY_DANGER" | "MEDIUM_QUALITY_DANGER" | "LOW_QUALITY_DANGER" {
  if (hasTag(event, "danger_quality_HIGH_QUALITY_DANGER")) return "HIGH_QUALITY_DANGER";
  if (hasTag(event, "danger_quality_MEDIUM_QUALITY_DANGER")) return "MEDIUM_QUALITY_DANGER";
  return "LOW_QUALITY_DANGER";
}

function outcome(event: MatchEvent): string {
  const tag = event.tags.find((candidate) => candidate.startsWith("danger_outcome_"));
  return tag?.replace("danger_outcome_", "") ?? "NEUTRAL_PHASE";
}

function warningCodes(events: readonly MatchEvent[], model: {
  readonly earnedDangerWindowCount: number;
  readonly highQualityDangerCount: number;
  readonly mediumQualityDangerCount: number;
  readonly lowQualityDangerCount: number;
  readonly scoringOpportunityOutcomeCount: number;
  readonly halfChanceOutcomeCount: number;
  readonly forcedDefensiveActionOutcomeCount: number;
  readonly territorialGainOutcomeCount: number;
}): readonly EarnedDangerOutcomeDistributionWarningCode[] {
  const warnings: EarnedDangerOutcomeDistributionWarningCode[] = [
    "EARNED_DANGER_OUTCOME_DISTRIBUTION_RECHECK_COMPLETE",
  ];
  const earnedOpportunityRate = model.earnedDangerWindowCount === 0
    ? 0
    : Math.round((count(events.filter((event) => hasTag(event, "earned_danger_confirmed")), (event) => outcome(event) === "SCORING_OPPORTUNITY") / model.earnedDangerWindowCount) * 1000) / 10;
  const highShare = events.length === 0 ? 0 : Math.round((model.highQualityDangerCount / events.length) * 1000) / 10;

  warnings.push(earnedOpportunityRate < 100 ? "EARNED_DANGER_TO_OPPORTUNITY_REDUCED" : "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH");
  warnings.push(highShare <= 85 ? "DANGER_QUALITY_DISTRIBUTION_IMPROVED" : "HIGH_QUALITY_DANGER_OVERCLASSIFIED");
  warnings.push(model.mediumQualityDangerCount > 1 ? "MEDIUM_QUALITY_DANGER_REINTRODUCED" : "MEDIUM_QUALITY_DANGER_UNDERREPRESENTED");
  warnings.push(model.lowQualityDangerCount > 0 ? "LOW_QUALITY_DANGER_REINTRODUCED" : "LOW_QUALITY_DANGER_MISSING");
  warnings.push(model.halfChanceOutcomeCount > 4 ? "HALF_CHANCE_LAYER_EXPANDED" : "HALF_CHANCE_LAYER_TOO_LOW");
  warnings.push(model.forcedDefensiveActionOutcomeCount > 1 ? "FORCED_DEFENSIVE_ACTION_LAYER_EXPANDED" : "FORCED_DEFENSIVE_ACTION_LAYER_TOO_LOW");
  warnings.push(model.territorialGainOutcomeCount > 7 ? "TERRITORIAL_GAIN_LAYER_EXPANDED" : "TERRITORIAL_GAIN_LAYER_TOO_LOW");
  if (model.scoringOpportunityOutcomeCount < events.length) {
    warnings.push("DANGER_OUTCOME_DISTRIBUTION_IMPROVED");
  }
  return [...new Set(warnings)];
}

export function auditFullMatchEarnedDangerOutcomeDistribution(report: MatchReport): FullMatchEarnedDangerOutcomeDistributionAudit {
  const events = report.timeline.filter((event) => hasTag(event, "earned_danger_outcome_distribution_6r"));
  const earnedEvents = events.filter((event) => hasTag(event, "earned_danger_confirmed"));
  const highQualityEvents = events.filter((event) => quality(event) === "HIGH_QUALITY_DANGER");
  const mediumQualityEvents = events.filter((event) => quality(event) === "MEDIUM_QUALITY_DANGER");
  const lowQualityEvents = events.filter((event) => quality(event) === "LOW_QUALITY_DANGER");
  const base = {
    earnedDangerWindowCount: earnedEvents.length,
    borderlineDangerWindowCount: count(events, (event) => hasTag(event, "borderline_danger_allowed")),
    highQualityDangerCount: highQualityEvents.length,
    mediumQualityDangerCount: mediumQualityEvents.length,
    lowQualityDangerCount: lowQualityEvents.length,
    scoringOpportunityOutcomeCount: count(events, (event) => outcome(event) === "SCORING_OPPORTUNITY"),
    halfChanceOutcomeCount: count(events, (event) => outcome(event) === "HALF_CHANCE"),
    forcedDefensiveActionOutcomeCount: count(events, (event) => outcome(event) === "FORCED_DEFENSIVE_ACTION"),
    territorialGainOutcomeCount: count(events, (event) => outcome(event) === "TERRITORIAL_GAIN"),
    momentumGainOutcomeCount: count(events, (event) => outcome(event) === "MOMENTUM_GAIN"),
    safePossessionOutcomeCount: count(events, (event) => outcome(event) === "SAFE_POSSESSION"),
    neutralOutcomeCount: count(events, (event) => outcome(event) === "NEUTRAL_PHASE"),
    highQualityToScoringOpportunityCount: count(highQualityEvents, (event) => outcome(event) === "SCORING_OPPORTUNITY"),
    highQualityToHalfChanceCount: count(highQualityEvents, (event) => outcome(event) === "HALF_CHANCE"),
    highQualityToTerritorialGainCount: count(highQualityEvents, (event) => outcome(event) === "TERRITORIAL_GAIN"),
    highQualityToForcedDefensiveActionCount: count(highQualityEvents, (event) => outcome(event) === "FORCED_DEFENSIVE_ACTION"),
    mediumQualityToScoringOpportunityCount: count(mediumQualityEvents, (event) => outcome(event) === "SCORING_OPPORTUNITY"),
    mediumQualityToHalfChanceCount: count(mediumQualityEvents, (event) => outcome(event) === "HALF_CHANCE"),
    mediumQualityToTerritorialGainCount: count(mediumQualityEvents, (event) => outcome(event) === "TERRITORIAL_GAIN"),
    mediumQualityToForcedDefensiveActionCount: count(mediumQualityEvents, (event) => outcome(event) === "FORCED_DEFENSIVE_ACTION"),
    lowQualityToScoringOpportunityCount: count(lowQualityEvents, (event) => outcome(event) === "SCORING_OPPORTUNITY"),
    lowQualityToHalfChanceCount: count(lowQualityEvents, (event) => outcome(event) === "HALF_CHANCE"),
    lowQualityToTerritorialGainCount: count(lowQualityEvents, (event) => outcome(event) === "TERRITORIAL_GAIN"),
    lowQualityToNeutralCount: count(lowQualityEvents, (event) => outcome(event) === "NEUTRAL_PHASE"),
  };
  const warnings = warningCodes(events, base);
  const blocking = warnings.some((warning) =>
    warning === "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH" ||
    warning === "HIGH_QUALITY_DANGER_OVERCLASSIFIED" ||
    warning === "MEDIUM_QUALITY_DANGER_UNDERREPRESENTED" ||
    warning === "LOW_QUALITY_DANGER_MISSING" ||
    warning === "HALF_CHANCE_LAYER_TOO_LOW" ||
    warning === "FORCED_DEFENSIVE_ACTION_LAYER_TOO_LOW" ||
    warning === "TERRITORIAL_GAIN_LAYER_TOO_LOW"
  );

  return {
    ...base,
    routeQualityScoreDistribution: distribution(events, quality),
    opportunityQualityScoreDistribution: distribution(events, outcome),
    pressureQualityDistribution: distribution(events, (event) => event.tags.includes("pressure_phase") ? "PRESSURE" : "NORMAL"),
    spacingQualityDistribution: distribution(events, (event) => hasTag(event, "danger_quality_LOW_QUALITY_DANGER") ? "LOW_SPACING_OR_ANGLE" : "USABLE_SPACING"),
    supportQualityDistribution: distribution(events, (event) => hasTag(event, "danger_quality_HIGH_QUALITY_DANGER") ? "STRONG_SUPPORT" : "PARTIAL_SUPPORT"),
    defensiveRecoveryQualityDistribution: distribution(events, (event) => event.tags.some((tag) => tag.includes("defensive")) ? "DEFENSIVE_RECOVERY_PRESENT" : "DEFENSIVE_RECOVERY_NOT_DOMINANT"),
    restDefenseQualityDistribution: distribution(events, (event) => event.tags.some((tag) => tag.includes("post_score") || tag.includes("goalkeeper_secure")) ? "REST_DEFENSE_PROTECTED" : "REST_DEFENSE_OPEN"),
    outcomeWarningCodes: blocking ? [...warnings, "FULL_MATCH_BATCH_ECONOMY_PARTIAL"] : [...warnings, "LONGITUDINAL_ROUTE_ECONOMY_STABLE", "FULL_MATCH_BATCH_ECONOMY_HEALTHY"],
    recommendation: blocking ? "MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION" : "KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION",
  };
}
