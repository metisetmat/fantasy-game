import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoreSourceLabel } from "../../reports/scoreSourceLabel";
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

export function validateScoringGuard4J(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const cleanupFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official score derives only from official score_change.");
  assertTest(signature.officialScoringEventCountDelta === 0, "cleanup must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "cleanup must not create production scoring events.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_cleanup_score_mutation_count_0") ?? false, "cleanup score mutation count must be zero.");
  assertTest(scoreSourceLabel("full_match_report").canMutateScore === false, "score source labels must not change scoring logic.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "score source labels do not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4J();

  console.log("scoringGuard.4j tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

