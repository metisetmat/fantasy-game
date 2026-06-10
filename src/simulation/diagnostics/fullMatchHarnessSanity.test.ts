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

function scoringEvent(index: number, points: number): MatchEvent {
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
    tags: ["synthetic_test", "scoring_event"],
    narrativeWeight: 80,
  };
}

function syntheticHighScoreReport(): MatchReport {
  const scoringEvents = Array.from({ length: 8 }, (_, index) => scoringEvent(index + 1, 5));

  return {
    ...engineToCoachPublicContractFixtures.matchReportFixture,
    score: { home: 40, away: 0 },
    timeline: scoringEvents,
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
  assertGuard(sanity.warnings.includes("REPETITIVE_KEY_MOMENTS"), "mostly scoring key moments must emit REPETITIVE_KEY_MOMENTS.");
  assertGuard(sanity.warnings.includes("FLAT_FATIGUE_SIGNAL"), "unchanged condition must emit FLAT_FATIGUE_SIGNAL.");
  assertGuard(sanity.mayInvalidateGlobalScoringEconomy === false, "sanity report must never invalidate global scoring economy.");
  assertGuard(beforeTimelineSignature === afterTimelineSignature, "sanity analysis must not remove or mutate scoring events.");

  return [
    "high score creates INFLATED_SINGLE_RUN_SCORE",
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
