import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type SandboxScoringOpportunityModelSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly opportunityTagCount: number;
  readonly officialSandboxOpportunityEventCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
  readonly baselineRouteOutcome?: string;
  readonly baselineSourceDangerProbability: number;
  readonly baselineSourceScoringOpportunityProbability: number;
  readonly baselineOpportunityType?: string;
  readonly baselineOpportunityFamily?: string;
  readonly baselineOpportunityProbability: number;
  readonly baselineOpportunityCreated: boolean;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly overrideRouteOutcome?: string;
  readonly overrideSourceDangerProbability: number;
  readonly overrideSourceScoringOpportunityProbability: number;
  readonly overrideOpportunityType?: string;
  readonly overrideOpportunityFamily?: string;
  readonly overrideOpportunityProbability: number;
  readonly overrideOpportunityCreated: boolean;
  readonly opportunityTypeDivergenceObserved: boolean;
  readonly opportunityFamilyDivergenceObserved: boolean;
  readonly opportunityProbabilityDivergenceObserved: boolean;
  readonly opportunityCreationDivergenceObserved: boolean;
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

export function sandboxScoringOpportunityModelSignature(
  report: MatchReport,
): SandboxScoringOpportunityModelSignature {
  const baselineCandidateId = suffixFromTag(report, "sandbox_opportunity_baseline_candidate_");
  const baselineActionType = suffixFromTag(report, "sandbox_opportunity_baseline_action_");
  const baselineReceiverId = suffixFromTag(report, "sandbox_opportunity_baseline_receiver_");
  const baselineTargetZone = suffixFromTag(report, "sandbox_opportunity_baseline_zone_");
  const baselineRouteOutcome = suffixFromTag(report, "sandbox_opportunity_baseline_route_outcome_");
  const baselineOpportunityType = suffixFromTag(report, "sandbox_opportunity_baseline_type_");
  const baselineOpportunityFamily = suffixFromTag(report, "sandbox_opportunity_baseline_family_");
  const overrideCandidateId = suffixFromTag(report, "sandbox_opportunity_override_candidate_");
  const overrideActionType = suffixFromTag(report, "sandbox_opportunity_override_action_");
  const overrideReceiverId = suffixFromTag(report, "sandbox_opportunity_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "sandbox_opportunity_override_zone_");
  const overrideRouteOutcome = suffixFromTag(report, "sandbox_opportunity_override_route_outcome_");
  const overrideOpportunityType = suffixFromTag(report, "sandbox_opportunity_override_type_");
  const overrideOpportunityFamily = suffixFromTag(report, "sandbox_opportunity_override_family_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    opportunityTagCount: countTag(report, "workbench_chain_sandbox_scoring_opportunity_model"),
    officialSandboxOpportunityEventCount: report.timeline.filter((event) =>
      event.eventId.includes("sandbox-scoring-opportunity")
    ).length,
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineActionType === undefined ? {} : { baselineActionType }),
    ...(baselineReceiverId === undefined ? {} : { baselineReceiverId }),
    ...(baselineTargetZone === undefined ? {} : { baselineTargetZone }),
    ...(baselineRouteOutcome === undefined ? {} : { baselineRouteOutcome }),
    baselineSourceDangerProbability: numberFromTag(report, "sandbox_opportunity_baseline_source_danger_probability_"),
    baselineSourceScoringOpportunityProbability: numberFromTag(report, "sandbox_opportunity_baseline_source_scoring_opportunity_probability_"),
    ...(baselineOpportunityType === undefined ? {} : { baselineOpportunityType }),
    ...(baselineOpportunityFamily === undefined ? {} : { baselineOpportunityFamily }),
    baselineOpportunityProbability: numberFromTag(report, "sandbox_opportunity_baseline_probability_"),
    baselineOpportunityCreated: hasEvidenceTag(report, "sandbox_opportunity_baseline_created_true"),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    ...(overrideRouteOutcome === undefined ? {} : { overrideRouteOutcome }),
    overrideSourceDangerProbability: numberFromTag(report, "sandbox_opportunity_override_source_danger_probability_"),
    overrideSourceScoringOpportunityProbability: numberFromTag(report, "sandbox_opportunity_override_source_scoring_opportunity_probability_"),
    ...(overrideOpportunityType === undefined ? {} : { overrideOpportunityType }),
    ...(overrideOpportunityFamily === undefined ? {} : { overrideOpportunityFamily }),
    overrideOpportunityProbability: numberFromTag(report, "sandbox_opportunity_override_probability_"),
    overrideOpportunityCreated: hasEvidenceTag(report, "sandbox_opportunity_override_created_true"),
    opportunityTypeDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_type_divergence_true"),
    opportunityFamilyDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_family_divergence_true"),
    opportunityProbabilityDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_probability_divergence_true"),
    opportunityCreationDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_creation_divergence_true"),
    sandboxScoringEventDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_scoring_event_divergence_true"),
    sandboxScoreDivergenceObserved: hasEvidenceTag(report, "sandbox_opportunity_score_divergence_true"),
    modelAppliedOnlyInSandbox: hasEvidenceTag(report, "sandbox_opportunity_applied_only_in_sandbox_true"),
    modelAppliedToNormalLiveSelection: hasEvidenceTag(report, "sandbox_opportunity_applied_to_normal_live_true"),
    sandboxScoringEventCreatedCount: hasEvidenceTag(report, "sandbox_opportunity_scoring_event_created_true") ? 1 : 0,
    sandboxScoreDeltaTotal: numberFromTag(report, "sandbox_opportunity_score_delta_"),
    officialTimelineInjectionCount: numberFromTag(report, "sandbox_opportunity_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(report, "sandbox_opportunity_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(report, "sandbox_opportunity_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "sandbox_opportunity_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "sandbox_opportunity_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "sandbox_opportunity_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "sandbox_opportunity_global_economy_claim_count_"),
  };
}
