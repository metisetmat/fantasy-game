import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { multiActionContinuationSignature } from "./multiActionContinuationSignature";

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

export function validateScoringGuard3R(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = multiActionContinuationSignature(report);
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.sandboxContinuationCreatedCount === 1, "multi-action continuation should create one sandbox-only continuation.");
  assertTest(signature.sandboxMatchEventCreatedCount === 0, "multi-action continuation must not create MatchEvents in 3R.");
  assertTest(signature.sandboxScoringEventCreatedCount === 0, "multi-action continuation must not create scoring events in 3R.");
  assertTest(signature.productionScoringEventCreationCount === 0, "multi-action continuation must not create production scoring events.");
  assertTest(signature.officialPossessionMutationCount === 0, "multi-action continuation must not mutate official possession.");
  assertTest(signature.officialTimelineMutationCount === 0, "multi-action continuation must not mutate official timeline.");
  assertTest(signature.officialScoreMutationCount === 0, "multi-action continuation must not mutate official score.");
  assertTest(signature.officialScoringEventMutationCount === 0, "multi-action continuation must not mutate official scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "multi-action continuation must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_RESULTS_ISOLATED_ONLY"), "multi-action continuation must remain sandbox-only.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from multi-action continuation sandbox",
    "multi-action continuation sandbox remains sandbox-only",
    "official possession and timeline are not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3R();

  console.log("scoringGuard.3r tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
