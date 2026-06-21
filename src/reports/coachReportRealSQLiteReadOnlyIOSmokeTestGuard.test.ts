import {
  coachReportRealSQLiteReadOnlyIOSmokeTestCannotDriveSelection,
  coachReportRealSQLiteReadOnlyIOSmokeTestCannotMutateOfficialState,
} from "./coachReportRealSQLiteReadOnlyIOSmokeTest";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealSQLiteReadOnlyIOSmokeTestGuard(): readonly string[] {
  const model = buildCoachReportMultiMatchPhaseComparisonTestContext().realSQLiteReadOnlyIOSmokeTest;

  assertTest(coachReportRealSQLiteReadOnlyIOSmokeTestCannotDriveSelection(model), "smoke test cannot drive selection.");
  assertTest(coachReportRealSQLiteReadOnlyIOSmokeTestCannotMutateOfficialState(model), "smoke test cannot mutate official match state.");
  assertTest(!model.canDriveCoachInstruction, "coach instruction driver must be false.");
  assertTest(!model.canDriveLiveSelection, "live selection driver must be false.");
  assertTest(!model.canDriveProductionRouteResolution, "production route driver must be false.");
  assertTest(!model.canMutateScore, "score mutation must be false.");
  assertTest(!model.canMutateTimeline, "timeline mutation must be false.");
  assertTest(!model.canMutatePossession, "possession mutation must be false.");
  assertTest(!model.canCreateProductionScoringEvents, "production scoring event creation must be false.");
  assertTest(!model.canMutateLineup, "lineup mutation must be false.");
  assertTest(!model.canMutateStarters, "starters mutation must be false.");
  assertTest(!model.canMutateBench, "bench mutation must be false.");
  assertTest(!model.canClaimGlobalEconomy, "global economy claim must be false.");
  assertTest(model.trendProofClaimCount === 0, "trend proof claim count must be 0.");
  assertTest(model.inventedStatisticCount === 0, "invented statistic count must be 0.");
  assertTest(model.sandboxEventsPromotedToOfficialCount === 0, "sandbox promotion count must be 0.");

  return [
    "real SQLite smoke test cannot drive selection",
    "real SQLite smoke test cannot mutate official state",
    "trend proof, invented statistic, and sandbox promotion counts are 0",
  ];
}

const checks = validateCoachReportRealSQLiteReadOnlyIOSmokeTestGuard();

console.log("coachReportRealSQLiteReadOnlyIOSmokeTestGuard tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
