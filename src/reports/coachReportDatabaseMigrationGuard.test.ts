import {
  coachReportDatabaseMigrationPreparationCannotDriveSelection,
  coachReportDatabaseMigrationPreparationCannotMutateOfficialState,
} from "./coachReportDatabaseMigrationPreparation";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseMigrationGuard(): readonly string[] {
  const { databaseMigrationPreparation } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportDatabaseMigrationPreparationCannotDriveSelection(databaseMigrationPreparation), "migration preparation cannot change lineup/starters/bench or select players.");
  assertTest(coachReportDatabaseMigrationPreparationCannotMutateOfficialState(databaseMigrationPreparation), "migration preparation cannot mutate official state.");
  assertTest(databaseMigrationPreparation.liveSelectionDriverCount === 0, "cannot drive live selection.");
  assertTest(databaseMigrationPreparation.productionRouteResolutionDriverCount === 0, "cannot drive production route resolution.");
  assertTest(databaseMigrationPreparation.confidenceUpgradeCount === 0, "cannot upgrade confidence.");
  assertTest(databaseMigrationPreparation.globalEconomyClaimCount === 0, "cannot claim global economy.");

  return [
    "migration preparation cannot change lineup, starters, or bench",
    "cannot drive coach instruction, live selection, or production route resolution",
    "cannot mutate official timeline, score, possession, or scoring events",
    "cannot claim global economy",
    "cannot upgrade confidence",
    "cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationGuard();
  console.log("coachReportDatabaseMigrationGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
