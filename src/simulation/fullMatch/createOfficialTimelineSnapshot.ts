import type { MatchEvent } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { ScoreState } from "../../models/match";
import type { OfficialTimelineSnapshot } from "./officialTimelineDiffView";

function scoreValueFromTimeline(timeline: readonly MatchEvent[]): number {
  return timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function eventSignature(timeline: readonly MatchEvent[]): string {
  return timeline
    .map((event) => {
      const consequenceSignature = event.consequences
        .map((consequence) => `${consequence.type}:${consequence.value ?? 0}`)
        .join(",");

      return `${event.eventId}:${event.eventType}:${event.timestamp.minute}:${event.teamId}:${consequenceSignature}`;
    })
    .join("|");
}

export function createOfficialTimelineSnapshot(input: {
  readonly timeline: readonly MatchEvent[];
  readonly score: ScoreState;
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}): OfficialTimelineSnapshot {
  const possessionEvent = input.timeline.find((event) => event.eventType !== "kickoff");
  const scoreTotal = input.score.home + input.score.away;
  const consequenceScore = scoreValueFromTimeline(input.timeline);

  return {
    eventCount: input.timeline.length,
    scoringEventCount: input.timeline.filter((event) => event.eventType === "scoring").length,
    scoreTotal,
    scoreDisplay: `${input.homeTeamId} ${input.score.home} - ${input.score.away} ${input.awayTeamId}`,
    ...(possessionEvent?.teamId === undefined ? {} : { possessionTeamId: possessionEvent.teamId }),
    eventSignature: `${eventSignature(input.timeline)}#score=${scoreTotal}#scoreConsequences=${consequenceScore}`,
  };
}
