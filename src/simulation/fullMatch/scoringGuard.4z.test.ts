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

export function validateScoringGuard4Z(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const validationModel = runFullMatchTraceValidationModel();
  const historyFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_REAL_MATCH_HISTORY_STORE"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "real history store must not change score.");
  assertTest(historyFact?.internalTags.includes("coach_report_real_match_history_score_mutation_count_0") ?? false, "real history store score mutation count tag must be zero.");
  assertTest(historyFact?.internalTags.includes("coach_report_real_match_history_production_scoring_event_creation_count_0") ?? false, "real history store production scoring event creation count tag must be zero.");
  assertTest(historyFact?.internalTags.includes("coach_report_real_match_history_no_automatic_selection_true") ?? false, "real history store no automatic selection tag must be present.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "real match history store does not change score",
    "no production scoring events are created or rewritten",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "real match history store does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4Z();
  console.log("scoringGuard.4z tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
