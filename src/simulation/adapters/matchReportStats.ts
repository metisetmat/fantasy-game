import type {
  MatchEvent,
  MatchInput,
  TeamMatchStats,
  ZoneStats,
} from "../../contracts/engineToCoach";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ScoreState } from "../../models/match";
import type { MiniMatchResult } from "../miniMatch";
import type { MiniMatchInputAdapterResult } from "./matchInputToMiniMatch";

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nonKickoffEvents(timeline: readonly MatchEvent[]): readonly MatchEvent[] {
  return timeline.filter((event) => event.eventType !== "kickoff");
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function scoringAttemptsForTeam(input: {
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly side: "home" | "away";
}): number {
  const prototypeId = input.side === "home" ? input.adapter.homePrototype.id : input.adapter.awayPrototype.id;

  return prototypeId === input.miniMatch.state.context.teamA.id
    ? input.miniMatch.summary.finishingOpportunities.teamA
    : input.miniMatch.summary.finishingOpportunities.teamB;
}

function turnoversForTeam(input: {
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly side: "home" | "away";
}): number {
  const prototypeId = input.side === "home" ? input.adapter.homePrototype.id : input.adapter.awayPrototype.id;

  return prototypeId === input.miniMatch.state.context.teamA.id
    ? input.miniMatch.summary.turnovers.teamA
    : input.miniMatch.summary.turnovers.teamB;
}

function teamStatsForSide(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly score: ScoreState;
  readonly side: "home" | "away";
  readonly eventShare: Rating;
}): TeamMatchStats {
  const team = input.side === "home" ? input.matchInput.homeTeam : input.matchInput.awayTeam;
  const teamEvents = nonKickoffEvents(input.timeline).filter((event) => event.teamId === team.teamId);
  const progressionCount = teamEvents.filter((event) => event.eventType === "progression").length;
  const scoringEventCount = teamEvents.filter((event) => event.eventType === "scoring").length;
  const pressureInstabilityCount = teamEvents.filter(
    (event) =>
      hasTag(event, "stability_low") &&
      (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium")),
  ).length;

  return {
    teamId: team.teamId,
    score: input.side === "home" ? input.score.home : input.score.away,
    possessionShare: input.eventShare,
    turnovers: turnoversForTeam(input),
    scoringAttempts: scoringAttemptsForTeam(input),
    eventShare: input.eventShare,
    progressionCount,
    scoringEventCount,
    pressureInstabilityCount,
  };
}

export function createTeamMatchStatsFromEvents(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly score: ScoreState;
}): readonly TeamMatchStats[] {
  const events = nonKickoffEvents(input.timeline);
  const homeEventCount = events.filter((event) => event.teamId === input.matchInput.homeTeam.teamId).length;
  const homeEventShare = events.length === 0 ? 0 : clampRating((homeEventCount / events.length) * 100);
  const awayEventShare = clampRating(100 - homeEventShare);

  return [
    teamStatsForSide({ ...input, side: "home", eventShare: homeEventShare }),
    teamStatsForSide({ ...input, side: "away", eventShare: awayEventShare }),
  ];
}

export function createZoneStatsFromEvents(input: {
  readonly timeline: readonly MatchEvent[];
}): readonly ZoneStats[] {
  const eventsByZone = new Map<ZoneId, MatchEvent[]>();

  for (const event of nonKickoffEvents(input.timeline)) {
    const existingEvents = eventsByZone.get(event.zone) ?? [];
    existingEvents.push(event);
    eventsByZone.set(event.zone, existingEvents);
  }

  return [...eventsByZone.entries()]
    .sort(([zoneA], [zoneB]) => zoneA.localeCompare(zoneB))
    .map(([zone, events]) => ({
      zone,
      entries: events.length,
      successfulProgressions: events.filter(
        (event) =>
          event.eventType === "progression" &&
          (event.outcome === "success" || event.outcome === "advantage" || event.outcome === "score"),
      ).length,
      defensiveStops: events.filter(
        (event) =>
          event.eventType === "turnover" ||
          event.eventType === "defensive_action" ||
          event.outcome === "failure",
      ).length,
      scoringEvents: events.filter((event) => event.eventType === "scoring").length,
      pressureEvents: events.filter(
        (event) => hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"),
      ).length,
    }));
}
