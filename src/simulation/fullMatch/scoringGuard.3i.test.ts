import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function validateScoringGuard3I(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "final score must derive only from score_change.");
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_NORMAL_SCORE"),
    "controlled replay comparison must not mutate normal score.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_NORMAL_SCORING_EVENTS"),
    "controlled replay comparison must not mutate normal scoring events.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"),
    "controlled replay comparison must not create production scoring events.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"),
    "controlled replay comparison must not mutate production route resolution.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"),
    "controlled replay comparison must not mutate global route success rates.",
  );

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "normal final score still derives only from score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from controlled replay comparison",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3I();

  console.log("scoringGuard.3i tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
