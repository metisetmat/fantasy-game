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

export function validateScoringGuard4I(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const hierarchyFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official score derives only from official score_change.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "hierarchy must not delete, cap, rewrite, or fabricate official timeline events.");
  assertTest(signature.officialScoringEventCountDelta === 0, "hierarchy must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.officialScoreDelta === 0, "hierarchy must not mutate official score.");
  assertTest(signature.productionScoringEventCreationCount === 0, "hierarchy must not create production scoring events.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_information_hierarchy_score_mutation_count_0") ?? false, "hierarchy score mutation count must be zero.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_information_hierarchy_production_scoring_event_creation_count_0") ?? false, "hierarchy production scoring event creation count must be zero.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4I();

  console.log("scoringGuard.4i tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
