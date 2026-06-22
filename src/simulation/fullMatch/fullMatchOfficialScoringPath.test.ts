import assert from "node:assert/strict";
import { test } from "node:test";
import type { MatchEvent } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import { MatchPhase, PressureLevel } from "../../models/match";
import {
  createFullMatchOfficialScoringPathState,
  resolveFullMatchOfficialScoringEventsForSegment,
} from "./fullMatchOfficialScoringPath";

function scoringEvent(input: {
  readonly eventId: string;
  readonly family: OfficialScoringFamily;
  readonly points: number;
}): MatchEvent {
  return {
    eventId: input.eventId,
    matchId: "match-official-scoring-path-test",
    timestamp: {
      tick: 1,
      minute: 1,
      period: "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: "sequence-official-scoring-path-test",
    teamId: "CONTROL",
    opponentTeamId: "BLITZ",
    eventType: "scoring",
    zone: "Z6-C",
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: "Z6-C",
      reason: "Test scoring opportunity.",
    },
    fatigueContext: {
      teamCondition: 85,
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: `${input.family} score_change`,
        value: input.points,
      },
    ],
    scoringFamily: input.family,
    scoringAction: input.family,
    scoringPointValue: input.points,
    tags: [input.family],
    narrativeWeight: 80,
  };
}

test("rejects conversion score_change when its segment try was not accepted", () => {
  const state = createFullMatchOfficialScoringPathState();

  const firstSegment = resolveFullMatchOfficialScoringEventsForSegment({
    state,
    segmentLabel: "segment-1",
    segmentIndex: 1,
    events: [
      scoringEvent({ eventId: "try-1", family: "TRY_TOUCHDOWN", points: 5 }),
      scoringEvent({ eventId: "conversion-1", family: "CONVERSION_GOAL", points: 2 }),
    ],
  });

  const secondSegment = resolveFullMatchOfficialScoringEventsForSegment({
    state: firstSegment.state,
    segmentLabel: "segment-2",
    segmentIndex: 2,
    events: [
      scoringEvent({ eventId: "try-2", family: "TRY_TOUCHDOWN", points: 5 }),
      scoringEvent({ eventId: "conversion-2", family: "CONVERSION_GOAL", points: 2 }),
    ],
  });

  const thirdSegment = resolveFullMatchOfficialScoringEventsForSegment({
    state: secondSegment.state,
    segmentLabel: "segment-3",
    segmentIndex: 3,
    events: [
      scoringEvent({ eventId: "try-3", family: "TRY_TOUCHDOWN", points: 5 }),
      scoringEvent({ eventId: "conversion-3", family: "CONVERSION_GOAL", points: 2 }),
    ],
  });

  const rejectedTry = thirdSegment.decisions.find((decision) => decision.eventId === "try-3");
  const rejectedConversion = thirdSegment.decisions.find((decision) => decision.eventId === "conversion-3");
  const conversionEvent = thirdSegment.events.find((event) => event.eventId === "conversion-3");

  assert.equal(rejectedTry?.accepted, false);
  assert.equal(rejectedConversion?.accepted, false);
  assert.equal(thirdSegment.state.acceptedByFamily.CONVERSION_GOAL, 2);
  assert.equal(
    conversionEvent?.consequences.some((consequence) => consequence.type === "score_change"),
    false,
  );
});
