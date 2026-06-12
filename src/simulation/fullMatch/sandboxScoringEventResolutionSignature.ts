import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type SandboxScoringEventResolutionSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly resolutionTagCount: number;
  readonly officialSandboxResolutionEventCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineSourceScoringCandidateType?: string;
  readonly baselineResolutionType?: string;
  readonly baselineShotAttemptCreated: boolean;
  readonly baselineShotQuality: number;
  readonly baselineGoalkeeperResponse?: string;
  readonly overrideCandidateId?: string;
  readonly overrideSourceScoringCandidateType?: string;
  readonly overrideResolutionType?: string;
  readonly overrideShotAttemptCreated: boolean;
  readonly overrideShotQuality: number;
  readonly overrideGoalkeeperResponse?: string;
  readonly scoringResolutionTypeDivergenceObserved: boolean;
  readonly shotAttemptCreationDivergenceObserved: boolean;
  readonly shotQualityDivergenceObserved: boolean;
  readonly goalkeeperResponseDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly modelAppliedOnlyInSandbox: boolean;
  readonly modelAppliedToNormalLiveSelection: boolean;
  readonly sandboxScoringEventCreatedCount: number;
  readonly sandboxScoreDeltaTotal: number;
  readonly officialTimelineInjectionCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
};

function scoreChangeTotal(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function countTag(report: MatchReport, tag: string): number {
  return report.timeline.filter((event) => event.tags.includes(tag)).length;
}

function suffixFromTag(report: MatchReport, prefix: string): string | undefined {
  const tag = report.evidenceFacts
    .flatMap((fact) => fact.internalTags)
    .find((candidate) => candidate.startsWith(prefix));

  return tag?.slice(prefix.length);
}

function numberFromTag(report: MatchReport, prefix: string): number {
  const value = suffixFromTag(report, prefix);

  return value === undefined ? 0 : Number.parseInt(value, 10);
}

function hasEvidenceTag(report: MatchReport, tag: string): boolean {
  return report.evidenceFacts.some((fact) => fact.internalTags.includes(tag));
}

export function sandboxScoringEventResolutionSignature(
  report: MatchReport,
): SandboxScoringEventResolutionSignature {
  const baselineCandidateId = suffixFromTag(report, "sandbox_scoring_resolution_baseline_candidate_");
  const baselineSourceScoringCandidateType = suffixFromTag(report, "sandbox_scoring_resolution_baseline_source_candidate_type_");
  const baselineResolutionType = suffixFromTag(report, "sandbox_scoring_resolution_baseline_type_");
  const baselineGoalkeeperResponse = suffixFromTag(report, "sandbox_scoring_resolution_baseline_goalkeeper_response_");
  const overrideCandidateId = suffixFromTag(report, "sandbox_scoring_resolution_override_candidate_");
  const overrideSourceScoringCandidateType = suffixFromTag(report, "sandbox_scoring_resolution_override_source_candidate_type_");
  const overrideResolutionType = suffixFromTag(report, "sandbox_scoring_resolution_override_type_");
  const overrideGoalkeeperResponse = suffixFromTag(report, "sandbox_scoring_resolution_override_goalkeeper_response_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    resolutionTagCount: countTag(report, "workbench_chain_sandbox_scoring_event_resolution"),
    officialSandboxResolutionEventCount: report.timeline.filter((event) =>
      event.eventId.includes("sandbox-scoring-resolution")
    ).length,
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineSourceScoringCandidateType === undefined ? {} : { baselineSourceScoringCandidateType }),
    ...(baselineResolutionType === undefined ? {} : { baselineResolutionType }),
    baselineShotAttemptCreated: hasEvidenceTag(report, "sandbox_scoring_resolution_baseline_shot_attempt_true"),
    baselineShotQuality: numberFromTag(report, "sandbox_scoring_resolution_baseline_shot_quality_"),
    ...(baselineGoalkeeperResponse === undefined ? {} : { baselineGoalkeeperResponse }),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideSourceScoringCandidateType === undefined ? {} : { overrideSourceScoringCandidateType }),
    ...(overrideResolutionType === undefined ? {} : { overrideResolutionType }),
    overrideShotAttemptCreated: hasEvidenceTag(report, "sandbox_scoring_resolution_override_shot_attempt_true"),
    overrideShotQuality: numberFromTag(report, "sandbox_scoring_resolution_override_shot_quality_"),
    ...(overrideGoalkeeperResponse === undefined ? {} : { overrideGoalkeeperResponse }),
    scoringResolutionTypeDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_resolution_type_divergence_true"),
    shotAttemptCreationDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_resolution_shot_attempt_divergence_true"),
    shotQualityDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_resolution_shot_quality_divergence_true"),
    goalkeeperResponseDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_resolution_goalkeeper_response_divergence_true"),
    sandboxScoringEventDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_event_divergence_true"),
    sandboxScoreDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_resolution_score_divergence_true"),
    modelAppliedOnlyInSandbox: hasEvidenceTag(report, "sandbox_scoring_resolution_applied_only_in_sandbox_true"),
    modelAppliedToNormalLiveSelection: hasEvidenceTag(report, "sandbox_scoring_resolution_applied_to_normal_live_true"),
    sandboxScoringEventCreatedCount: hasEvidenceTag(report, "sandbox_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(report, "sandbox_scoring_resolution_score_delta_"),
    officialTimelineInjectionCount: numberFromTag(report, "sandbox_scoring_resolution_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(report, "sandbox_scoring_resolution_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(report, "sandbox_scoring_resolution_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "sandbox_scoring_resolution_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "sandbox_scoring_resolution_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "sandbox_scoring_resolution_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "sandbox_scoring_resolution_global_economy_claim_count_"),
  };
}
