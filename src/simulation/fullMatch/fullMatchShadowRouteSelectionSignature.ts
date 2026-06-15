import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchShadowRouteSelectionSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly routeCandidateInfluenceTagCount: number;
  readonly shadowRouteSelectionTagCount: number;
  readonly productionSelectionCandidateId?: string;
  readonly shadowSelectionCandidateId?: string;
  readonly shadowSelectionChangedFromProduction: boolean;
  readonly closedCandidateRejectedCount: number;
  readonly unavailableCandidateRejectedCount: number;
  readonly scoreMutationCount: number;
  readonly scoringEventsMutationCount: number;
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

export function fullMatchShadowRouteSelectionSignature(report: MatchReport): FullMatchShadowRouteSelectionSignature {
  const productionSelectionCandidateId = suffixFromTag(report, "shadow_route_selection_production_candidate_");
  const shadowSelectionCandidateId = suffixFromTag(report, "shadow_route_selection_candidate_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    routeCandidateInfluenceTagCount: countTag(report, "workbench_chain_route_candidate_influence"),
    shadowRouteSelectionTagCount: countTag(report, "workbench_chain_shadow_route_selection"),
    ...(productionSelectionCandidateId === undefined ? {} : { productionSelectionCandidateId }),
    ...(shadowSelectionCandidateId === undefined ? {} : { shadowSelectionCandidateId }),
    shadowSelectionChangedFromProduction: report.evidenceFacts.some((fact) => fact.internalTags.includes("shadow_route_selection_changed_true")),
    closedCandidateRejectedCount: numberFromTag(report, "shadow_route_selection_closed_rejected_count_"),
    unavailableCandidateRejectedCount: numberFromTag(report, "shadow_route_selection_unavailable_rejected_count_"),
    scoreMutationCount: numberFromTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromTag(report, "scoring_events_mutation_count_"),
  };
}
