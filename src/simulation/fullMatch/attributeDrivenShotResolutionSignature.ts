import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

function scoreChangeTotal(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function valueFromTag(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function tagCount(report: MatchReport, tag: string): number {
  return report.timeline.filter((event) => event.tags.includes(tag)).length;
}

function numberFromTag(tags: readonly string[], prefix: string): number {
  const value = valueFromTag(tags, prefix);

  return value === undefined ? 0 : Number.parseInt(value, 10);
}

function hasTag(tags: readonly string[], tag: string): boolean {
  return tags.includes(tag);
}

export function attributeDrivenShotResolutionSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineOutcome: string | undefined;
  readonly baselineShotAttemptCreated: string | undefined;
  readonly baselineShotQuality: string | undefined;
  readonly overrideSourceCandidateType: string | undefined;
  readonly overrideShooterId: string | undefined;
  readonly overrideGoalkeeperId: string | undefined;
  readonly overrideSourceShotQuality: string | undefined;
  readonly overrideAdjustedShotQuality: string | undefined;
  readonly overrideGoalkeeperQuality: string | undefined;
  readonly overrideOutcome: string | undefined;
  readonly attributeInfluenceObserved: string | undefined;
  readonly outcomeDivergenceObserved: string | undefined;
  readonly shotQualityDivergenceObserved: string | undefined;
  readonly goalkeeperQualityDivergenceObserved: string | undefined;
  readonly sandboxScoringEventDivergenceObserved: string | undefined;
  readonly sandboxScoreDivergenceObserved: string | undefined;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly sandboxScoringEventCreatedCount: number;
  readonly sandboxScoreDeltaTotal: number;
  readonly officialTimelineInjectionCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
} {
  const facts = report.evidenceFacts.flatMap((fact) => fact.internalTags);

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    tagCount: tagCount(report, "workbench_chain_attribute_driven_shot_resolution_sandbox"),
    officialSandboxEventCount: report.timeline.filter((event) =>
      event.eventId.includes("attribute-driven-shot-resolution")
    ).length,
    status: valueFromTag(facts, "attribute_driven_shot_model_status_"),
    origin: valueFromTag(facts, "attribute_driven_shot_model_origin_"),
    baselineOutcome: valueFromTag(facts, "attribute_driven_shot_resolution_baseline_outcome_"),
    baselineShotAttemptCreated: valueFromTag(facts, "attribute_driven_shot_resolution_baseline_shot_attempt_"),
    baselineShotQuality: valueFromTag(facts, "attribute_driven_shot_resolution_baseline_adjusted_shot_quality_"),
    overrideSourceCandidateType: valueFromTag(facts, "attribute_driven_shot_resolution_override_source_candidate_"),
    overrideShooterId: valueFromTag(facts, "attribute_driven_shot_resolution_override_shooter_"),
    overrideGoalkeeperId: valueFromTag(facts, "attribute_driven_shot_resolution_override_goalkeeper_"),
    overrideSourceShotQuality: valueFromTag(facts, "attribute_driven_shot_resolution_override_source_shot_quality_"),
    overrideAdjustedShotQuality: valueFromTag(facts, "attribute_driven_shot_resolution_override_adjusted_shot_quality_"),
    overrideGoalkeeperQuality: valueFromTag(facts, "attribute_driven_shot_resolution_override_goalkeeper_quality_"),
    overrideOutcome: valueFromTag(facts, "attribute_driven_shot_resolution_override_outcome_"),
    attributeInfluenceObserved: valueFromTag(facts, "attribute_driven_shot_attribute_influence_"),
    outcomeDivergenceObserved: valueFromTag(facts, "attribute_driven_shot_outcome_divergence_"),
    shotQualityDivergenceObserved: valueFromTag(facts, "attribute_driven_shot_quality_divergence_"),
    goalkeeperQualityDivergenceObserved: valueFromTag(facts, "attribute_driven_shot_goalkeeper_quality_divergence_"),
    sandboxScoringEventDivergenceObserved: valueFromTag(facts, "attribute_driven_shot_scoring_event_divergence_"),
    sandboxScoreDivergenceObserved: valueFromTag(facts, "attribute_driven_shot_score_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "attribute_driven_shot_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "attribute_driven_shot_model_applied_to_normal_live_"),
    sandboxScoringEventCreatedCount: hasTag(facts, "attribute_driven_shot_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(facts, "attribute_driven_shot_score_delta_"),
    officialTimelineInjectionCount: numberFromTag(facts, "attribute_driven_shot_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(facts, "attribute_driven_shot_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "attribute_driven_shot_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "attribute_driven_shot_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "attribute_driven_shot_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "attribute_driven_shot_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "attribute_driven_shot_global_economy_claim_count_"),
  };
}
