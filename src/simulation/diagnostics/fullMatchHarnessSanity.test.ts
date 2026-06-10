import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { MatchPhase, PressureLevel } from "../../models/match";
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { analyzeFullMatchHarnessSanity } from "./fullMatchHarnessSanity";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const testZone = "Z3-C" as ZoneId;

function scoringEvent(index: number, points: number, teamId = engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId): MatchEvent {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;

  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `synthetic-score-${index}`,
    timestamp: {
      tick: index,
      minute: index,
      period: index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `synthetic-sequence-${index}`,
    teamId,
    opponentTeamId: teamId === input.homeTeam.teamId ? input.awayTeam.teamId : input.homeTeam.teamId,
    eventType: "scoring",
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: testZone,
      targetZone: testZone,
      moveType: "synthetic_score",
      reason: "Synthetic scoring event used only for harness sanity guard tests.",
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: `Synthetic score ${index}.`,
        value: points,
      },
    ],
    tags: ["synthetic_test", "scoring_event", "scoring_type_SHOT_GOAL"],
    narrativeWeight: 80,
  };
}

function pressureEvent(index: number): MatchEvent {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;

  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `synthetic-pressure-${index}`,
    timestamp: {
      tick: index,
      minute: index,
      period: index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `synthetic-pressure-sequence-${index}`,
    teamId: input.awayTeam.teamId,
    opponentTeamId: input.homeTeam.teamId,
    eventType: "progression",
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.High,
      ballZone: testZone,
      targetZone: testZone,
      moveType: "synthetic_pressure",
      reason: "Synthetic dominated-team pressure event used only for harness sanity guard tests.",
    },
    outcome: "neutral",
    consequences: [],
    tags: ["synthetic_test", "pressure_high", "danger_high", "territorial_pressure_high"],
    narrativeWeight: 75,
  };
}

function syntheticHighScoreReport(): MatchReport {
  const scoringEvents = Array.from({ length: 11 }, (_, index) => scoringEvent(index + 1, 5));
  const pressureEvents = Array.from({ length: 3 }, (_, index) => pressureEvent(index + 20));

  return {
    ...engineToCoachPublicContractFixtures.matchReportFixture,
    score: { home: 55, away: 0 },
    timeline: [...scoringEvents, ...pressureEvents],
    keyMoments: scoringEvents.slice(0, 5).map((event) => ({
      eventId: event.eventId,
      title: "Scoring breakthrough",
      summary: "Synthetic scoring moment.",
      minute: event.timestamp.minute,
    })),
    fatigueReport: {
      teamSummaries: [
        {
          teamId: engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId,
          averageConditionEnd: 96,
          highIntensityLoad: 50,
          lateErrorCount: 0,
        },
        {
          teamId: engineToCoachPublicContractFixtures.matchInputFixture.awayTeam.teamId,
          averageConditionEnd: 90,
          highIntensityLoad: 90,
          lateErrorCount: 0,
        },
      ],
      playerSummaries: [
        {
          playerId: "synthetic-player",
          conditionStart: 96,
          conditionEnd: 96,
          mentalFreshnessEnd: 96,
        },
      ],
    },
  };
}

export function validateFullMatchHarnessSanity(): readonly string[] {
  const report = syntheticHighScoreReport();
  const beforeTimelineSignature = JSON.stringify(report.timeline);
  const sanity = analyzeFullMatchHarnessSanity(report);
  const afterTimelineSignature = JSON.stringify(report.timeline);

  assertGuard(sanity.scope === "FULL_MATCH_HARNESS_SINGLE_RUN", "sanity report must use full-match harness single-run scope.");
  assertGuard(sanity.warnings.includes("INFLATED_SINGLE_RUN_SCORE"), "high synthetic score must emit INFLATED_SINGLE_RUN_SCORE.");
  assertGuard(sanity.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"), "single-team scoring stream must emit ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN.");
  assertGuard(sanity.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "zero-scoring team must emit ZERO_SCORING_EVENTS_FOR_ONE_TEAM.");
  assertGuard(sanity.warnings.includes("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"), "high scoring event count must emit HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM.");
  assertGuard(sanity.scoringDominance.mayInvalidateGlobalScoringEconomy === false, "dominance report must stay warning-only.");
  assertGuard(sanity.warnings.includes("REPETITIVE_KEY_MOMENTS"), "mostly scoring key moments must emit REPETITIVE_KEY_MOMENTS.");
  assertGuard(sanity.warnings.includes("FLAT_FATIGUE_SIGNAL"), "unchanged condition must emit FLAT_FATIGUE_SIGNAL.");
  assertGuard(sanity.mayInvalidateGlobalScoringEconomy === false, "sanity report must never invalidate global scoring economy.");
  assertGuard(beforeTimelineSignature === afterTimelineSignature, "sanity analysis must not remove or mutate scoring events.");

  return [
    "high score creates INFLATED_SINGLE_RUN_SCORE",
    "one-team scoring dominance creates warning",
    "zero scoring team creates warning",
    "high single-team scoring event count creates warning",
    "repetitive scoring moments create REPETITIVE_KEY_MOMENTS",
    "flat fatigue creates FLAT_FATIGUE_SIGNAL",
    "sanity report can never invalidate global scoring economy",
    "sanity analysis does not remove or change scoring events",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchHarnessSanity();

  console.log("full-match harness sanity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
