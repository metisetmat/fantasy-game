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

export function validateScoringGuard4R(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(experimentalReport);
  const rosterCoverageFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_ROSTER_COVERAGE_MATCHUP"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "roster coverage matchup layer must not change score.");
  assertTest(signature.officialScoringEventCountDelta === 0, "roster coverage matchup layer must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "roster coverage matchup layer must not create production scoring events.");
  assertTest(rosterCoverageFact?.internalTags.includes("roster_coverage_score_mutation_count_0") ?? false, "roster coverage score mutation count must be zero.");
  assertTest(rosterCoverageFact?.internalTags.includes("roster_coverage_production_scoring_event_creation_count_0") ?? false, "roster coverage production scoring event creation count must be zero.");
  assertTest(rosterCoverageFact?.internalTags.includes("roster_coverage_player_selected_count_0") ?? false, "roster coverage player selected count must be zero.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "roster coverage matchup layer does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4R();

  console.log("scoringGuard.4r tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
