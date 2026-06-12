import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type SandboxScoringEventCandidateSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly candidateTagCount: number;
  readonly officialSandboxCandidateEventCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineSourceOpportunityType?: string;
  readonly baselineScoringCandidateType?: string;
  readonly baselineScoringCandidateFamily?: string;
  readonly baselineScoringCandidateProbability: number;
  readonly baselineConversionProbability: number;
  readonly baselineScoringCandidateCreated: boolean;
  readonly overrideCandidateId?: string;
  readonly overrideSourceOpportunityType?: string;
  readonly overrideScoringCandidateType?: string;
  readonly overrideScoringCandidateFamily?: string;
  readonly overrideScoringCandidateProbability: number;
  readonly overrideConversionProbability: number;
  readonly overrideScoringCandidateCreated: boolean;
  readonly scoringCandidateTypeDivergenceObserved: boolean;
  readonly scoringCandidateFamilyDivergenceObserved: boolean;
  readonly scoringCandidateProbabilityDivergenceObserved: boolean;
  readonly scoringCandidateCreationDivergenceObserved: boolean;
  readonly conversionProbabilityDivergenceObserved: boolean;
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

export function sandboxScoringEventCandidateSignature(
  report: MatchReport,
): SandboxScoringEventCandidateSignature {
  const baselineCandidateId = suffixFromTag(report, "sandbox_scoring_candidate_baseline_candidate_");
  const baselineSourceOpportunityType = suffixFromTag(report, "sandbox_scoring_candidate_baseline_source_opportunity_type_");
  const baselineScoringCandidateType = suffixFromTag(report, "sandbox_scoring_candidate_baseline_type_");
  const baselineScoringCandidateFamily = suffixFromTag(report, "sandbox_scoring_candidate_baseline_family_");
  const overrideCandidateId = suffixFromTag(report, "sandbox_scoring_candidate_override_candidate_");
  const overrideSourceOpportunityType = suffixFromTag(report, "sandbox_scoring_candidate_override_source_opportunity_type_");
  const overrideScoringCandidateType = suffixFromTag(report, "sandbox_scoring_candidate_override_type_");
  const overrideScoringCandidateFamily = suffixFromTag(report, "sandbox_scoring_candidate_override_family_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    candidateTagCount: countTag(report, "workbench_chain_sandbox_scoring_event_candidate"),
    officialSandboxCandidateEventCount: report.timeline.filter((event) =>
      event.eventId.includes("sandbox-scoring-candidate")
    ).length,
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineSourceOpportunityType === undefined ? {} : { baselineSourceOpportunityType }),
    ...(baselineScoringCandidateType === undefined ? {} : { baselineScoringCandidateType }),
    ...(baselineScoringCandidateFamily === undefined ? {} : { baselineScoringCandidateFamily }),
    baselineScoringCandidateProbability: numberFromTag(report, "sandbox_scoring_candidate_baseline_probability_"),
    baselineConversionProbability: numberFromTag(report, "sandbox_scoring_candidate_baseline_conversion_probability_"),
    baselineScoringCandidateCreated: hasEvidenceTag(report, "sandbox_scoring_candidate_baseline_created_true"),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideSourceOpportunityType === undefined ? {} : { overrideSourceOpportunityType }),
    ...(overrideScoringCandidateType === undefined ? {} : { overrideScoringCandidateType }),
    ...(overrideScoringCandidateFamily === undefined ? {} : { overrideScoringCandidateFamily }),
    overrideScoringCandidateProbability: numberFromTag(report, "sandbox_scoring_candidate_override_probability_"),
    overrideConversionProbability: numberFromTag(report, "sandbox_scoring_candidate_override_conversion_probability_"),
    overrideScoringCandidateCreated: hasEvidenceTag(report, "sandbox_scoring_candidate_override_created_true"),
    scoringCandidateTypeDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_type_divergence_true"),
    scoringCandidateFamilyDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_family_divergence_true"),
    scoringCandidateProbabilityDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_probability_divergence_true"),
    scoringCandidateCreationDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_creation_divergence_true"),
    conversionProbabilityDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_conversion_probability_divergence_true"),
    sandboxScoringEventDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_event_divergence_true"),
    sandboxScoreDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_candidate_score_divergence_true"),
    modelAppliedOnlyInSandbox: hasEvidenceTag(report, "sandbox_scoring_candidate_applied_only_in_sandbox_true"),
    modelAppliedToNormalLiveSelection: hasEvidenceTag(report, "sandbox_scoring_candidate_applied_to_normal_live_true"),
    sandboxScoringEventCreatedCount: hasEvidenceTag(report, "sandbox_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(report, "sandbox_scoring_candidate_score_delta_"),
    officialTimelineInjectionCount: numberFromTag(report, "sandbox_scoring_candidate_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(report, "sandbox_scoring_candidate_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(report, "sandbox_scoring_candidate_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "sandbox_scoring_candidate_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "sandbox_scoring_candidate_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "sandbox_scoring_candidate_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "sandbox_scoring_candidate_global_economy_claim_count_"),
  };
}
