import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchSegmentRouteInputSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly controlledSegmentSelectionTagCount: number;
  readonly segmentRouteInputTagCount: number;
  readonly routeInputCandidateId?: string;
  readonly routeInputActionType?: string;
  readonly routeInputReceiverId?: string;
  readonly routeInputTargetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly scoreMutationCount: number;
  readonly scoringEventsMutationCount: number;
  readonly routeSuccessRateMutationCount: number;
  readonly productionRouteResolutionMutationCount: number;
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

export function fullMatchSegmentRouteInputSignature(report: MatchReport): FullMatchSegmentRouteInputSignature {
  const routeInputCandidateId = suffixFromTag(report, "segment_route_input_candidate_");
  const routeInputActionType = suffixFromTag(report, "segment_route_input_action_");
  const routeInputReceiverId = suffixFromTag(report, "segment_route_input_receiver_");
  const routeInputTargetZone = suffixFromTag(report, "segment_route_input_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    controlledSegmentSelectionTagCount: countTag(report, "workbench_chain_controlled_segment_selection"),
    segmentRouteInputTagCount: countTag(report, "workbench_chain_segment_route_input"),
    ...(routeInputCandidateId === undefined ? {} : { routeInputCandidateId }),
    ...(routeInputActionType === undefined ? {} : { routeInputActionType }),
    ...(routeInputReceiverId === undefined ? {} : { routeInputReceiverId }),
    ...(routeInputTargetZone === undefined ? {} : { routeInputTargetZone }),
    candidateLegal: report.evidenceFacts.some((fact) => fact.internalTags.includes("segment_route_input_candidate_legal_true")),
    candidateAvailable: report.evidenceFacts.some((fact) => fact.internalTags.includes("segment_route_input_candidate_available_true")),
    rejectedClosedCandidateCount: numberFromTag(report, "segment_route_input_closed_rejected_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(report, "segment_route_input_unavailable_rejected_count_"),
    scoreMutationCount: numberFromTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromTag(report, "scoring_events_mutation_count_"),
    routeSuccessRateMutationCount: numberFromTag(report, "route_success_mutation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
  };
}
