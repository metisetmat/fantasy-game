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

export function reboundSecondChanceSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineReboundOutcome: string | undefined;
  readonly baselineBallLooseState: string | undefined;
  readonly baselineSecondChanceCreated: string | undefined;
  readonly overrideGoalkeeperResponseType: string | undefined;
  readonly overrideSourceReboundState: string | undefined;
  readonly overrideReboundOutcome: string | undefined;
  readonly overrideBallLooseState: string | undefined;
  readonly overrideRecoveryTeamCandidate: string | undefined;
  readonly overrideNextSandboxPossessionCandidate: string | undefined;
  readonly overrideAttackingProximityScore: string | undefined;
  readonly overrideDefensiveRecoveryScore: string | undefined;
  readonly overrideReboundDangerScore: string | undefined;
  readonly overrideSecondChanceProbability: string | undefined;
  readonly overrideSecondChanceCreated: string | undefined;
  readonly reboundOutcomeDivergenceObserved: string | undefined;
  readonly ballLooseStateDivergenceObserved: string | undefined;
  readonly recoveryTeamDivergenceObserved: string | undefined;
  readonly secondChanceProbabilityObserved: string | undefined;
  readonly secondChanceCreationDivergenceObserved: string | undefined;
  readonly sandboxScoringEventDivergenceObserved: string | undefined;
  readonly sandboxScoreDivergenceObserved: string | undefined;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly sandboxMatchEventCreatedCount: number;
  readonly sandboxScoringEventCreatedCount: number;
  readonly sandboxScoreDeltaTotal: number;
  readonly officialPossessionMutationCount: number;
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
    tagCount: tagCount(report, "workbench_chain_rebound_second_chance_sandbox"),
    officialSandboxEventCount: report.timeline.filter((event) =>
      event.eventId.includes("rebound-second-chance")
    ).length,
    status: valueFromTag(facts, "rebound_second_chance_model_status_"),
    origin: valueFromTag(facts, "rebound_second_chance_model_origin_"),
    baselineReboundOutcome: valueFromTag(facts, "rebound_second_chance_baseline_outcome_"),
    baselineBallLooseState: valueFromTag(facts, "rebound_second_chance_baseline_ball_loose_"),
    baselineSecondChanceCreated: valueFromTag(facts, "rebound_second_chance_baseline_created_"),
    overrideGoalkeeperResponseType: valueFromTag(facts, "rebound_second_chance_override_source_response_type_"),
    overrideSourceReboundState: valueFromTag(facts, "rebound_second_chance_override_source_rebound_state_"),
    overrideReboundOutcome: valueFromTag(facts, "rebound_second_chance_override_outcome_"),
    overrideBallLooseState: valueFromTag(facts, "rebound_second_chance_override_ball_loose_"),
    overrideRecoveryTeamCandidate: valueFromTag(facts, "rebound_second_chance_override_recovery_team_"),
    overrideNextSandboxPossessionCandidate: valueFromTag(facts, "rebound_second_chance_override_next_possession_"),
    overrideAttackingProximityScore: valueFromTag(facts, "rebound_second_chance_override_attacking_proximity_"),
    overrideDefensiveRecoveryScore: valueFromTag(facts, "rebound_second_chance_override_defensive_recovery_"),
    overrideReboundDangerScore: valueFromTag(facts, "rebound_second_chance_override_danger_"),
    overrideSecondChanceProbability: valueFromTag(facts, "rebound_second_chance_override_probability_"),
    overrideSecondChanceCreated: valueFromTag(facts, "rebound_second_chance_override_created_"),
    reboundOutcomeDivergenceObserved: valueFromTag(facts, "rebound_second_chance_outcome_divergence_"),
    ballLooseStateDivergenceObserved: valueFromTag(facts, "rebound_second_chance_ball_loose_divergence_"),
    recoveryTeamDivergenceObserved: valueFromTag(facts, "rebound_second_chance_recovery_team_divergence_"),
    secondChanceProbabilityObserved: valueFromTag(facts, "rebound_second_chance_probability_observed_"),
    secondChanceCreationDivergenceObserved: valueFromTag(facts, "rebound_second_chance_creation_divergence_"),
    sandboxScoringEventDivergenceObserved: valueFromTag(facts, "rebound_second_chance_scoring_event_divergence_"),
    sandboxScoreDivergenceObserved: valueFromTag(facts, "rebound_second_chance_score_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "rebound_second_chance_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "rebound_second_chance_model_applied_to_normal_live_"),
    sandboxMatchEventCreatedCount: hasTag(facts, "rebound_second_chance_match_event_created_true") ? 1 : 0,
    sandboxScoringEventCreatedCount: hasTag(facts, "rebound_second_chance_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(facts, "rebound_second_chance_score_delta_"),
    officialPossessionMutationCount: numberFromTag(facts, "rebound_second_chance_official_possession_mutation_count_"),
    rejectedClosedCandidateCount: numberFromTag(facts, "rebound_second_chance_rejected_closed_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(facts, "rebound_second_chance_rejected_unavailable_count_"),
    officialTimelineInjectionCount: numberFromTag(facts, "rebound_second_chance_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(facts, "rebound_second_chance_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "rebound_second_chance_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "rebound_second_chance_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "rebound_second_chance_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "rebound_second_chance_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "rebound_second_chance_global_economy_claim_count_"),
  };
}
