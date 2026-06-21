import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "../../reports/coachReportMultiMatchPhaseComparisonTestUtils";
import { scoringRegistryEntry } from "../../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5H(): readonly string[] {
  const model = buildCoachReportMultiMatchPhaseComparisonTestContext().realSQLiteReadOnlyIOSmokeTest;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(model.realDatabaseWriteCount === 0, "real SQLite smoke test must not write.");
  assertTest(model.defaultRealDatabaseReadCount === 0, "default product mode must not read SQLite.");
  assertTest(model.controlledRealDatabaseReadCount > 0, "controlled smoke test must read SQLite.");
  assertTest(model.activeProductHistorySource === "file_backed", "active product source must stay file_backed.");
  assertTest(!model.databaseUsedAsProductTruth, "SQLite must not become product truth.");
  assertTest(!model.canCreateProductionScoringEvents, "SQLite smoke test cannot create production scoring events.");
  assertTest(model.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY remains only global economy proof.");

  return [
    "scoring constants remain unchanged",
    "PENALTY_SHOT remains inactive",
    "SQLite smoke test has no writes and cannot create scoring events",
    "batch/live separation and global economy proof boundary remain preserved",
  ];
}

const checks = validateScoringGuard5H();

console.log("scoringGuard.5h tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
