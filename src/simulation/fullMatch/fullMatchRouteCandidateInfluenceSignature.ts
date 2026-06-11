import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchRouteCandidateInfluenceSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly chainContextTagCount: number;
  readonly routeCandidateInfluenceTagCount: number;
  readonly influencedCandidateCount: number;
  readonly diagnosticSelectionChanged: boolean;
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

function numberFromEvidenceTag(report: MatchReport, prefix: string): number {
  const tag = report.evidenceFacts
    .flatMap((fact) => fact.internalTags)
    .find((candidate) => candidate.startsWith(prefix));

  return tag === undefined ? 0 : Number.parseInt(tag.slice(prefix.length), 10);
}

export function fullMatchRouteCandidateInfluenceSignature(report: MatchReport): FullMatchRouteCandidateInfluenceSignature {
  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    chainContextTagCount: countTag(report, "workbench_chain_context"),
    routeCandidateInfluenceTagCount: countTag(report, "workbench_chain_route_candidate_influence"),
    influencedCandidateCount: numberFromEvidenceTag(report, "route_candidate_influence_influenced_count_"),
    diagnosticSelectionChanged: report.evidenceFacts.some((fact) => fact.internalTags.includes("route_candidate_influence_selection_changed_true")),
    scoreMutationCount: numberFromEvidenceTag(report, "score_mutation_count_"),
    scoringEventsMutationCount: numberFromEvidenceTag(report, "scoring_events_mutation_count_"),
  };
}
