import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchIsolatedMiniMatchOverrideExperimentSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly liveSelectionOverrideGuardTagCount: number;
  readonly isolatedOverrideExperimentTagCount: number;
  readonly baselineCandidateId?: string;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly overrideAppliedInIsolatedExperiment: boolean;
  readonly overrideAppliedToNormalLiveSelection: boolean;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly isolatedSelectionDivergenceObserved: boolean;
  readonly isolatedScoreDivergenceObserved: boolean;
  readonly isolatedScoringEventDivergenceObserved: boolean;
  readonly isolatedTimelineDivergenceObserved: boolean;
  readonly normalFullMatchScoreMutationCount: number;
  readonly normalFullMatchScoringEventMutationCount: number;
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

export function fullMatchIsolatedMiniMatchOverrideExperimentSignature(
  report: MatchReport,
): FullMatchIsolatedMiniMatchOverrideExperimentSignature {
  const baselineCandidateId = suffixFromTag(report, "isolated_override_baseline_candidate_");
  const overrideCandidateId = suffixFromTag(report, "isolated_override_candidate_");
  const overrideActionType = suffixFromTag(report, "isolated_override_action_");
  const overrideReceiverId = suffixFromTag(report, "isolated_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "isolated_override_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    liveSelectionOverrideGuardTagCount: countTag(report, "workbench_chain_live_selection_override_guard"),
    isolatedOverrideExperimentTagCount: countTag(report, "workbench_chain_isolated_minimatch_override_experiment"),
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    overrideAppliedInIsolatedExperiment: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_applied_in_experiment_true")
    ),
    overrideAppliedToNormalLiveSelection: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_applied_to_normal_live_true")
    ),
    candidateLegal: report.evidenceFacts.some((fact) => fact.internalTags.includes("isolated_override_candidate_legal_true")),
    candidateAvailable: report.evidenceFacts.some((fact) => fact.internalTags.includes("isolated_override_candidate_available_true")),
    rejectedClosedCandidateCount: numberFromTag(report, "isolated_override_closed_rejected_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(report, "isolated_override_unavailable_rejected_count_"),
    isolatedSelectionDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_selection_divergence_true")
    ),
    isolatedScoreDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_score_divergence_true")
    ),
    isolatedScoringEventDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_scoring_event_divergence_true")
    ),
    isolatedTimelineDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("isolated_override_timeline_divergence_true")
    ),
    normalFullMatchScoreMutationCount: numberFromTag(report, "normal_fullmatch_score_mutation_count_"),
    normalFullMatchScoringEventMutationCount: numberFromTag(report, "normal_fullmatch_scoring_events_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "global_economy_claim_count_"),
  };
}
