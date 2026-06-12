import type { MatchEvent } from "../../contracts/engineToCoach";
import { MatchPhase, PressureLevel } from "../../models/match";
import { createOfficialTimelineSnapshot } from "./createOfficialTimelineSnapshot";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const scoringEvent: MatchEvent = {
  eventId: "event-1",
  matchId: "match-1",
  timestamp: { tick: 1, minute: 12, period: "first_half" },
  phase: MatchPhase.InProgress,
  sequenceId: "sequence-1",
  teamId: "control",
  opponentTeamId: "blitz",
  eventType: "scoring",
  zone: "Z4-C",
  tacticalContext: {
    pressureLevel: PressureLevel.Medium,
    ballZone: "Z4-C",
  },
  fatigueContext: {
    teamCondition: 91,
  },
  outcome: "score",
  consequences: [{ type: "score_change", description: "goal", value: 3 }],
  tags: [],
  narrativeWeight: 80,
};

export function validateCreateOfficialTimelineSnapshot(): readonly string[] {
  const snapshot = createOfficialTimelineSnapshot({
    timeline: [scoringEvent],
    score: { home: 3, away: 0 },
    homeTeamId: "control",
    awayTeamId: "blitz",
  });

  assertTest(snapshot.eventCount === 1, "snapshot event count must match timeline length.");
  assertTest(snapshot.scoringEventCount === 1, "snapshot scoring event count must match official scoring events.");
  assertTest(snapshot.scoreTotal === 3, "snapshot score total must be derived from official score.");
  assertTest(snapshot.scoreDisplay === "control 3 - 0 blitz", "snapshot score display must include both teams.");
  assertTest(snapshot.possessionTeamId === "control", "snapshot possession team must follow the official event team.");
  assertTest(snapshot.eventSignature.includes("scoreConsequences=3"), "snapshot signature must include score consequence total.");

  return [
    "official snapshot counts official events",
    "official snapshot counts official scoring events",
    "official snapshot preserves score and possession metadata",
  ];
}

if (require.main === module) {
  const checks = validateCreateOfficialTimelineSnapshot();

  console.log("createOfficialTimelineSnapshot tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
