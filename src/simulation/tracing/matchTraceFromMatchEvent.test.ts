import { MatchPhase, PressureLevel } from "../../models/match";
import type { MatchEvent } from "../../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { matchTraceFromMatchEvent } from "./matchTraceFromMatchEvent";
import { matchTraceCannotMutateOfficialState } from "./matchTraceEvent";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function eventWith(input: Partial<MatchEvent>): MatchEvent {
  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    ...input,
  };
}

export function validateMatchTraceFromMatchEvent(): readonly string[] {
  const baseEvent = engineToCoachPublicContractFixtures.eventFixture;
  const original = JSON.stringify(baseEvent);
  const trace = matchTraceFromMatchEvent({ event: baseEvent });
  const scoringTrace = matchTraceFromMatchEvent({
    event: eventWith({
      eventId: "event-scoring",
      eventType: "scoring",
      outcome: "score",
      consequences: [{ type: "score_change", description: "CONTROL scores.", value: 3 }],
      tags: ["scoring_event"],
    }),
  });
  const goalkeeperTrace = matchTraceFromMatchEvent({
    event: eventWith({
      eventId: "event-gk",
      eventType: "goalkeeper_action",
      outcome: "success",
      consequences: [],
      tags: ["goalkeeper_save"],
    }),
  });
  const turnoverTrace = matchTraceFromMatchEvent({
    event: eventWith({
      eventId: "event-turnover",
      eventType: "turnover",
      outcome: "failure",
      consequences: [{ type: "possession_change", description: "Possession lost." }],
      tags: ["pressure_high"],
    }),
  });
  const uncertainTrace = matchTraceFromMatchEvent({
    event: eventWith({
      eventId: "event-uncertain",
      phase: MatchPhase.InProgress,
      eventType: "discipline",
      outcome: "neutral",
      tacticalContext: {
        pressureLevel: PressureLevel.Low,
        ballZone: baseEvent.zone,
      },
      consequences: [],
      tags: [],
    }),
  });

  assertTest(trace.source === "official_match_event", "official event source must be preserved.");
  assertTest(trace.officialTruth, "official match trace must be officialTruth true.");
  assertTest(trace.teamId === baseEvent.teamId, "team must be preserved.");
  assertTest(trace.opponentTeamId === baseEvent.opponentTeamId, "opponent must be preserved.");
  assertTest(trace.zone === baseEvent.zone, "zone must be preserved.");
  assertTest(trace.minute === baseEvent.timestamp.minute, "minute must be preserved.");
  assertTest(scoringTrace.outcome === "SCORE_CREATED", "score_change event must become SCORE_CREATED.");
  assertTest(goalkeeperTrace.actionType === "GOALKEEPER_SAVE", "goalkeeper action must map to goalkeeper trace.");
  assertTest(goalkeeperTrace.outcome === "SAVE_MADE", "goalkeeper success must map to SAVE_MADE.");
  assertTest(turnoverTrace.impactTags.includes("possession_lost"), "turnover must map to possession lost impact.");
  assertTest(uncertainTrace.actionType === "UNKNOWN" || uncertainTrace.phase === "SET_PIECE", "uncertain event must fall back safely.");
  assertTest(JSON.stringify(baseEvent) === original, "adapter must not mutate original event.");
  assertTest(matchTraceCannotMutateOfficialState(trace), "official adapter cannot create scoring events or change score.");

  return [
    "official match event converts to trace with officialTruth true",
    "team, opponent, zone, and minute are preserved",
    "scoring, goalkeeper, turnover, and uncertain events map safely",
    "adapter does not mutate original event or create scoring effects",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceFromMatchEvent();

  console.log("matchTraceFromMatchEvent tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
