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

export function validateScoringGuard4M(): readonly string[] {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const validationModel = runFullMatchTraceValidationModel();
  const signature = officialTimelineDiffViewSignature(experimentalReport);
  const profileViewFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official score derives only from official score_change.");
  assertTest(defaultReport.score.home === experimentalReport.score.home && defaultReport.score.away === experimentalReport.score.away, "profile view layer must not change score.");
  assertTest(signature.officialScoringEventCountDelta === 0, "profile view must not delete, cap, rewrite, or fabricate production scoring events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "profile view must not create production scoring events.");
  assertTest(profileViewFact?.internalTags.includes("selection_preview_profile_score_mutation_count_0") ?? false, "profile view score mutation count must be zero.");
  assertTest(profileViewFact?.internalTags.includes("selection_preview_profile_production_scoring_event_creation_count_0") ?? false, "profile view production scoring event creation count must be zero.");
  assertTest(profileViewFact?.internalTags.includes("selection_preview_profile_confidence_upgrade_count_0") ?? false, "profile view confidence upgrade count must be zero.");
  assertTest(profileViewFact?.internalTags.includes("selection_preview_profile_preview_non_applied") ?? false, "profile view preview must remain non-applied.");
  assertTest(validationModel.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(validationModel.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global scoring-economy proof.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "profile view layer does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4M();

  console.log("scoringGuard.4m tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
