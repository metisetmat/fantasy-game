import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchSegmentContextSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly chainContextTagCount: number;
  readonly chainContextFinalCarrier?: string;
  readonly chainContextFinalZone?: string;
};

function scoreChangeTotal(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function suffixFromTag(tags: readonly string[], prefix: string): string | undefined {
  const tag = tags.find((candidate) => candidate.startsWith(prefix));

  return tag?.slice(prefix.length);
}

export function fullMatchSegmentContextSignature(report: MatchReport): FullMatchSegmentContextSignature {
  const chainContextEvents = report.timeline.filter((event) => event.tags.includes("workbench_chain_context"));
  const chainContextTags = chainContextEvents.flatMap((event) => event.tags);
  const chainContextFinalCarrier = suffixFromTag(chainContextTags, "chain_context_final_carrier_");
  const chainContextFinalZone = suffixFromTag(chainContextTags, "chain_context_final_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    chainContextTagCount: chainContextEvents.length,
    ...(chainContextFinalCarrier === undefined ? {} : { chainContextFinalCarrier }),
    ...(chainContextFinalZone === undefined ? {} : { chainContextFinalZone }),
  };
}
