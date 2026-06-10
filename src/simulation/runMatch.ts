import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import { runMiniMatch } from "./miniMatch";
import { adaptMatchInputToMiniMatch } from "./adapters/matchInputToMiniMatch";
import {
  buildMatchReport,
  primaryReportZone,
  scoreFromMiniMatch,
  timelineFromMiniMatch,
} from "./adapters/matchReportBuilder";
import {
  createTacticalPlanInfluence,
  primaryZoneFromPlanInfluence,
  sequenceCountFromPlanInfluence,
} from "./adapters/tacticalPlanInfluence";

const DEFAULT_ADAPTER_SEQUENCE_COUNT = 6;

export function runMatch(input: MatchInput): MatchReport {
  const adapter = adaptMatchInputToMiniMatch(input);
  const influence = createTacticalPlanInfluence(input);
  const numberOfSequences = sequenceCountFromPlanInfluence({
    baseSequenceCount: DEFAULT_ADAPTER_SEQUENCE_COUNT,
    influence,
  });
  const miniMatch = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences,
  });
  const zone = primaryZoneFromPlanInfluence({
    influence,
    fallbackZone: primaryReportZone(input),
  });
  const timeline = timelineFromMiniMatch({
    matchInput: input,
    miniMatch,
    adapter,
    zone,
    influence,
  });
  const score = scoreFromMiniMatch({ miniMatch, adapter });

  return buildMatchReport({
    matchInput: input,
    timeline,
    miniMatch,
    adapter,
    score,
    influence,
  });
}

export function createMatchReportSignature(report: MatchReport): string {
  const source = {
    matchId: report.matchId,
    score: report.score,
    timeline: report.timeline.map((event) => ({
      eventId: event.eventId,
      matchId: event.matchId,
      teamId: event.teamId,
      eventType: event.eventType,
      outcome: event.outcome,
      consequences: event.consequences,
    })),
    teamStats: report.teamStats,
    playerStats: report.playerStats,
    zoneStats: report.zoneStats,
    fatigueReport: report.fatigueReport,
    tacticalReport: report.tacticalReport,
    keyMoments: report.keyMoments,
    coachInsights: report.coachInsights,
    suggestedFocus: report.suggestedFocus,
  };

  return JSON.stringify(source);
}
