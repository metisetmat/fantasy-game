import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { runFullMatchTraceValidationModel } from "../validation/fullMatchTraceValidationComparisons";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

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

export function validateScoringGuard4L(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(report);
  const coachCopyFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === report.score.home + report.score.away, "official score derives only from official score_change.");
  assertTest(signature.officialScoringEventCountDelta === 0, "coach copy must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "coach copy must not create production scoring events.");
  assertTest(coachCopyFact?.internalTags.includes("selection_preview_coach_copy_score_mutation_count_0") ?? false, "coach copy score mutation count must be zero.");
  assertTest(coachCopyFact?.internalTags.includes("selection_preview_coach_copy_confidence_upgrade_count_0") ?? false, "coach copy confidence upgrade count must be zero.");
  assertTest(coachCopyFact?.internalTags.includes("selection_preview_coach_copy_preview_non_applied") ?? false, "coach copy preview must remain non-applied.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "coach copy does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4L();

  console.log("scoringGuard.4l tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
