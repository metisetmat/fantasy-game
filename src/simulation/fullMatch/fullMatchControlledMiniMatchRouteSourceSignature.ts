import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchControlledMiniMatchRouteSourceSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly segmentRouteInputTagCount: number;
  readonly controlledMiniMatchRouteSourceTagCount: number;
  readonly routeSourceCandidateId?: string;
  readonly routeSourceActionType?: string;
  readonly routeSourceReceiverId?: string;
  readonly routeSourceTargetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly scoreMutationCount: number;
  readonly scoringEventsMutationCount: number;
  readonly routeSuccessRateMutationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly liveMiniMatchResolutionMutationCount: number;
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

export function fullMatchControlledMiniMatchRouteSourceSignature(
  report: MatchReport,
): FullMatchControlledMiniMatchRouteSourceSignature {
  const routeSourceCandidateId = suffixFromTag(report, "controlled_minimatch_route_source_candidate_");
  const routeSourceActionType = suffixFromTag(report, "controlled_minimatch_route_source_action_");
  const routeSourceReceiverId = suffixFromTag(report, "controlled_minimatch_route_source_receiver_");
  const routeSourceTargetZone = suffixFromTag(report, "controlled_minimatch_route_source_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    segmentRouteInputTagCount: countTag(report, "workbench_chain_segment_route_input"),
    controlledMiniMatchRouteSourceTagCount: countTag(report, "workbench_chain_controlled_minimatch_route_source"),
    ...(routeSourceCandidateId === undefined ? {} : { routeSourceCandidateId }),
    ...(routeSourceActionType === undefined ? {} : { routeSourceActionType }),
    ...(routeSourceReceiverId === undefined ? {} : { routeSourceReceiverId }),
    ...(routeSourceTargetZone === undefined ? {} : { routeSourceTargetZone }),
    candidateLegal: report.evidenceFacts.some((fact) => fact.internalTags.includes("controlled_minimatch_route_source_candidate_legal_true")),
    candidateAvailable: report.evidenceFacts.some((fact) => fact.internalTags.includes("controlled_minimatch_route_source_candidate_available_true")),
    rejectedClosedCandidateCount: numberFromTag(report, "controlled_minimatch_route_source_closed_rejected_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(report, "controlled_minimatch_route_source_unavailable_rejected_count_"),
    scoreMutationCount: numberFromTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromTag(report, "scoring_events_mutation_count_"),
    routeSuccessRateMutationCount: numberFromTag(report, "route_success_mutation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
    liveMiniMatchResolutionMutationCount: numberFromTag(report, "live_minimatch_resolution_mutation_count_"),
  };
}
