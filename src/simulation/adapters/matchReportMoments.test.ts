import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import type { MatchEvent } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { MatchPhase, PressureLevel } from "../../models/match";
import { runFullMatch } from "../runFullMatch";
import { selectKeyMoments } from "./matchReportMoments";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringOnlyEvent(index: number): MatchEvent {
  const zone = "Z3-C" as ZoneId;

  return {
    eventId: `scoring-only-${index}`,
    matchId: engineToCoachPublicContractFixtures.matchInputFixture.matchId,
    timestamp: {
      tick: index,
      minute: index,
      period: "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `scoring-only-sequence-${index}`,
    teamId: engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId,
    opponentTeamId: engineToCoachPublicContractFixtures.matchInputFixture.awayTeam.teamId,
    eventType: "scoring",
    zone,
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: zone,
      targetZone: zone,
      moveType: "shot_goal",
      reason: "scoring-only regression fixture",
    },
    fatigueContext: {
      teamCondition: 90,
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: "scoring-only fixture score",
        value: 3,
      },
    ],
    tags: ["scoring_event"],
    narrativeWeight: 100,
  };
}

export function validateMatchReportMomentDiversity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;
  const hasNonScoringCandidates = report.timeline.some((event) => event.eventType !== "kickoff" && event.eventType !== "scoring" && event.narrativeWeight >= 60);
  const uniqueTitles = new Set(report.keyMoments.map((moment) => moment.title));

  assertTest(report.keyMoments.length <= 5, "key moments must remain capped at 5.");

  if (hasNonScoringCandidates) {
    assertTest(scoringMoments <= 2, "key moments include non-scoring moments when available.");
  }

  if (report.keyMoments.length > 1) {
    assertTest(uniqueTitles.size >= 2, "key moments include at least two different titles when possible.");
  }

  const scoringOnlyMoments = selectKeyMoments({
    matchInput: engineToCoachPublicContractFixtures.matchInputFixture,
    timeline: [1, 2, 3, 4, 5].map(scoringOnlyEvent),
    facts: [],
    coachInsights: [],
  });

  assertTest(scoringOnlyMoments.length === 5, `scoring-only reports should fill the key moment cap, received ${scoringOnlyMoments.length}.`);
  assertTest(
    scoringOnlyMoments.every((moment) => moment.title === "Action décisive"),
    "scoring-only reports keep repeated scoring titles when no title alternatives exist.",
  );

  return [
    "key moments include non-scoring moments when available",
    "max 2 scoring moments when alternatives exist",
    "key moments include diverse titles",
    "scoring-only key moments fill the cap when no title alternatives exist",
  ];
}

if (require.main === module) {
  const checks = validateMatchReportMomentDiversity();

  console.log("matchReportMoments tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
