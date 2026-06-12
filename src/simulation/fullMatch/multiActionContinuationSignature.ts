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

export function multiActionContinuationSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineContinuationAction: string | undefined;
  readonly baselineContinuationOutcome: string | undefined;
  readonly baselineContinuationCreated: string | undefined;
  readonly overrideSourceReboundOutcome: string | undefined;
  readonly overrideSourceBallLooseState: string | undefined;
  readonly overrideSourceRecoveryTeamCandidate: string | undefined;
  readonly overrideContinuationAction: string | undefined;
  readonly overrideContinuationOutcome: string | undefined;
  readonly overrideContinuationTeamCandidate: string | undefined;
  readonly overrideContinuationActorCandidate: string | undefined;
  readonly overrideContinuationTargetZoneCandidate: string | undefined;
  readonly overridePossessionSecurityScore: string | undefined;
  readonly overridePressureAfterRebound: string | undefined;
  readonly overrideTransitionRisk: string | undefined;
  readonly overrideContinuationConfidence: string | undefined;
  readonly overrideContinuationCreated: string | undefined;
  readonly continuationActionDivergenceObserved: string | undefined;
  readonly continuationOutcomeDivergenceObserved: string | undefined;
  readonly continuationTeamDivergenceObserved: string | undefined;
  readonly possessionSecurityObserved: string | undefined;
  readonly transitionRiskObserved: string | undefined;
  readonly sandboxMatchEventDivergenceObserved: string | undefined;
  readonly sandboxScoringEventDivergenceObserved: string | undefined;
  readonly sandboxScoreDivergenceObserved: string | undefined;
  readonly officialPossessionDivergenceObserved: string | undefined;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly sandboxContinuationCreatedCount: number;
  readonly sandboxMatchEventCreatedCount: number;
  readonly sandboxScoringEventCreatedCount: number;
  readonly sandboxScoreDeltaTotal: number;
  readonly officialPossessionMutationCount: number;
  readonly officialTimelineMutationCount: number;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
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
    tagCount: tagCount(report, "workbench_chain_multi_action_continuation_sandbox"),
    officialSandboxEventCount: report.timeline.filter((event) =>
      event.eventId.includes("multi-action-continuation")
    ).length,
    status: valueFromTag(facts, "multi_action_continuation_model_status_"),
    origin: valueFromTag(facts, "multi_action_continuation_model_origin_"),
    baselineContinuationAction: valueFromTag(facts, "multi_action_continuation_baseline_action_"),
    baselineContinuationOutcome: valueFromTag(facts, "multi_action_continuation_baseline_outcome_"),
    baselineContinuationCreated: valueFromTag(facts, "multi_action_continuation_baseline_created_"),
    overrideSourceReboundOutcome: valueFromTag(facts, "multi_action_continuation_override_source_rebound_outcome_"),
    overrideSourceBallLooseState: valueFromTag(facts, "multi_action_continuation_override_source_ball_loose_"),
    overrideSourceRecoveryTeamCandidate: valueFromTag(facts, "multi_action_continuation_override_source_recovery_team_"),
    overrideContinuationAction: valueFromTag(facts, "multi_action_continuation_override_action_"),
    overrideContinuationOutcome: valueFromTag(facts, "multi_action_continuation_override_outcome_"),
    overrideContinuationTeamCandidate: valueFromTag(facts, "multi_action_continuation_override_team_"),
    overrideContinuationActorCandidate: valueFromTag(facts, "multi_action_continuation_override_actor_"),
    overrideContinuationTargetZoneCandidate: valueFromTag(facts, "multi_action_continuation_override_target_zone_"),
    overridePossessionSecurityScore: valueFromTag(facts, "multi_action_continuation_override_security_"),
    overridePressureAfterRebound: valueFromTag(facts, "multi_action_continuation_override_pressure_"),
    overrideTransitionRisk: valueFromTag(facts, "multi_action_continuation_override_transition_risk_"),
    overrideContinuationConfidence: valueFromTag(facts, "multi_action_continuation_override_confidence_"),
    overrideContinuationCreated: valueFromTag(facts, "multi_action_continuation_override_created_"),
    continuationActionDivergenceObserved: valueFromTag(facts, "multi_action_continuation_action_divergence_"),
    continuationOutcomeDivergenceObserved: valueFromTag(facts, "multi_action_continuation_outcome_divergence_"),
    continuationTeamDivergenceObserved: valueFromTag(facts, "multi_action_continuation_team_divergence_"),
    possessionSecurityObserved: valueFromTag(facts, "multi_action_continuation_possession_security_observed_"),
    transitionRiskObserved: valueFromTag(facts, "multi_action_continuation_transition_risk_observed_"),
    sandboxMatchEventDivergenceObserved: valueFromTag(facts, "multi_action_continuation_match_event_divergence_"),
    sandboxScoringEventDivergenceObserved: valueFromTag(facts, "multi_action_continuation_scoring_event_divergence_"),
    sandboxScoreDivergenceObserved: valueFromTag(facts, "multi_action_continuation_score_divergence_"),
    officialPossessionDivergenceObserved: valueFromTag(facts, "multi_action_continuation_official_possession_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "multi_action_continuation_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "multi_action_continuation_model_applied_to_normal_live_"),
    sandboxContinuationCreatedCount: hasTag(facts, "multi_action_continuation_override_created_true") ? 1 : 0,
    sandboxMatchEventCreatedCount: hasTag(facts, "multi_action_continuation_match_event_created_true") ? 1 : 0,
    sandboxScoringEventCreatedCount: hasTag(facts, "multi_action_continuation_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(facts, "multi_action_continuation_score_delta_"),
    officialPossessionMutationCount: numberFromTag(facts, "multi_action_continuation_official_possession_mutation_count_"),
    officialTimelineMutationCount: numberFromTag(facts, "multi_action_continuation_official_timeline_mutation_count_"),
    rejectedClosedCandidateCount: numberFromTag(facts, "multi_action_continuation_rejected_closed_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(facts, "multi_action_continuation_rejected_unavailable_count_"),
    officialTimelineInjectionCount: numberFromTag(facts, "multi_action_continuation_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(facts, "multi_action_continuation_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "multi_action_continuation_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "multi_action_continuation_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "multi_action_continuation_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "multi_action_continuation_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "multi_action_continuation_global_economy_claim_count_"),
  };
}
