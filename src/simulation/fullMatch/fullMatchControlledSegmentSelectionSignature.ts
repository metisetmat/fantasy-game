import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchControlledSegmentSelectionSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly shadowRouteSelectionTagCount: number;
  readonly controlledSegmentSelectionTagCount: number;
  readonly controlledSelectionCandidateId?: string;
  readonly controlledSelectionActionType?: string;
  readonly controlledSelectionReceiverId?: string;
  readonly controlledSelectionTargetZone?: string;
  readonly selectedCandidateLegal: boolean;
  readonly selectedCandidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly scoreMutationCount: number;
  readonly scoringEventsMutationCount: number;
  readonly routeSuccessRateMutationCount: number;
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

export function fullMatchControlledSegmentSelectionSignature(report: MatchReport): FullMatchControlledSegmentSelectionSignature {
  const controlledSelectionCandidateId = suffixFromTag(report, "controlled_segment_selection_candidate_");
  const controlledSelectionActionType = suffixFromTag(report, "controlled_segment_selection_action_");
  const controlledSelectionReceiverId = suffixFromTag(report, "controlled_segment_selection_receiver_");
  const controlledSelectionTargetZone = suffixFromTag(report, "controlled_segment_selection_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    shadowRouteSelectionTagCount: countTag(report, "workbench_chain_shadow_route_selection"),
    controlledSegmentSelectionTagCount: countTag(report, "workbench_chain_controlled_segment_selection"),
    ...(controlledSelectionCandidateId === undefined ? {} : { controlledSelectionCandidateId }),
    ...(controlledSelectionActionType === undefined ? {} : { controlledSelectionActionType }),
    ...(controlledSelectionReceiverId === undefined ? {} : { controlledSelectionReceiverId }),
    ...(controlledSelectionTargetZone === undefined ? {} : { controlledSelectionTargetZone }),
    selectedCandidateLegal: report.evidenceFacts.some((fact) => fact.internalTags.includes("controlled_segment_selection_selected_legal_true")),
    selectedCandidateAvailable: report.evidenceFacts.some((fact) => fact.internalTags.includes("controlled_segment_selection_selected_available_true")),
    rejectedClosedCandidateCount: numberFromTag(report, "controlled_segment_selection_closed_rejected_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(report, "controlled_segment_selection_unavailable_rejected_count_"),
    scoreMutationCount: numberFromTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromTag(report, "scoring_events_mutation_count_"),
    routeSuccessRateMutationCount: numberFromTag(report, "route_success_mutation_count_"),
  };
}
