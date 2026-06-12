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

export function goalkeeperResponseModelSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineResponseType: string | undefined;
  readonly baselineReboundState: string | undefined;
  readonly overrideShooterId: string | undefined;
  readonly overrideGoalkeeperId: string | undefined;
  readonly overrideShotQualityFaced: string | undefined;
  readonly overrideGoalkeeperResponseScore: string | undefined;
  readonly overrideSaveMargin: string | undefined;
  readonly overridePositioningScore: string | undefined;
  readonly overrideTrajectoryReadingScore: string | undefined;
  readonly overrideReactionScore: string | undefined;
  readonly overrideHandlingScore: string | undefined;
  readonly overrideReboundControlScore: string | undefined;
  readonly overrideConcentrationScore: string | undefined;
  readonly overrideMentalFatigueImpact: string | undefined;
  readonly overrideResponseType: string | undefined;
  readonly overrideReboundState: string | undefined;
  readonly goalkeeperAttributeInfluenceObserved: string | undefined;
  readonly responseDivergenceObserved: string | undefined;
  readonly reboundStateDivergenceObserved: string | undefined;
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
    tagCount: tagCount(report, "workbench_chain_goalkeeper_response_model_sandbox"),
    officialSandboxEventCount: report.timeline.filter((event) =>
      event.eventId.includes("goalkeeper-response")
    ).length,
    status: valueFromTag(facts, "goalkeeper_response_model_status_"),
    origin: valueFromTag(facts, "goalkeeper_response_model_origin_"),
    baselineResponseType: valueFromTag(facts, "goalkeeper_response_baseline_response_type_"),
    baselineReboundState: valueFromTag(facts, "goalkeeper_response_baseline_rebound_state_"),
    overrideShooterId: valueFromTag(facts, "goalkeeper_response_override_shooter_"),
    overrideGoalkeeperId: valueFromTag(facts, "goalkeeper_response_override_goalkeeper_"),
    overrideShotQualityFaced: valueFromTag(facts, "goalkeeper_response_override_shot_quality_faced_"),
    overrideGoalkeeperResponseScore: valueFromTag(facts, "goalkeeper_response_override_response_score_"),
    overrideSaveMargin: valueFromTag(facts, "goalkeeper_response_override_save_margin_"),
    overridePositioningScore: valueFromTag(facts, "goalkeeper_response_override_positioning_"),
    overrideTrajectoryReadingScore: valueFromTag(facts, "goalkeeper_response_override_trajectory_reading_"),
    overrideReactionScore: valueFromTag(facts, "goalkeeper_response_override_reaction_"),
    overrideHandlingScore: valueFromTag(facts, "goalkeeper_response_override_handling_"),
    overrideReboundControlScore: valueFromTag(facts, "goalkeeper_response_override_rebound_control_"),
    overrideConcentrationScore: valueFromTag(facts, "goalkeeper_response_override_concentration_"),
    overrideMentalFatigueImpact: valueFromTag(facts, "goalkeeper_response_override_mental_fatigue_impact_"),
    overrideResponseType: valueFromTag(facts, "goalkeeper_response_override_response_type_"),
    overrideReboundState: valueFromTag(facts, "goalkeeper_response_override_rebound_state_"),
    goalkeeperAttributeInfluenceObserved: valueFromTag(facts, "goalkeeper_response_attribute_influence_"),
    responseDivergenceObserved: valueFromTag(facts, "goalkeeper_response_divergence_"),
    reboundStateDivergenceObserved: valueFromTag(facts, "goalkeeper_response_rebound_divergence_"),
    sandboxScoringEventDivergenceObserved: valueFromTag(facts, "goalkeeper_response_scoring_event_divergence_"),
    sandboxScoreDivergenceObserved: valueFromTag(facts, "goalkeeper_response_score_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "goalkeeper_response_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "goalkeeper_response_model_applied_to_normal_live_"),
    sandboxScoringEventCreatedCount: hasTag(facts, "goalkeeper_response_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(facts, "goalkeeper_response_score_delta_"),
    officialTimelineInjectionCount: numberFromTag(facts, "goalkeeper_response_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(facts, "goalkeeper_response_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "goalkeeper_response_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "goalkeeper_response_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "goalkeeper_response_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "goalkeeper_response_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "goalkeeper_response_global_economy_claim_count_"),
  };
}
