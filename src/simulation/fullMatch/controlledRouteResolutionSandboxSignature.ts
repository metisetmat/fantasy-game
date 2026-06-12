import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type ControlledRouteResolutionSandboxSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly sandboxTagCount: number;
  readonly officialSandboxEventCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
  readonly baselineOutcome?: string;
  readonly baselineResolved: boolean;
  readonly baselineDefensivePressure: number;
  readonly baselineReceptionQuality: number;
  readonly baselineTurnoverRisk: number;
  readonly baselineDangerProbability: number;
  readonly baselineScoringOpportunityProbability: number;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly overrideOutcome?: string;
  readonly overrideResolved: boolean;
  readonly overrideDefensivePressure: number;
  readonly overrideReceptionQuality: number;
  readonly overrideTurnoverRisk: number;
  readonly overrideDangerProbability: number;
  readonly overrideScoringOpportunityProbability: number;
  readonly selectionDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly sandboxAppliedOnlyInIsolatedResolution: boolean;
  readonly sandboxAppliedToNormalLiveSelection: boolean;
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

export function controlledRouteResolutionSandboxSignature(
  report: MatchReport,
): ControlledRouteResolutionSandboxSignature {
  const baselineCandidateId = suffixFromTag(report, "sandbox_baseline_candidate_");
  const baselineActionType = suffixFromTag(report, "sandbox_baseline_action_");
  const baselineReceiverId = suffixFromTag(report, "sandbox_baseline_receiver_");
  const baselineTargetZone = suffixFromTag(report, "sandbox_baseline_zone_");
  const baselineOutcome = suffixFromTag(report, "sandbox_baseline_outcome_");
  const overrideCandidateId = suffixFromTag(report, "sandbox_override_candidate_");
  const overrideActionType = suffixFromTag(report, "sandbox_override_action_");
  const overrideReceiverId = suffixFromTag(report, "sandbox_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "sandbox_override_zone_");
  const overrideOutcome = suffixFromTag(report, "sandbox_override_outcome_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    sandboxTagCount: countTag(report, "workbench_chain_controlled_route_resolution_sandbox"),
    officialSandboxEventCount: report.timeline.filter((event) => event.eventId.includes("sandbox-route-resolution")).length,
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineActionType === undefined ? {} : { baselineActionType }),
    ...(baselineReceiverId === undefined ? {} : { baselineReceiverId }),
    ...(baselineTargetZone === undefined ? {} : { baselineTargetZone }),
    ...(baselineOutcome === undefined ? {} : { baselineOutcome }),
    baselineResolved: hasEvidenceTag(report, "sandbox_baseline_resolved_true"),
    baselineDefensivePressure: numberFromTag(report, "sandbox_baseline_defensive_pressure_"),
    baselineReceptionQuality: numberFromTag(report, "sandbox_baseline_reception_quality_"),
    baselineTurnoverRisk: numberFromTag(report, "sandbox_baseline_turnover_risk_"),
    baselineDangerProbability: numberFromTag(report, "sandbox_baseline_danger_probability_"),
    baselineScoringOpportunityProbability: numberFromTag(report, "sandbox_baseline_scoring_opportunity_probability_"),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    ...(overrideOutcome === undefined ? {} : { overrideOutcome }),
    overrideResolved: hasEvidenceTag(report, "sandbox_override_resolved_true"),
    overrideDefensivePressure: numberFromTag(report, "sandbox_override_defensive_pressure_"),
    overrideReceptionQuality: numberFromTag(report, "sandbox_override_reception_quality_"),
    overrideTurnoverRisk: numberFromTag(report, "sandbox_override_turnover_risk_"),
    overrideDangerProbability: numberFromTag(report, "sandbox_override_danger_probability_"),
    overrideScoringOpportunityProbability: numberFromTag(report, "sandbox_override_scoring_opportunity_probability_"),
    selectionDivergenceObserved: hasEvidenceTag(report, "sandbox_selection_divergence_true"),
    carrierDivergenceObserved: hasEvidenceTag(report, "sandbox_carrier_divergence_true"),
    zoneProgressionDivergenceObserved: hasEvidenceTag(report, "sandbox_zone_progression_divergence_true"),
    dangerCreationDivergenceObserved: hasEvidenceTag(report, "sandbox_danger_creation_divergence_true"),
    scoringOpportunityDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_opportunity_divergence_true"),
    sandboxScoringEventDivergenceObserved: hasEvidenceTag(report, "sandbox_scoring_event_divergence_true"),
    sandboxScoreDivergenceObserved: hasEvidenceTag(report, "sandbox_score_divergence_true"),
    sandboxAppliedOnlyInIsolatedResolution: hasEvidenceTag(report, "sandbox_applied_only_in_isolated_resolution_true"),
    sandboxAppliedToNormalLiveSelection: hasEvidenceTag(report, "sandbox_applied_to_normal_live_true"),
    officialTimelineInjectionCount: numberFromTag(report, "sandbox_events_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(report, "sandbox_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(report, "sandbox_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "sandbox_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "sandbox_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "sandbox_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "sandbox_global_economy_claim_count_"),
  };
}
