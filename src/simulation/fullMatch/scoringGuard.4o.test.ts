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

export function validateScoringGuard4O(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(experimentalReport);
  const polishFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "polish layer must not change score.");
  assertTest(signature.officialScoringEventCountDelta === 0, "polish layer must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "polish layer must not create production scoring events.");
  assertTest(polishFact?.internalTags.includes("coach_product_report_score_mutation_count_0") ?? false, "polish score mutation count must be zero.");
  assertTest(polishFact?.internalTags.includes("coach_product_report_production_scoring_event_creation_count_0") ?? false, "polish production scoring event creation count must be zero.");
  assertTest(polishFact?.internalTags.includes("coach_product_report_confidence_upgrade_count_0") ?? false, "polish confidence upgrade count must be zero.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "polish layer does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4O();

  console.log("scoringGuard.4o tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
