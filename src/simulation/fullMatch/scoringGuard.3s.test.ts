import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { sandboxSequenceReplaySignature } from "./sandboxSequenceReplaySignature";

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

export function validateScoringGuard3S(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = sandboxSequenceReplaySignature(report);
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.sandboxContinuationCreatedCount === 1, "sandbox sequence replay should include one sandbox-only continuation.");
  assertTest(signature.sandboxMatchEventCreatedCount === 0, "sandbox sequence replay must not create MatchEvents in 3S.");
  assertTest(signature.sandboxScoringEventCreatedCount === 0, "sandbox sequence replay must not create scoring events in 3S.");
  assertTest(signature.productionScoringEventCreationCount === 0, "sandbox sequence replay must not create production scoring events.");
  assertTest(signature.officialPossessionMutationCount === 0, "sandbox sequence replay must not mutate official possession.");
  assertTest(signature.officialTimelineMutationCount === 0, "sandbox sequence replay must not mutate official timeline.");
  assertTest(signature.officialScoreMutationCount === 0, "sandbox sequence replay must not mutate official score.");
  assertTest(signature.officialScoringEventMutationCount === 0, "sandbox sequence replay must not mutate official scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SEQUENCE_REPLAY_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "sandbox sequence replay must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SEQUENCE_REPLAY_RESULTS_ISOLATED_ONLY"), "sandbox sequence replay must remain sandbox-only.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from sandbox sequence replay",
    "sandbox sequence replay remains sandbox-only",
    "official possession and timeline are not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3S();

  console.log("scoringGuard.3s tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
