import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { MatchPhase, PressureLevel } from "../../models/match";
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { analyzeFullMatchScoringDominance } from "./fullMatchScoringDominanceDiagnostics";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const testZone = "Z3-C" as ZoneId;

function event(input: {
  readonly index: number;
  readonly teamId: string;
  readonly opponentTeamId: string;
  readonly eventType: MatchEvent["eventType"];
  readonly points: number;
  readonly tags: readonly string[];
}): MatchEvent {
  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `dominance-test-segment-${Math.ceil(input.index / 3)}-${input.index}`,
    timestamp: {
      tick: input.index,
      minute: input.index,
      period: input.index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `dominance-test-sequence-${input.index}`,
    teamId: input.teamId,
    opponentTeamId: input.opponentTeamId,
    eventType: input.eventType,
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.High,
      ballZone: testZone,
      targetZone: testZone,
      moveType: input.eventType,
      reason: "Synthetic dominance diagnostic test event.",
    },
    outcome: input.points > 0 ? "score" : "neutral",
    consequences: input.points > 0
      ? [
          {
            type: "score_change",
            description: "Synthetic score.",
            value: input.points,
          },
        ]
      : [],
    tags: input.tags,
    narrativeWeight: 80,
  };
}

function dominanceReport(): MatchReport {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const controlScores = Array.from({ length: 12 }, (_, index) =>
    event({
      index: index + 1,
      teamId: input.homeTeam.teamId,
      opponentTeamId: input.awayTeam.teamId,
      eventType: "scoring",
      points: 3,
      tags: ["scoring_event", "scoring_type_SHOT_GOAL"],
    }),
  );
  const blitzSignals = Array.from({ length: 4 }, (_, index) =>
    event({
      index: index + 20,
      teamId: input.awayTeam.teamId,
      opponentTeamId: input.homeTeam.teamId,
      eventType: "progression",
      points: 0,
      tags: ["pressure_high", "danger_high", "territorial_pressure_high"],
    }),
  );

  return {
    ...engineToCoachPublicContractFixtures.matchReportFixture,
    score: { home: 36, away: 0 },
    timeline: [...controlScores, ...blitzSignals],
    teamStats: [
      {
        teamId: input.homeTeam.teamId,
        score: 36,
      },
      {
        teamId: input.awayTeam.teamId,
        score: 0,
      },
    ],
    fatigueReport: {
      teamSummaries: [
        {
          teamId: input.homeTeam.teamId,
          averageConditionEnd: 86,
          highIntensityLoad: 78,
          lateErrorCount: 0,
        },
        {
          teamId: input.awayTeam.teamId,
          averageConditionEnd: 80,
          highIntensityLoad: 91,
          lateErrorCount: 0,
        },
      ],
      playerSummaries: [],
    },
  };
}

export function validateFullMatchScoringDominanceDiagnostics(): readonly string[] {
  const report = dominanceReport();
  const beforeTimelineSignature = JSON.stringify(report.timeline);
  const dominance = analyzeFullMatchScoringDominance(report);
  const afterTimelineSignature = JSON.stringify(report.timeline);

  assertGuard(dominance.scope === "FULL_MATCH_HARNESS_SINGLE_RUN", "dominance scope must be single-run harness.");
  assertGuard(dominance.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"), "one-team dominance warning must be emitted.");
  assertGuard(dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "zero scoring team warning must be emitted.");
  assertGuard(dominance.warnings.includes("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"), "high scoring event count warning must be emitted.");
  assertGuard(dominance.warnings.includes("DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE"), "dominated danger without score must be detected.");
  assertGuard(dominance.warnings.includes("DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION"), "dominated pressure without conversion must be detected.");
  assertGuard(dominance.mayInvalidateGlobalScoringEconomy === false, "dominance diagnostics must not invalidate global economy.");
  assertGuard(!dominance.recommendedNextActions.join(" ").includes("change scoring values"), "dominance diagnostics must not recommend scoring value changes.");
  assertGuard(beforeTimelineSignature === afterTimelineSignature, "dominance diagnostics must not mutate scoring events.");

  return [
    "51-0 style report emits one-team scoring dominance warning",
    "zero scoring team emits warning",
    "dominance report cannot invalidate global economy",
    "dominance report does not recommend scoring value changes",
    "dominated-team pressure/danger without conversion is detected",
    "scoring events are preserved",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchScoringDominanceDiagnostics();

  console.log("full-match scoring dominance diagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
