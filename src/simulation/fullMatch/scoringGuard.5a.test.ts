import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { runFullMatchTraceValidationModel } from "../validation/fullMatchTraceValidationComparisons";

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

export function validateScoringGuard5A(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const validationModel = runFullMatchTraceValidationModel();
  const persistentFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_PERSISTENT_HISTORY_ADAPTER"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "persistent history adapter must not change score.");
  assertTest(persistentFact?.internalTags.includes("coach_report_persistent_history_score_mutation_count_0") ?? false, "persistent history adapter score mutation count tag must be zero.");
  assertTest(persistentFact?.internalTags.includes("coach_report_persistent_history_production_scoring_event_creation_count_0") ?? false, "persistent history adapter production scoring event creation count tag must be zero.");
  assertTest(persistentFact?.internalTags.includes("coach_report_persistent_history_no_automatic_selection_true") ?? false, "persistent history adapter no automatic selection tag must be present.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "persistent history adapter does not change score",
    "no production scoring events are created or rewritten",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "persistent history adapter does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5A();
  console.log("scoringGuard.5a tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
