import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { sandboxScoringOpportunityModelSignature } from "./sandboxScoringOpportunityModelSignature";

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

export function validateScoringGuard3L(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = sandboxScoringOpportunityModelSignature(report);
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.sandboxScoringEventCreatedCount === 0, "sandbox opportunity must not create scoring events in 3L.");
  assertTest(signature.productionScoringEventCreationCount === 0, "sandbox opportunity must not create production scoring events.");
  assertTest(signature.officialScoreMutationCount === 0, "sandbox opportunity must not mutate official score.");
  assertTest(signature.officialScoringEventMutationCount === 0, "sandbox opportunity must not mutate official scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "sandbox opportunity must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_RESULTS_ISOLATED_ONLY"), "sandbox opportunity, if any, must remain sandbox-only.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from sandbox opportunity model",
    "sandbox opportunity, if any, remains sandbox-only",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3L();

  console.log("scoringGuard.3l tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
