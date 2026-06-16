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

export function validateScoringGuard4S(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(experimentalReport);
  const comparisonFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_PLAYER_CANDIDATE_COMPARISON_VIEW"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "player candidate comparison layer must not change score.");
  assertTest(signature.officialScoringEventCountDelta === 0, "player candidate comparison layer must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "player candidate comparison layer must not create production scoring events.");
  assertTest(comparisonFact?.internalTags.includes("player_candidate_comparison_score_mutation_count_0") ?? false, "comparison view score mutation count must be zero.");
  assertTest(comparisonFact?.internalTags.includes("player_candidate_comparison_production_scoring_event_creation_count_0") ?? false, "comparison view production scoring event creation count must be zero.");
  assertTest(comparisonFact?.internalTags.includes("player_candidate_comparison_player_selected_count_0") ?? false, "comparison view player selected count must be zero.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "player candidate comparison layer does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4S();

  console.log("scoringGuard.4s tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
