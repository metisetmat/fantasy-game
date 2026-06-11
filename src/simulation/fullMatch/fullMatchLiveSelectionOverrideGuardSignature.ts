import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchLiveSelectionOverrideGuardSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly controlledMiniMatchRouteSourceTagCount: number;
  readonly liveSelectionOverrideGuardTagCount: number;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly overrideAppliedToLiveSelection: boolean;
  readonly scoreMutationCount: number;
  readonly scoringEventsMutationCount: number;
  readonly routeSuccessRateMutationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly normalLiveMiniMatchResolutionMutationCount: number;
  readonly scoringEventCreationCount: number;
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

export function fullMatchLiveSelectionOverrideGuardSignature(
  report: MatchReport,
): FullMatchLiveSelectionOverrideGuardSignature {
  const overrideCandidateId = suffixFromTag(report, "live_selection_override_candidate_");
  const overrideActionType = suffixFromTag(report, "live_selection_override_action_");
  const overrideReceiverId = suffixFromTag(report, "live_selection_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "live_selection_override_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    controlledMiniMatchRouteSourceTagCount: countTag(report, "workbench_chain_controlled_minimatch_route_source"),
    liveSelectionOverrideGuardTagCount: countTag(report, "workbench_chain_live_selection_override_guard"),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    candidateLegal: report.evidenceFacts.some((fact) => fact.internalTags.includes("live_selection_override_candidate_legal_true")),
    candidateAvailable: report.evidenceFacts.some((fact) => fact.internalTags.includes("live_selection_override_candidate_available_true")),
    rejectedClosedCandidateCount: numberFromTag(report, "live_selection_override_closed_rejected_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(report, "live_selection_override_unavailable_rejected_count_"),
    overrideAppliedToLiveSelection: report.evidenceFacts.some((fact) => fact.internalTags.includes("live_selection_override_applied_true")),
    scoreMutationCount: numberFromTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromTag(report, "scoring_events_mutation_count_"),
    routeSuccessRateMutationCount: numberFromTag(report, "route_success_mutation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
    normalLiveMiniMatchResolutionMutationCount: numberFromTag(report, "normal_live_minimatch_resolution_mutation_count_"),
    scoringEventCreationCount: numberFromTag(report, "scoring_event_creation_count_"),
  };
}
