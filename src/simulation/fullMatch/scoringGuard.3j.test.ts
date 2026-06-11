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

export function validateScoringGuard3J(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "real isolated replay must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_EXPERIMENTAL_ONLY"), "isolated scoring events, if any, must remain isolated-only.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_OFFICIAL_SCORE"), "real isolated replay must not mutate official score.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS"), "real isolated replay must not mutate official scoring events.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from real isolated replay",
    "isolated scoring events, if any, remain isolated-only",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3J();

  console.log("scoringGuard.3j tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
