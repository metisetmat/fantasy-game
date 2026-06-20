import {
  coachReportDatabaseAdapterSpikeCannotDriveSelection,
  coachReportDatabaseAdapterSpikeCannotMutateOfficialState,
} from "./coachReportDatabaseAdapterSpike";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpikeGuard(): readonly string[] {
  const { databaseAdapterSpike } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportDatabaseAdapterSpikeCannotDriveSelection(databaseAdapterSpike), "database adapter spike cannot drive selection.");
  assertTest(coachReportDatabaseAdapterSpikeCannotMutateOfficialState(databaseAdapterSpike), "database adapter spike cannot mutate official state.");
  assertTest(databaseAdapterSpike.lineupMutationCount === 0, "lineup mutation count is 0.");
  assertTest(databaseAdapterSpike.startersMutationCount === 0, "starters mutation count is 0.");
  assertTest(databaseAdapterSpike.benchMutationCount === 0, "bench mutation count is 0.");
  assertTest(databaseAdapterSpike.scoreMutationCount === 0, "score mutation count is 0.");
  assertTest(databaseAdapterSpike.possessionMutationCount === 0, "possession mutation count is 0.");
  assertTest(databaseAdapterSpike.productionScoringEventCreationCount === 0, "production scoring event creation count is 0.");

  return [
    "database adapter spike cannot drive selection",
    "database adapter spike cannot mutate official state",
    "lineup, score, possession, and scoring-event mutation counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpikeGuard();
  console.log("coachReportDatabaseAdapterSpikeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
